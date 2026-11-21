import { buildSearchIndex, type DocRecord } from '@docsense/core';
import { describe, expect, it, vi } from 'vitest';
import { DocsenseClient } from '../client';

const docs: DocRecord[] = [
  {
    id: 'a',
    title: 'Create ambient session',
    url: '/docs/create',
    pageType: 'howto',
    breadcrumbs: [],
    sections: [],
    body: 'Create a session before streaming audio.',
  },
];

describe('DocsenseClient', () => {
  it('searches a preloaded index without fetch', async () => {
    const client = new DocsenseClient({ index: buildSearchIndex(docs) });
    const result = await client.search({ query: 'ambient session' });
    expect(result.hits[0]?.documentId).toBe('a');
  });

  it('loads index JSON over fetch once', async () => {
    const index = buildSearchIndex(docs);
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify(index), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new DocsenseClient({
      indexUrl: '/docsense/search-index.json',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await client.search({ query: 'streaming audio' });
    await client.search({ query: 'create' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('throws when index fetch fails', async () => {
    const client = new DocsenseClient({
      fetchImpl: (async () => new Response('nope', { status: 404 })) as unknown as typeof fetch,
    });
    await expect(client.search({ query: 'x' })).rejects.toThrow(/Failed to load/);
  });

  it('retries fetch after a failed load instead of sticky-rejecting', async () => {
    const index = buildSearchIndex(docs);
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return new Response('nope', { status: 503 });
      }
      return new Response(JSON.stringify(index), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const client = new DocsenseClient({
      indexUrl: '/docsense/search-index.json',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.search({ query: 'ambient' })).rejects.toThrow(/Failed to load/);
    const result = await client.search({ query: 'ambient' });
    expect(result.hits[0]?.documentId).toBe('a');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('uses globalThis.fetch via a wrapper so browsers do not throw Illegal invocation', async () => {
    const index = buildSearchIndex(docs);
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response(JSON.stringify(index), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const client = new DocsenseClient({ indexUrl: '/docsense/search-index.json' });
      const result = await client.search({ query: 'ambient' });
      expect(calls).toBe(1);
      expect(result.hits[0]?.documentId).toBe('a');
    } finally {
      globalThis.fetch = original;
    }
  });
});
