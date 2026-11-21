# Competitive landscape (Docusaurus search)

Sources: [Docusaurus Search docs](https://docusaurus.io/docs/search), [@easyops-cn/docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local), [@orama/plugin-docusaurus-v3](https://www.npmjs.com/package/@orama/plugin-docusaurus-v3), Pagefind / Typesense ecosystem.

| Capability | Algolia DocSearch | easyops local | Orama v3 | Pagefind | **Docsense** |
| --- | --- | --- | --- | --- | --- |
| No cloud / no approval | ❌ | ✅ | ✅ (OSS) | ✅ | ✅ |
| Index matches every deploy | ❌ (crawl lag) | ✅ | ✅ | ✅ | ✅ |
| ⌘K / Ctrl+K modal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Default result limit **8** | ✅ | ✅ (`searchResultLimits`) | ✅ | ✅ | ✅ + **live − / + UI** |
| Facet / type filters | ✅ | path contexts | ✅ category | basic meta | ✅ **page-type chips** |
| Section hits + breadcrumbs | ✅ | partial | ✅ | ✅ | ✅ |
| Version / language context | ✅ | preferred version | ✅ | filters | ✅ |
| Customize labels / shortcut / CSS | partial | good | good | limited | ✅ first-class |
| Typo tolerance | ✅ | weak (lunr) | ✅ | prefix | ✅ fuzzy |
| Highlight on destination page | ✅ | optional | n/a | ✅ | ✅ |
| English stemming / richer MDX text | ✅ | weak | ✅ | partial | ✅ |
| Ask AI | ✅ (Algolia) | optional ext | cloud | ❌ | out of scope (BYO later) |

**Docsense wedge:** local + deploy-fresh like easyops/Pagefind, **structured docs ranking + filters + adjustable result count** like Orama/Algolia UX, without an account.
