import { describe, expect, it } from 'vitest';
import { indexDocuments } from '../build-index.js';
import { search } from '@docsense/core';

/**
 * Golden relevance cases: the first hit must be the intended doc/section.
 * These guard ranking regressions the same way staff-eng search teams do.
 */
const index = indexDocuments([
  {
    id: 'upload',
    url: '/docs/how-to/upload-prerecorded-audio',
    source: `---
title: Upload pre-recorded ambient audio
pageType: howto
---
# Upload pre-recorded ambient audio
Upload finished audio with a signed URL.
## Get an upload URL
POST /v1/ambient/sessions/{id}/file-uploadurl
`,
  },
  {
    id: 'stream',
    url: '/docs/how-to/stream-live-audio',
    source: `---
title: Stream live ambient audio
---
# Stream live ambient audio
Use websockets for real-time PCM.
`,
  },
  {
    id: 'create',
    url: '/docs/how-to/create-ambient-session',
    source: `---
title: Create an ambient session
---
# Create an ambient session
Create the session before you upload or stream.
`,
  },
]);

const cases: Array<{ query: string; expectDocId: string; expectAnchor?: string }> = [
  { query: 'upload pre-recorded audio', expectDocId: 'upload' },
  { query: 'file-uploadurl', expectDocId: 'upload', expectAnchor: 'get-an-upload-url' },
  { query: 'websocket pcm', expectDocId: 'stream' },
  { query: 'create ambient session', expectDocId: 'create' },
];

describe('golden relevance', () => {
  for (const c of cases) {
    it(`ranks correctly for: ${c.query}`, () => {
      const result = search(index, { query: c.query, limit: 5 });
      expect(result.hits[0]?.documentId).toBe(c.expectDocId);
      if (c.expectAnchor) {
        expect(result.hits[0]?.sectionAnchor).toBe(c.expectAnchor);
      }
    });
  }
});
