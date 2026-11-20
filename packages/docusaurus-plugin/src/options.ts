export interface DocsensePluginOptions {
  /** Docs directories relative to site root. */
  readonly docsDirs?: readonly string[];
  /** Route base path for docs URLs (default: /docs). */
  readonly docsRouteBasePath?: string;
  /** Output path under static/, default docsense/search-index.json */
  readonly indexPath?: string;
  /** Default docs version facet. */
  readonly defaultVersion?: string;
  /** Default language facet. */
  readonly defaultLanguage?: string;
  /** Max results shown in the modal. */
  readonly resultLimit?: number;
}

export const DEFAULT_OPTIONS: Required<DocsensePluginOptions> = {
  docsDirs: ['docs'],
  docsRouteBasePath: '/docs',
  indexPath: 'docsense/search-index.json',
  defaultVersion: 'current',
  defaultLanguage: 'en',
  resultLimit: 8,
};

export function resolveOptions(
  options: DocsensePluginOptions = {},
): Required<DocsensePluginOptions> {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    docsDirs: options.docsDirs ?? DEFAULT_OPTIONS.docsDirs,
  };
}
