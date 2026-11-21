# Compare Docsense with other Docusaurus search options

If you are choosing search for a Docusaurus docs site, these are the options people usually evaluate:

- [Algolia DocSearch](https://docsearch.algolia.com/) (hosted)
- [@easyops-cn/docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local)
- [@orama/plugin-docusaurus-v3](https://www.npmjs.com/package/@orama/plugin-docusaurus-v3)
- [Pagefind](https://pagefind.app/)
- [Docsense](https://github.com/meharshit/docsense) (this project)

Official Docusaurus search guidance is in the [Docusaurus Search docs](https://docusaurus.io/docs/search).

## What Docsense is for

Docsense is local documentation search that updates whenever you deploy. You do not create a search account, wait on a crawler, or run a separate search server. The plugin builds a static index during your normal Docusaurus build and ships a SearchBar with filters, an adjustable page limit, and theming you can control.

In short: it stays as easy to adopt as easyops or Pagefind for local, deploy-fresh search, while giving you structured docs ranking, page-type filters, and a live result-count control closer to what teams expect from Orama or Algolia, without an account.

## Side-by-side comparison

| Capability | Algolia DocSearch | easyops local | Orama v3 | Pagefind | Docsense |
| --- | --- | --- | --- | --- | --- |
| No cloud account or approval | No (required) | Yes | Yes (open source) | Yes | Yes |
| Index matches every deploy | No (crawl lag) | Yes | Yes | Yes | Yes |
| ⌘K / Ctrl+K search modal | Yes | Yes | Yes | Yes | Yes |
| Default result limit of 8 | Yes | Yes (`searchResultLimits`) | Yes | Yes | Yes, plus live − / + in the UI |
| Facet or type filters | Yes | Path contexts | Category filters | Basic metadata | Page-type chips |
| Section hits and breadcrumbs | Yes | Partial | Yes | Yes | Yes |
| Version and language context | Yes | Preferred version | Yes | Filters | Yes |
| Customize labels, shortcut, and CSS | Partial | Good | Good | Limited | First-class |
| Typo tolerance | Yes | Weak (lunr) | Yes | Prefix matching | Fuzzy matching |
| Highlight on the destination page | Yes | Optional | Not applicable | Yes | Yes |
| English stemming and richer MDX text | Yes | Weak | Yes | Partial | Yes |
| Ask AI | Yes (Algolia) | Optional extension | Cloud path | No | Out of scope for now (bring your own later) |

## How to choose

**Start with Docsense** when you want local search on a Docusaurus docs site with the shortest install path: add the plugin, rebuild, and use the navbar SearchBar. The index updates with every deploy, stays on your static hosting, and includes filters and page limits without another service.

**Choose easyops local search** when your team already runs that plugin and lunr-style matching is enough.

**Choose Orama** when you want Orama as the engine, or you expect to move to Orama Cloud later.

**Choose Pagefind** when you need to search a very large static HTML set, including sites that are not only Docusaurus Markdown and MDX.

**Choose Algolia DocSearch** when you want a managed hosted search product, vendor crawling, analytics, or Ask AI, and you are fine creating an external search account.

## Read the full guide

The public docs expand this into a decision guide with setup notes:

[https://meharshit.github.io/docsense/docs/concepts/compare-open-source-search/](https://meharshit.github.io/docsense/docs/concepts/compare-open-source-search/)
