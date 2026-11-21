import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { indexDocuments, serializeIndex } from '@docsense/indexer';
import {
  resolveOptions,
  type DocsensePluginOptions,
  type DocsenseRuntimeConfig,
} from './options';
import { scanDocsDirectories } from './scan-docs';

export type {
  DocsensePluginOptions,
  DocsenseSearchBarOptions,
  DocsenseRuntimeConfig,
} from './options';

type LoadContext = {
  siteDir: string;
  generatedFilesDir: string;
};

/**
 * Docusaurus plugin: indexes Markdown/MDX at build/start time and
 * writes a static JSON index. Also registers the SearchBar theme.
 */
export default function docsensePlugin(
  context: LoadContext,
  opts: DocsensePluginOptions = {},
): {
  name: string;
  getThemePath: () => string;
  getClientModules: () => string[];
  loadContent: () => Promise<DocsenseRuntimeConfig & { documentCount: number }>;
  contentLoaded: (args: {
    content: DocsenseRuntimeConfig & { documentCount: number };
    actions: { setGlobalData: (data: unknown) => void };
  }) => Promise<void>;
} {
  const options = resolveOptions(opts);
  const themePath = join(__dirname, 'theme');
  const clientHighlight = join(__dirname, 'client', 'highlight-on-page.js');

  return {
    name: 'docusaurus-plugin-docsense',

    getThemePath() {
      return themePath;
    },

    getClientModules() {
      return [clientHighlight];
    },

    async loadContent() {
      const sources = scanDocsDirectories({
        siteDir: context.siteDir,
        docsDirs: options.docsDirs,
        docsRouteBasePath: options.docsRouteBasePath,
      });

      const index = indexDocuments(sources, {
        defaultLanguage: options.defaultLanguage,
        defaultVersion: options.defaultVersion,
      });

      const outFile = join(context.siteDir, 'static', options.indexPath);
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, serializeIndex(index), 'utf8');

      const genFile = join(context.generatedFilesDir, 'docsense', 'search-index.json');
      mkdirSync(dirname(genFile), { recursive: true });
      writeFileSync(genFile, serializeIndex(index), 'utf8');

      const runtime: DocsenseRuntimeConfig & { documentCount: number } = {
        indexPath: `/${options.indexPath.replace(/^\/+/, '')}`,
        resultLimit: options.resultLimit,
        searchBar: options.searchBar,
        documentCount: index.meta.documentCount,
      };
      return runtime;
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
}
