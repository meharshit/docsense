---
title: Plugin options
sidebar_position: 1
pageType: reference
description: Configuration for docusaurus-plugin-docsense.
---

# Plugin options

Options for `docusaurus-plugin-docsense`.

## Top-level options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `docsDirs` | `string[]` | `['docs']` | Folders to scan, relative to the site root |
| `docsRouteBasePath` | `string` | `'/docs'` | URL prefix used when building result links |
| `indexPath` | `string` | `'docsense/search-index.json'` | Output path under `static/` |
| `defaultVersion` | `string` | `'current'` | Default version facet on documents |
| `defaultLanguage` | `string` | `'en'` | Default language facet on documents |
| `resultLimit` | `number` | `8` | Initial page count in the modal |
| `searchBar` | `object` | see below | Labels and modal behavior |

## `searchBar` options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `placeholder` | `string` | `'Search docs…'` | Modal input placeholder |
| `triggerLabel` | `string` | `'Search'` | Navbar button label |
| `shortcut` | `string` | `'mod+k'` | Keyboard shortcut |
| `showShortcutHint` | `boolean` | `true` | Show shortcut on the trigger |
| `modalAriaLabel` | `string` | `'Search docs'` | `aria-label` for the modal |
| `emptyResultsLabel` | `string` | `'No results'` | Empty-state message |
| `debounceMs` | `number` | `120` | Query debounce in milliseconds |

## Example

```ts
[
  'docusaurus-plugin-docsense',
  {
    docsDirs: ['docs'],
    docsRouteBasePath: '/docs',
    indexPath: 'docsense/search-index.json',
    defaultVersion: 'current',
    defaultLanguage: 'en',
    resultLimit: 8,
    searchBar: {
      placeholder: 'Search the docs…',
      triggerLabel: 'Search docs',
      shortcut: 'mod+k',
      showShortcutHint: true,
      modalAriaLabel: 'Search docs',
      emptyResultsLabel: 'No results',
      debounceMs: 120,
    },
  },
]
```

## `themeConfig.docsense`

Optional overrides for the SearchBar at theme level:

```ts
themeConfig: {
  docsense: {
    resultLimit: 8,
    searchBar: {
      placeholder: 'Find guides…',
      triggerLabel: 'Search docs',
    },
  },
}
```

## Frontmatter fields Docsense reads

| Field | Effect |
| --- | --- |
| `title` / `sidebar_label` | Document title |
| `pageType` | Filter chip category |
| `version` | Version facet |
| `language` | Language facet |
| `product` | Product facet |
| `tags` / `keywords` | Extra searchable tags |

## Next steps

- **[Customize the search bar](/docs/how-to/customize-search-bar)** - Worked label and shortcut example.
- **[CSS variables](/docs/reference/css-variables)** - Theme tokens for the SearchBar.
- **[Packages](/docs/reference/packages)** - Plugin and library layout.
- **[Support](/docs/support)** - Report config bugs and questions.
