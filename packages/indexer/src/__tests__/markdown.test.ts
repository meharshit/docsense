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
});
