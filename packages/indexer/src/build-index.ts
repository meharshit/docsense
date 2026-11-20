import {
  buildSearchIndex,
  type DocPageType,
  type DocRecord,
  type SearchIndex,
} from '@docsense/core';
import { asString, asStringArray, parseFrontmatter } from './frontmatter.js';
import { parseMarkdownDocument } from './markdown.js';

export interface SourceDocument {
  /** Stable id (usually relative path without extension). */
  readonly id: string;
  /** Public URL path, e.g. /docs/upload-audio */
  readonly url: string;
  /** Raw Markdown or MDX source. */
  readonly source: string;
  readonly pageType?: DocPageType;
  readonly version?: string;
  readonly language?: string;
  readonly product?: string;
  readonly breadcrumbs?: DocRecord['breadcrumbs'];
}

export interface IndexerOptions {
  readonly defaultLanguage?: string;
  readonly defaultVersion?: string;
}

function inferPageType(url: string, explicit?: DocPageType): DocPageType {
  if (explicit) {
    return explicit;
  }
  const lower = url.toLowerCase();
  if (lower.includes('/api') || lower.includes('api-reference')) {
    return 'api';
  }
  if (lower.includes('/blog')) {
    return 'blog';
  }
  if (lower.includes('/how-to') || lower.includes('/howto')) {
    return 'howto';
  }
  if (lower.includes('/tutorial')) {
    return 'tutorial';
  }
  if (lower.includes('/concept')) {
    return 'concept';
  }
  if (lower.includes('/reference')) {
    return 'reference';
  }
  if (lower.includes('/docs')) {
    return 'docs';
  }
  return 'page';
}

/** Convert one source file into a DocRecord. */
export function indexSourceDocument(
  doc: SourceDocument,
  options: IndexerOptions = {},
): DocRecord {
  const { attributes, body } = parseFrontmatter(doc.source);
  const fmTitle = asString(attributes.title) ?? asString(attributes.sidebar_label);
  const parsed = parseMarkdownDocument(body, fmTitle ?? doc.id);

  const tags = asStringArray(attributes.tags) ?? asStringArray(attributes.keywords);

  return {
    id: doc.id,
    title: fmTitle ?? parsed.title,
    url: doc.url,
    pageType: inferPageType(doc.url, doc.pageType ?? (asString(attributes.pageType) as DocPageType | undefined)),
    version: doc.version ?? asString(attributes.version) ?? options.defaultVersion,
    language:
      doc.language ?? asString(attributes.language) ?? options.defaultLanguage ?? 'en',
    product: doc.product ?? asString(attributes.product),
    breadcrumbs: doc.breadcrumbs ?? [],
    sections: parsed.sections,
    body: parsed.bodyText,
    tags,
  };
}

/** Build a full SearchIndex from many source documents. */
export function indexDocuments(
  documents: readonly SourceDocument[],
  options: IndexerOptions = {},
): SearchIndex {
  const records = documents.map((doc) => indexSourceDocument(doc, options));
  return buildSearchIndex(records);
}

/** Serialize index for writing into static site output. */
export function serializeIndex(index: SearchIndex): string {
  return `${JSON.stringify(index)}\n`;
}

/** Parse a previously serialized index (runtime / tests). */
export function parseIndexJson(json: string): SearchIndex {
  const parsed = JSON.parse(json) as SearchIndex;
  if (!parsed?.meta || !Array.isArray(parsed.documents)) {
    throw new Error('Invalid Docsense index JSON');
  }
  if (parsed.meta.version !== 1) {
    throw new Error(`Unsupported Docsense index version: ${String(parsed.meta.version)}`);
  }
  return parsed;
}
