import { describe, expect, it } from 'vitest';
import { buildSearchIndex, search } from '../search';
import type { DocRecord } from '../types';

const docs: DocRecord[] = [
  {
    id: 'upload-audio',
    title: 'Upload pre-recorded ambient audio',
    url: '/docs/upload-prerecorded-audio',
    pageType: 'howto',
    version: '2.0',
    language: 'en',
    breadcrumbs: [{ label: 'How-to' }, { label: 'Ambient' }],
    body: 'Upload a finished audio file to an ambient session using a signed URL.',
    sections: [
      {
        id: 's1',
        title: 'Get an upload URL',
        level: 2,
        anchor: 'get-an-upload-url',
        content: 'Call the file upload URL endpoint, then PUT the audio bytes.',
        code: ['POST /v1/ambient/sessions/{id}/file-uploadurl'],
      },
      {
        id: 's2',
        title: 'End the session',
        level: 2,
        anchor: 'end-the-session',
        content: 'After upload completes, end the session so note generation starts.',
      },
    ],
  },
  {
    id: 'live-stream',
    title: 'Stream live ambient audio',
    url: '/docs/stream-live-audio',
    pageType: 'howto',
    version: '2.0',
    language: 'en',
    breadcrumbs: [{ label: 'How-to' }, { label: 'Ambient' }],
    body: 'Open a websocket and stream PCM audio in real time.',
    sections: [
      {
        id: 's1',
        title: 'Open the websocket',
        level: 2,
        anchor: 'open-the-websocket',
        content: 'Connect with your partner token and session id.',
      },
    ],
  },
  {
    id: 'v1-upload',
    title: 'Upload pre-recorded ambient audio',
    url: '/docs/1.0/upload-prerecorded-audio',
    pageType: 'howto',
    version: '1.0',
    language: 'en',
    breadcrumbs: [{ label: 'How-to' }],
    body: 'Legacy upload flow for ambient audio files.',
    sections: [],
  },
];

describe('search', () => {
  const index = buildSearchIndex(docs);

  it('returns empty hits for blank queries', () => {
    expect(search(index, { query: '   ' }).hits).toEqual([]);
    expect(search(index, { query: 'the and' }).hits).toEqual([]);
  });

  it('ranks the upload how-to above live streaming for upload queries', () => {
    const result = search(index, { query: 'upload pre-recorded audio', limit: 5 });
    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.hits[0]?.documentId).toBe('upload-audio');
  });

  it('returns section-level anchors for endpoint queries', () => {
    const result = search(index, { query: 'file-uploadurl', limit: 5 });
    const hit = result.hits.find((h) => h.sectionAnchor === 'get-an-upload-url');
    expect(hit).toBeDefined();
    expect(hit?.url).toContain('#get-an-upload-url');
  });

  it('respects version context so v1 is hidden on v2', () => {
    const result = search(index, {
      query: 'upload pre-recorded audio',
      context: { version: '2.0', language: 'en' },
      limit: 10,
    });
    expect(result.hits.every((h) => h.version !== '1.0')).toBe(true);
    expect(result.hits.some((h) => h.documentId === 'upload-audio')).toBe(true);
  });

  it('includes breadcrumbs and highlights on hits', () => {
    const result = search(index, { query: 'websocket pcm', limit: 3 });
    const hit = result.hits[0];
    expect(hit?.breadcrumbs.length).toBeGreaterThan(0);
    expect(hit?.highlights.some((h) => h.field === 'body' || h.field === 'section')).toBe(
      true,
    );
  });

  it('diversifies by document so limit is not wasted on one page with many sections', () => {
    const fatPage: DocRecord = {
      id: 'fat',
      title: 'Audio guide',
      url: '/docs/audio-guide',
      pageType: 'howto',
      breadcrumbs: [],
      body: 'Audio audio audio',
      sections: Array.from({ length: 12 }, (_, i) => ({
        id: `s${i}`,
        title: `Audio section ${i}`,
        level: 2 as const,
        anchor: `audio-section-${i}`,
        content: 'Audio streaming details appear in every section.',
      })),
    };
    const other: DocRecord = {
      id: 'other',
      title: 'Authentication',
      url: '/docs/auth',
      pageType: 'howto',
      breadcrumbs: [],
      body: 'Partner token authentication for audio APIs.',
      sections: [],
    };
    const fatIndex = buildSearchIndex([fatPage, other]);
    const result = search(fatIndex, { query: 'audio', limit: 2 });
    const ids = result.hits.map((h) => h.documentId);
    expect(ids).toContain('fat');
    expect(ids).toContain('other');
    expect(new Set(ids).size).toBe(2);
  });
});
