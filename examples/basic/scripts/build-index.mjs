import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexDocuments, serializeIndex } from '@docsense/indexer';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
const docsDir = join(root, 'docs');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.mdx?$/i.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const sources = walk(docsDir).map((file) => {
  const rel = relative(docsDir, file).replace(/\\/g, '/');
  return {
    id: rel.replace(/\.mdx?$/i, ''),
    url: `/docs/${rel.replace(/\.mdx?$/i, '')}`,
    source: readFileSync(file, 'utf8'),
  };
});

const index = indexDocuments(sources);
const outDir = join(root, 'static', 'docsense');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'search-index.json'), serializeIndex(index));
console.log(`Indexed ${index.meta.documentCount} docs → static/docsense/search-index.json`);
