import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanDocsDirectories } from '../scan-docs.js';

describe('scanDocsDirectories', () => {
  it('walks nested markdown and builds urls', () => {
    const root = mkdtempSync(join(tmpdir(), 'docsense-'));
    mkdirSync(join(root, 'docs', 'how-to'), { recursive: true });
    writeFileSync(
      join(root, 'docs', 'how-to', 'upload-audio.md'),
      '---\ntitle: Upload audio\n---\n\n# Upload audio\n\nBody.\n',
      'utf8',
    );
    writeFileSync(join(root, 'docs', 'intro.mdx'), '# Intro\n\nWelcome.\n', 'utf8');

    const docs = scanDocsDirectories({
      siteDir: root,
      docsDirs: ['docs'],
      docsRouteBasePath: '/docs',
    });

    expect(docs).toHaveLength(2);
    expect(docs.map((d) => d.url).sort()).toEqual([
      '/docs/how-to/upload-audio',
      '/docs/intro',
    ]);
    expect(docs.find((d) => d.id === 'how-to/upload-audio')?.breadcrumbs[0]?.label).toBe(
      'How To',
    );
  });
});
