import { buildSearchIndex, type DocRecord } from '@docsense/core';
import { describe, expect, it, vi } from 'vitest';
import { DocsenseClient } from '../client.js';

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
});
