---
title: Compare open-source Docusaurus search
sidebar_position: 4
pageType: concept
description: Choose among Docsense, easyops local search, Orama, Pagefind, and Algolia DocSearch for Docusaurus documentation search.
---

# Compare open-source Docusaurus search

Use this page to choose a search approach for a Docusaurus documentation site. The common options are:

- [Docsense](https://github.com/meharshit/docsense) (this project)
- [@easyops-cn/docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local)
- [@orama/plugin-docusaurus-v3](https://www.npmjs.com/package/@orama/plugin-docusaurus-v3)
- [Pagefind](https://pagefind.app/)
- [Algolia DocSearch](https://docsearch.algolia.com/) (hosted)

For most Docusaurus documentation sites, **Docsense is the default to start with**. You install the plugin, rebuild once, and the SearchBar is available in the navbar. There is no search account, no crawler setup, and no separate search server to run. The index is created during your normal `docusaurus start` / `build` flow.

Choose another option when you already depend on a specific engine, need hosted Ask AI operations, or are indexing a very large non-Docusaurus HTML corpus.

## When to use each option

| Your requirements | Option |
| --- | --- |
| Default local search for a Docusaurus docs site: easiest install and run path, deploy-fresh index, filters, page limits, and theming | **Docsense** |
| An established community local plugin based on lunr | easyops local search |
| Orama as the search engine inside Docusaurus, including a path to Orama Cloud | Orama Docusaurus plugin |
| Search across a very large static HTML corpus, including non-Docusaurus output | Pagefind |
| Hosted search operations, crawler workflow, and Ask AI from the search vendor | Algolia DocSearch |

## How the options differ

| Capability | Docsense | easyops local | Orama (Docusaurus v3) | Pagefind | Algolia DocSearch |
| --- | --- | --- | --- | --- | --- |
| Deployment model | Local static index | Local static index | Local (OSS), optional cloud | Local static index | Hosted |
| Account required | No | No | No for local use | No | Yes |
| Index updates | With each docs build | With each docs build | With each docs build | With your Pagefind build | Crawl or sync schedule |
| Docusaurus plugin and SearchBar | Included | Included | Included | Integrate separately | DocSearch theme |
| Keyboard shortcut modal | Yes | Yes | Yes | With your UI | Yes |
| Result filters | Page-type chips | Path contexts | Category-style filters | Metadata filters | Facets |
| Page-limit control in the UI | − / + in the modal (3 to 20) | Configured limits | Configured limits | Configured limits | Fixed product UX |
| Section results and breadcrumbs | Yes | Partial | Yes | Yes | Yes |
| Typo tolerance | Fuzzy matching with ranking | lunr-based | Strong | Prefix-oriented | Strong |
| English stemming and MDX text extraction | Yes | Limited | Yes | Partial | Yes |
| Highlight on the destination page | Yes | Optional | Limited | Yes | Yes |
| Labels, shortcut, and CSS customization | Documented first-class options | Supported | Supported | Limited | Partial |
| Built-in Ask AI | On the [feature roadmap](/docs/features/overview#feature-roadmap) | Extensions | Cloud path | No | Yes |
| Setup path | Install plugin and rebuild | Install plugin and configure | Install Orama plugin and configure | Add Pagefind build + wire UI | Create Algolia app and DocSearch setup |
| Typical fit | Default for Docusaurus docs sites | Docusaurus sites using lunr local search | Teams standardized on Orama | Very large static sites | Managed hosted search |

## Why Docsense is the default

Docsense is built so the shortest path to working search is also a complete docs SearchBar:

1. Add `docusaurus-plugin-docsense` to your config.
2. Run `docusaurus start` or `docusaurus build`.
3. Open search from the navbar or with **⌘K** / **Ctrl+K**.

You get a deploy-fresh local index, page-type filters, a live page-limit control (3 to 20), typo-tolerant ranking, destination-page highlighting, and documented theming, without standing up another service.

Other options remain the right choice when their constraints match your project. They usually take more integration work, a different engine commitment, or a hosted account.

## What Docsense provides

- **Build-time index.** The plugin writes `search-index.json` during `docusaurus start` and `docusaurus build`, so the index matches the site you deploy.
- **In-browser queries.** Readers search against that static file. There is no Docsense query service.
- **Documentation-oriented ranking.** Titles, sections, code, breadcrumbs, and body text are weighted for docs content.
- **SearchBar controls.** Page-type filters and a **Pages − / +** control help readers narrow results. The page count cannot go below **3** or above **20**.
- **Theming and copy.** Labels, shortcut, empty-state text, and CSS variables are part of the supported configuration surface.

For behavior details, see [How Docsense works](/docs/concepts/how-docsense-works) and [Features overview](/docs/features/overview).

## Decision guide

### Docsense

Use Docsense as the default when you are building or upgrading search on a Docusaurus documentation site and you want the simplest install-and-run path.

It also fits when:

- You need an open-source local search path with no search vendor account.
- The search index must update with every documentation deploy.
- Readers need filters, typo tolerance, and a branded SearchBar.
- Private or internal documentation must stay inside your build and static hosting boundary.

Next step: [Install Docsense](/docs/how-to/install).

### easyops local search

Choose easyops local search when:

- Your team already runs `@easyops-cn/docusaurus-search-local`.
- lunr-style matching meets your relevance requirements.
- You want a widely adopted community plugin and do not need Docsense’s page-type chips or live page-limit control.

### Orama Docusaurus plugin

Choose the Orama plugin when:

- You want Orama as the underlying search engine.
- You expect to use Orama Cloud or other Orama deployments later.
- Category-style filtering and Orama’s relevance model match your information architecture.

### Pagefind

Choose Pagefind when:

- The documentation set is large enough that a single up-front index download is a concern.
- You index mixed static HTML, not only Docusaurus Markdown and MDX.
- You can own the search UI and Docusaurus integration yourself.

Docsense currently ships one static JSON index per site. Sharded indexes are listed on the [feature roadmap](/docs/features/overview#feature-roadmap).

### Algolia DocSearch

Choose Algolia DocSearch when:

- You want a managed hosted search service.
- You need vendor-operated crawling, analytics, or Ask AI.
- Your security and procurement process allows an external search account.

## Current Docsense scope

In the current release, Docsense:

- Ships a single static JSON index per site
- Uses English-first tokenization and stemming
- Does not include a built-in Ask AI panel
- Targets documentation sites and developer portals

Planned work is listed under [Feature roadmap](/docs/features/overview#feature-roadmap).

## Next steps

- **[Why Docsense](/docs/concepts/why-docsense)** - Market problem and business case.
- **[Install Docsense](/docs/how-to/install)** - Add local search to your Docusaurus site.
- **[Features overview](/docs/features/overview)** - Current capabilities and roadmap.
- **[How Docsense works](/docs/concepts/how-docsense-works)** - Build-time index and in-browser queries.
- **[FAQ](/docs/faq)** - Common product questions.
