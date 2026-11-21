---
title: Packages
sidebar_position: 3
pageType: reference
description: npm packages that make up Docsense.
---

# Packages

Docsense is a small monorepo of packages. Most Docusaurus sites only need the plugin.

| Package | Install when | Responsibility |
| --- | --- | --- |
| `docusaurus-plugin-docsense` | Always for Docusaurus | Index on build, SearchBar theme, plugin options |
| `@docsense/runtime` | Custom UI or Node scripts | `DocsenseClient` that loads the JSON index and runs `search()` |
| `@docsense/indexer` | Custom pipelines | Parse Markdown/MDX and serialize the index |
| `@docsense/core` | Custom engines or tests | Tokenization, ranking, and pure `search(index, options)` |

## Runtime client (advanced)

```ts
import { DocsenseClient } from '@docsense/runtime';

const client = new DocsenseClient({
  indexUrl: '/docsense/search-index.json',
});

const result = await client.search({ query: 'install plugin', limit: 8 });
```

## License

MIT. Source: [github.com/meharshit/docsense](https://github.com/meharshit/docsense).

## Next steps

- **[Install Docsense](/docs/how-to/install)** - Use the plugin on a Docusaurus site.
- **[How Docsense works](/docs/concepts/how-docsense-works)** - How the packages fit together at build and runtime.
- **[Plugin options](/docs/reference/plugin-options)** - Configuration reference.
- **[Support](/docs/support)** - Report issues and follow the project.
