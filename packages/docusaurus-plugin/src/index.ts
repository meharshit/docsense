import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexDocuments, serializeIndex } from '@docsense/indexer';
import { resolveOptions, type DocsensePluginOptions } from './options.js';
import { scanDocsDirectories } from './scan-docs.js';

export type { DocsensePluginOptions } from './options.js';

type LoadContext = {
  siteDir: string;
  generatedFilesDir: string;
};

/**
 * Docusaurus plugin: indexes Markdown/MDX at build/start time and
 * writes a static JSON index. Also registers the SearchBar theme.
 *
 * No cloud. No crawler. Index ships with the site.
 */
export default function docsensePlugin(
  context: LoadContext,
  opts: DocsensePluginOptions = {},
): {
  name: string;
  getThemePath: () => string;
  loadContent: () => Promise<{ documentCount: number }>;
  contentLoaded: (args: {
    content: { documentCount: number };
    actions: { setGlobalData: (data: unknown) => void };
  }) => Promise<void>;
} {
  const options = resolveOptions(opts);
  const themePath = join(dirname(fileURLToPath(import.meta.url)), 'theme');

  return {
    name: 'docusaurus-plugin-docsense',

    getThemePath() {
      return themePath;
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

      // Also mirror into generated files for tooling/debug.
      const genFile = join(context.generatedFilesDir, 'docsense', 'search-index.json');
      mkdirSync(dirname(genFile), { recursive: true });
      writeFileSync(genFile, serializeIndex(index), 'utf8');

      return { documentCount: index.meta.documentCount };
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData({
        indexPath: `/${options.indexPath.replace(/^\/+/, '')}`,
        resultLimit: options.resultLimit,
        documentCount: content.documentCount,
      });
    },
  };
}
