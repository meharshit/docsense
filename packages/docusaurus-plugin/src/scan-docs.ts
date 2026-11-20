import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { SourceDocument } from '@docsense/indexer';

const DOC_EXTENSIONS = new Set(['.md', '.mdx']);

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }

  for (const entry of entries) {
    if (entry.startsWith('.')) {
      continue;
    }
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    const lower = entry.toLowerCase();
    if ([...DOC_EXTENSIONS].some((ext) => lower.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function toPosix(path: string): string {
  return path.split(sep).join('/');
}

function fileToUrl(relPath: string, routeBasePath: string): string {
  const withoutExt = relPath.replace(/\.(md|mdx)$/i, '');
  const cleaned = withoutExt
    .replace(/(^|\/)index$/i, '$1')
    .replace(/\/+$/, '');
  const base = routeBasePath.replace(/\/+$/, '') || '';
  const path = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return `${base}${path}`.replace(/\/+/g, '/') || '/';
}

export function scanDocsDirectories(input: {
  readonly siteDir: string;
  readonly docsDirs: readonly string[];
  readonly docsRouteBasePath: string;
}): SourceDocument[] {
  const documents: SourceDocument[] = [];

  for (const docsDir of input.docsDirs) {
    const absDir = join(input.siteDir, docsDir);
    const files = walk(absDir);
    for (const file of files) {
      const rel = toPosix(relative(absDir, file));
      const id = rel.replace(/\.(md|mdx)$/i, '');
      const source = readFileSync(file, 'utf8');
      documents.push({
        id,
        url: fileToUrl(rel, input.docsRouteBasePath),
        source,
        breadcrumbs: breadcrumbFromPath(rel),
      });
    }
  }

  return documents;
}

function breadcrumbFromPath(relPath: string): { label: string; href?: string }[] {
  const parts = relPath.replace(/\.(md|mdx)$/i, '').split('/').filter(Boolean);
  if (parts.length <= 1) {
    return [{ label: 'Docs' }];
  }
  return parts.slice(0, -1).map((part) => ({
    label: part
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
  }));
}
