---
title: Install Docsense
sidebar_position: 1
pageType: howto
description: Add Docsense search to a Docusaurus site.
---

# Install Docsense

Add local documentation search to an existing Docusaurus project.

## Before you start

You need:

- A Docusaurus site (v3 recommended)
- Node.js 18 or newer
- Markdown or MDX docs under a folder such as `docs/`

## Install the plugin

From your site root:

```bash
npm install docusaurus-plugin-docsense
```

## Add the plugin to your config

In `docusaurus.config.js` or `docusaurus.config.ts`:

```ts
import docsensePlugin from 'docusaurus-plugin-docsense';

export default {
  plugins: [
    [
      docsensePlugin,
      {
        docsDirs: ['docs'],
        docsRouteBasePath: '/docs',
        resultLimit: 8,
        searchBar: {
          placeholder: 'Search the docs…',
          triggerLabel: 'Search docs',
          shortcut: 'mod+k',
          showShortcutHint: true,
        },
      },
    ],
  ],
};
```

The plugin registers a SearchBar theme component. Docusaurus picks it up for the navbar search slot.

## Start the site

```bash
npm run start
```

Open the site, then press **⌘K** or **Ctrl+K**, or click **Search docs** in the navbar.

On start and build, Docsense writes:

```text
static/docsense/search-index.json
```

## Optional: themeConfig overrides

You can also set labels and the default page limit under `themeConfig.docsense`:

```ts
themeConfig: {
  docsense: {
    resultLimit: 8,
    searchBar: {
      placeholder: 'Find guides and references…',
      triggerLabel: 'Search docs',
    },
  },
},
```

## Next steps

- **[Customize the search bar](/docs/how-to/customize-search-bar)** - Labels, shortcut, and empty-state copy.
- **[Style the search UI](/docs/how-to/style-search)** - Colors, radius, and modal chrome.
- **[Use filters and page limits](/docs/how-to/use-filters-and-limits)** - Page-type chips and the 3 to 20 page control.
- **[Plugin options](/docs/reference/plugin-options)** - Full configuration reference.
- **[FAQ](/docs/faq)** - Common install and product questions.
