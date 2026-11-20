import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { search } from '@docsense/core';
import { parseIndexJson } from '@docsense/indexer';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
const query = process.argv.slice(2).join(' ') || 'upload audio';
const index = parseIndexJson(
  readFileSync(join(root, 'static', 'docsense', 'search-index.json'), 'utf8'),
);
const result = search(index, { query, limit: 5 });

console.log(`Query: ${query}`);
for (const hit of result.hits) {
  console.log(`- (${hit.score.toFixed(1)}) ${hit.title} → ${hit.url}`);
  if (hit.sectionTitle) {
    console.log(`    section: ${hit.sectionTitle}`);
  }
}
