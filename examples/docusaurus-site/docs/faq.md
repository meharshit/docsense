---
title: FAQ
sidebar_position: 1
pageType: docs
description: Answers to common questions about installing and using Docsense.
---

# FAQ

## Does Docsense require an Algolia account?

No. Docsense indexes your docs at build time and searches in the browser against a static JSON file. There is no Docsense cloud account and no crawler approval step.

## Where is the search index stored?

By default the plugin writes:

```text
static/docsense/search-index.json
```

That file deploys with your site. You can change the path with the plugin `indexPath` option. See [Indexing](/docs/concepts/indexing).

## Why does the Pages − control stop at 3?

The SearchBar clamps the visible page count between **3** and **20**. At 3, the − button is disabled. At 20, the + button is disabled. The default starting value is **8**. See [Use filters and page limits](/docs/how-to/use-filters-and-limits).

## Can readers filter by page type?

Yes. When results include more than one page type, the modal shows chips such as How-to, Concept, and Reference. Types come from folder paths or from `pageType` in frontmatter.

## Does search work for private or internal docs?

Yes, as long as readers can load your static site (and the index file). Docsense does not send document content to a Docsense server for indexing or querying.

## Does Docsense index MDX?

Yes. The indexer reads Markdown and MDX, including many string attributes such as `title` and `description`. Put critical terms in headings or prose when possible. See [MDX extraction and stemming](/docs/features/mdx-and-stemming).

## Will a typo still find the right page?

Often yes. Docsense uses exact, prefix, and fuzzy matching, plus English stemming. Short tokens allow fewer edits than longer tokens. See [Ranking and typos](/docs/concepts/ranking-and-typos).

## How do I change the SearchBar label or colors?

- Labels, shortcut, and empty-state copy: [Customize the search bar](/docs/how-to/customize-search-bar)
- Colors and radius: [Style the search UI](/docs/how-to/style-search)

## Why does Docsense exist if Algolia and other search options already exist?

Hosted and existing local options leave gaps around deploy freshness, private-docs data boundaries, and docs-native SearchBar UX. See [Why Docsense](/docs/concepts/why-docsense).

## How does Docsense compare with easyops, Orama, Pagefind, and Algolia?

See [Compare open-source Docusaurus search](/docs/concepts/compare-open-source-search).

## Is Ask AI included?

Not in the current release. Optional Ask AI integration is on the [feature roadmap](/docs/features/overview#feature-roadmap).

## Next steps

- **[Support](/docs/support)** - Where to report issues and follow the project.
- **[Install Docsense](/docs/how-to/install)** - Add the plugin and rebuild once.
- **[Features overview](/docs/features/overview)** - Current capabilities and roadmap.
