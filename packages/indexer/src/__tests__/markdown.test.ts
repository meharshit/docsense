import { describe, expect, it } from 'vitest';
import {
  extractMdxReadableText,
  parseMarkdownDocument,
  slugify,
  toPlainText,
} from '../markdown';

describe('slugify', () => {
  it('creates github-like anchors', () => {
    expect(slugify('Get an upload URL')).toBe('get-an-upload-url');
    expect(slugify('POST /sessions')).toBe('post-sessions');
  });
});

describe('toPlainText', () => {
  it('strips markdown and html noise', () => {
    expect(toPlainText('Call the [endpoint](/api) with `sessionId`.')).toBe(
      'Call the endpoint with sessionId.',
    );
  });
});

describe('extractMdxReadableText', () => {
  it('keeps textish JSX attributes searchable', () => {
    const text = extractMdxReadableText(`
import { Card } from './card';

<Card title="secret term xyzzy" description="Install the plugin" />

Plain prose.
`);
    expect(text).toContain('secret term xyzzy');
    expect(text).toContain('Install the plugin');
    expect(text).not.toMatch(/import\s+\{/);
  });

  it('feeds MDX attributes into bodyText via toPlainText', () => {
    const parsed = parseMarkdownDocument(`# Guides

<Tip title="Stemming matches word forms">
Useful for installing vs install.
</Tip>
`);
    expect(parsed.bodyText.toLowerCase()).toContain('stemming matches word forms');
  });
});

describe('parseMarkdownDocument', () => {
  it('extracts title, sections, and code', () => {
    const md = `# Upload audio

Intro paragraph.

## Get an upload URL

Call the endpoint.

\`\`\`bash
curl -X POST /file-uploadurl
\`\`\`

## End the session

Finish processing.
`;

    const parsed = parseMarkdownDocument(md);
    expect(parsed.title).toBe('Upload audio');
    expect(parsed.sections).toHaveLength(2);
    expect(parsed.sections[0]?.anchor).toBe('get-an-upload-url');
    expect(parsed.sections[0]?.code?.[0]).toContain('file-uploadurl');
    expect(parsed.bodyText).toContain('Intro paragraph');
    expect(parsed.bodyText).toContain('Finish processing');
  });

  it('indexes H2, H3, and H4 ATX headings as searchable sections', () => {
    const parsed = parseMarkdownDocument(`# Page

## Why use Docsense

Local search.

### Install the plugin

npm install.

#### Advanced filters

Chip filters.
`);
    expect(parsed.sections.map((s) => [s.level, s.title, s.anchor])).toEqual([
      [2, 'Why use Docsense', 'why-use-docsense'],
      [3, 'Install the plugin', 'install-the-plugin'],
      [4, 'Advanced filters', 'advanced-filters'],
    ]);
  });

  it('indexes Docusaurus Heading and HTML heading tags as sections', () => {
    const parsed = parseMarkdownDocument(`# MDX page

<Heading as="h2">Why use Docsense</Heading>

Body under JSX heading.

<h3>Install the plugin</h3>

More body.

<Heading as={'h4'}>Advanced filters</Heading>
`);
    expect(parsed.sections).toHaveLength(3);
    expect(parsed.sections[0]).toMatchObject({
      level: 2,
      title: 'Why use Docsense',
      anchor: 'why-use-docsense',
    });
    expect(parsed.sections[1]).toMatchObject({
      level: 3,
      title: 'Install the plugin',
    });
    expect(parsed.sections[2]).toMatchObject({
      level: 4,
      title: 'Advanced filters',
    });
    expect(parsed.sections[0]?.content).toContain('Body under JSX heading');
  });

  it('indexes setext H2 headings', () => {
    const parsed = parseMarkdownDocument(`Page title
=========

Why use Docsense
-----------------

Because it is local.
`);
    expect(parsed.title).toBe('Page title');
    expect(parsed.sections[0]).toMatchObject({
      level: 2,
      title: 'Why use Docsense',
      anchor: 'why-use-docsense',
    });
  });
});
