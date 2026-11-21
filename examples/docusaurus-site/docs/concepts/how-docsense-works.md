---
title: How Docsense works
sidebar_position: 1
pageType: concept
description: The build-time index and browser search flow.
---

# How Docsense works

Docsense has two stages: **index at build time**, then **search in the browser**.

## Build time

When you run `docusaurus start` or `docusaurus build`, the plugin:

1. Scans the docs directories you set in `docsDirs` (default: `docs`)
2. Parses each Markdown or MDX file into a structured record (title, sections, body, page type)
3. Writes `static/docsense/search-index.json` (path is configurable)

That file is a normal static asset. Deploy it with the rest of your site.

## Runtime

When a reader opens search:

1. The SearchBar loads the JSON index once (lazy load)
2. Each query runs in memory with tokenization, fuzzy matching, and ranking
3. The modal shows page-level results, optional filters, and the page limit you choose

There is no Docsense API server. If the static index file is available, search works.

## Packages

| Package | Role |
| --- | --- |
| `@docsense/core` | Tokenize, rank, and `search()` |
| `@docsense/indexer` | Parse Markdown/MDX and build the index |
| `@docsense/runtime` | Browser/Node client that loads the JSON file |
| `docusaurus-plugin-docsense` | Wires indexing into Docusaurus and provides the SearchBar |

Most sites only install the plugin. The other packages are used underneath, or when you want a custom UI.

## Compared to hosted search

| Hosted search (for example Algolia DocSearch) | Docsense |
| --- | --- |
| External crawler or push API | Index during your docs build |
| Query hits a cloud service | Query runs in the browser |
| Freshness depends on crawl or sync jobs | Freshness matches your last deploy |

Choose hosted search when you need a managed platform at large scale. Choose Docsense when you want search to stay inside your docs build and deploy.

For the full open-source comparison (Docsense vs easyops, Orama, Pagefind, and DocSearch), see [Compare open-source Docusaurus search](/docs/concepts/compare-open-source-search).

## Next steps

- **[Install Docsense](/docs/how-to/install)** - Add the plugin and rebuild once.
- **[Indexing](/docs/concepts/indexing)** - What the build writes into the index.
- **[Compare open-source Docusaurus search](/docs/concepts/compare-open-source-search)** - Choose among common Docusaurus search options.
- **[Packages](/docs/reference/packages)** - Plugin and library layout.
- **[FAQ](/docs/faq)** - Common product questions.
