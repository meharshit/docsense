# Docsense

**Open-source, build-time documentation search for Docusaurus.**

No Algolia account. No crawler approval. No cloud to host.  
The search index is generated when you build your docs and ships as static JSON.

> Search that deploys with your docs.

## Why not Algolia DocSearch?

| | Algolia DocSearch | Docsense |
| --- | --- | --- |
| Setup | Apply + keys + crawler | `npm i` + plugin |
| Freshness | Crawl schedule (often weekly) | Every build / deploy |
| Private docs | Awkward / paid path | Works offline & private |
| Lock-in | Hosted proprietary crawler | MIT, inspectable |
| Index source | HTML crawl | Markdown / MDX structure |

Algolia is excellent at global hosted search. Docsense wins when you want **ownership, privacy, and deploy-fresh results**.

## Packages

| Package | Role |
| --- | --- |
| `@docsense/core` | Document model, tokenization, ranking, `search()` |
| `@docsense/indexer` | MD/MDX → structured `SearchIndex` |
| `@docsense/runtime` | Lazy browser/Node client |
| `docusaurus-plugin-docsense` | Docusaurus plugin + SearchBar theme |

## Quick start (Docusaurus v3)

```bash
npm install docusaurus-plugin-docsense
```

```js
 // docusaurus.config.js
 export default {
   plugins: [
     [
       'docusaurus-plugin-docsense',
       {
         docsDirs: ['docs'],
         docsRouteBasePath: '/docs',
       },
     ],
   ],
 };
```

Build your site. The plugin writes `static/docsense/search-index.json` and registers a navbar SearchBar (⌘K / Ctrl+K).

> Tip: run a full `docusaurus build` (or restart `start` after the first index write) so the JSON exists under `static/`.

## How we test

| Layer | What |
| --- | --- |
| **Unit** | Tokenizer, fuzzy match, context filters, ranking, markdown/frontmatter parsing |
| **Integration** | Index → serialize → parse → search round-trip |
| **Golden queries** | Fixture docs; assert the right page/section ranks first |
| **Plugin** | Temp filesystem scan of nested `.md` / `.mdx` |
| **CI** | GitHub Actions: install, typecheck, test, build on every push |

```bash
npm install
npm test
npm run build
```

## Roadmap

- **MVP (this repo):** local lexical search, section hits, version/language context, Docusaurus plugin
- **Next:** hybrid / intent ranking, richer MDX component stripping, highlight-on-page
- **Later:** optional BYO-LLM “ask docs”, agent chunk export (same index)

## License

MIT © [meharshit](https://github.com/meharshit)
