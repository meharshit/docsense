import { search } from '@docsense/core';
import { describe, expect, it } from 'vitest';
import {
  indexDocuments,
  indexSourceDocument,
  parseIndexJson,
  serializeIndex,
} from '../build-index.js';

const sampleSource = `---
title: Upload pre-recorded ambient audio
pageType: howto
version: "2.0"
tags: [audio, ambient]
---

# Upload pre-recorded ambient audio

Use this flow when audio already exists.

## Get an upload URL

Request a signed URL, then upload bytes.

\`\`\`http
POST /v1/ambient/sessions/{id}/file-uploadurl
\`\`\`
`;

describe('indexSourceDocument', () => {
  it('maps frontmatter and markdown into a DocRecord', () => {
    const record = indexSourceDocument({
      id: 'upload-prerecorded-audio',
      url: '/docs/how-to/upload-prerecorded-audio',
      source: sampleSource,
      breadcrumbs: [{ label: 'How-to' }, { label: 'Ambient' }],
    });

    expect(record.title).toBe('Upload pre-recorded ambient audio');
    expect(record.pageType).toBe('howto');
    expect(record.version).toBe('2.0');
    expect(record.tags).toEqual(['audio', 'ambient']);
    expect(record.sections[0]?.code?.[0]).toContain('file-uploadurl');
  });
});

describe('indexDocuments + serialize', () => {
  it('builds a searchable round-trippable index', () => {
    const index = indexDocuments([
      {
        id: 'upload-prerecorded-audio',
        url: '/docs/how-to/upload-prerecorded-audio',
        source: sampleSource,
      },
      {
        id: 'stream-live',
        url: '/docs/how-to/stream-live',
        source: `# Stream live audio\n\nOpen a websocket and send PCM frames.\n`,
      },
    ]);

    expect(index.meta.version).toBe(1);
    expect(index.meta.documentCount).toBe(2);

    const json = serializeIndex(index);
    const restored = parseIndexJson(json);
    const result = search(restored, { query: 'file-uploadurl' });

    expect(result.hits[0]?.documentId).toBe('upload-prerecorded-audio');
    expect(result.hits[0]?.url).toContain('#get-an-upload-url');
  });

  it('rejects invalid index JSON', () => {
    expect(() => parseIndexJson('{"meta":{},"documents":null}')).toThrow(/Invalid/);
  });
});
