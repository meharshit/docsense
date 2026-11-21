---
title: Features overview
sidebar_position: 1
pageType: docs
description: Current Docsense SearchBar and indexing capabilities, plus the public feature roadmap.
---

# Features overview

Docsense adds local documentation search to Docusaurus: a navbar SearchBar, a build-time index, and in-browser queries against a static JSON file you own.

This page lists what ships today, then the planned work on the public roadmap.

## Available now

### Search from the navbar

Docsense registers a SearchBar in the Docusaurus navbar. Readers open it from the trigger control or with:

- macOS: **⌘K**
- Windows and Linux: **Ctrl+K**

You can change the trigger label, placeholder, shortcut, and empty-state copy. See [Customize the search bar](/docs/how-to/customize-search-bar).

### Build-time indexing

Docsense does not crawl your published site. On `docusaurus start` and `docusaurus build`, the plugin scans your Markdown and MDX, extracts searchable text (including many MDX string attributes), and writes `static/docsense/search-index.json`.

The index deploys with the rest of your static assets, so search freshness matches the build you shipped.

### Section-level results

Results can deep-link to a heading. Each hit includes breadcrumbs and a short snippet so readers can judge relevance before they click.

### Filters and page limits

The modal can filter by page type (How-to, Concept, Reference, and related types inferred from paths or frontmatter).

The default page limit is **8**. Readers change it with **Pages − / +**. The control stops at **3** on the low end and **20** on the high end; those buttons disable at the edges. See [Use filters and page limits](/docs/how-to/use-filters-and-limits).

### Typo tolerance and stemming

Queries use exact, prefix, and fuzzy matching, plus English stemming so forms such as `installing` and `install` connect. Details live in [Ranking and typos](/docs/concepts/ranking-and-typos) and [MDX extraction and stemming](/docs/features/mdx-and-stemming).

### Highlight on the destination page

After a reader opens a result, Docsense can mark matching terms on the destination page so the jump from search to content stays oriented. See [Highlight terms on the page](/docs/features/highlight-on-page).

### Custom look and feel

Theme the SearchBar with CSS variables (colors, radius, modal chrome, and mark styles). This site’s deep green and gold theme is documented with a worked example in [Style the search UI](/docs/how-to/style-search).

## Feature roadmap

The following capabilities are planned. They are not available in the current release.

| Capability | Direction |
| --- | --- |
| Sharded indexes | Split large indexes so the browser can load only the fragments a query needs. Intended for documentation sites whose single JSON index becomes too large to download up front. |
| Broader language support | Expand tokenization and stemming beyond the current English-first path, including CJK and additional locales. |
| Optional Ask AI integration | Support partner- or self-hosted answer experiences on top of the existing search index, without requiring a Docsense-hosted model service. |

### Sharded indexes

Today Docsense ships one static JSON index per site. That model is simple, inspectable, and a strong fit for typical documentation sets.

Sharding is the roadmap path for very large corpora: a new index layout, a loader that fetches fragments on demand, and caching so repeat queries stay fast. Until that ships, prefer Docsense for sites where a single index download is acceptable. For multi-site HTML at extreme scale, [Pagefind](https://pagefind.app/) remains a common alternative. See [Compare open-source Docusaurus search](/docs/concepts/compare-open-source-search).

## Next steps

- **[Install Docsense](/docs/how-to/install)** - Add the plugin and rebuild once.
- **[How Docsense works](/docs/concepts/how-docsense-works)** - Build-time index and in-browser search flow.
- **[Use filters and page limits](/docs/how-to/use-filters-and-limits)** - Page-type chips and the 3 to 20 page control.
- **[Compare open-source Docusaurus search](/docs/concepts/compare-open-source-search)** - How Docsense relates to other search options.
- **[FAQ](/docs/faq)** - Common product questions.
