---
title: Customize the search bar
sidebar_position: 2
pageType: howto
description: Change SearchBar labels, shortcut, debounce, and empty-state copy with a worked config example.
---

# Customize the search bar

This page is about **labels and behavior** (what the button says, the shortcut, empty copy). For colors and radius, see [Style the search UI](/docs/how-to/style-search). That guide includes a visual worked example.

## Worked example on this site

This documentation site uses the config below. Look at the navbar: the trigger says **Search docs**, the shortcut hint is **⌘K** / **Ctrl+K**, and the modal placeholder is **Find guides, APIs, how-tos…**.

| Control | Default | This site |
| --- | --- | --- |
| Trigger label | `Search` | `Search docs` |
| Placeholder | `Search docs…` | `Find guides, APIs, how-tos…` |
| Empty results | `No results` | `Nothing matched. Try another phrase` |
| Debounce | `120` ms | `100` ms |
| Default pages | `8` | `8` |

:::tip
Open **⌘K** now and compare the labels to the table. That is the customization working, not a separate demo component.
:::

## Copy this config

```ts title="docusaurus.config.ts"
plugins: [
  [
    'docusaurus-plugin-docsense',
    {
      docsDirs: ['docs'],
      docsRouteBasePath: '/docs',
      resultLimit: 8,
      searchBar: {
        placeholder: 'Find guides, APIs, how-tos…',
        triggerLabel: 'Search docs',
        shortcut: 'mod+k',
        showShortcutHint: true,
        modalAriaLabel: 'Search docs',
        emptyResultsLabel: 'Nothing matched. Try another phrase',
        debounceMs: 100,
      },
    },
  ],
],
```

Optional overrides under `themeConfig.docsense` (also used on this site):

```ts
themeConfig: {
  docsense: {
    resultLimit: 8,
    searchBar: {
      placeholder: 'Find guides, APIs, how-tos…',
      triggerLabel: 'Search docs',
    },
  },
},
```

## What each field does

| Field | Default | Purpose |
| --- | --- | --- |
| `placeholder` | `Search docs…` | Text inside the modal input |
| `triggerLabel` | `Search` | Navbar button label |
| `shortcut` | `mod+k` | Keyboard shortcut (`mod` is ⌘ on macOS and Ctrl elsewhere) |
| `showShortcutHint` | `true` | Show the shortcut key on the trigger |
| `modalAriaLabel` | `Search docs` | Accessible name for the modal |
| `emptyResultsLabel` | `No results` | Copy when a query has no hits |
| `debounceMs` | `120` | Wait time before running a query while typing |

## Change the default page count

`resultLimit` sets the starting number of pages in the modal (default **8**). Readers can still change it with **Pages − / +**. The UI clamps that control between **3** and **20**, and disables − or + at those edges so the count cannot go below 3 or above 20.

```ts
{
  resultLimit: 10,
}
```

## Point at different docs folders

```ts
{
  docsDirs: ['docs', 'guides'],
  docsRouteBasePath: '/docs',
}
```

`docsRouteBasePath` must match how Docusaurus serves those pages so result links resolve correctly.

## Next steps

- **[Style the search UI](/docs/how-to/style-search)** - Deep green and gold worked example with CSS.
- **[Use filters and page limits](/docs/how-to/use-filters-and-limits)** - How readers narrow results in the modal.
- **[Plugin options](/docs/reference/plugin-options)** - Full `searchBar` and `resultLimit` fields.
- **[FAQ](/docs/faq)** - Common product questions.
