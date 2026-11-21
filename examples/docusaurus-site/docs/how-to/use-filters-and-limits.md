---
title: Use filters and page limits
sidebar_position: 4
pageType: howto
description: Narrow search results by page type and control how many pages appear.
---

# Use filters and page limits

The search modal includes two controls above the result list.

## Filter by page type

After you type a query, Docsense shows chips such as **All**, **How-to**, or **Concept** when those types appear in the results.

1. Open search (**⌘K** / **Ctrl+K**).
2. Enter a query.
3. Click a chip to keep only that page type.
4. Click **All** to clear the filter.

If a chip no longer appears for a new query, Docsense falls back to **All**.

Page types come from your folder paths or from `pageType` in frontmatter. See [Indexing](/docs/concepts/indexing).

## Change how many pages are shown

Next to the filters, use **Pages − / +**:

- Default: **8** pages
- Minimum: **3** (the − button disables at 3; the modal will not show fewer than three pages)
- Maximum: **20** (the + button disables at 20)

That floor of three is intentional. It keeps the result list usable and matches the clamp in the SearchBar UI.

This limit counts **pages**, not every section under a page. Docsense keeps the best matching section for each page in the list.

## Author tip for better filters

Group docs in clear folders:

```text
docs/
  concepts/
  how-to/
  reference/
```

Those paths map to filter chips automatically. You can also set `pageType` in frontmatter when a file lives outside those folders.

## Next steps

- **[Indexing](/docs/concepts/indexing)** - How page types are inferred.
- **[Customize the search bar](/docs/how-to/customize-search-bar)** - Change the default `resultLimit`.
- **[Features overview](/docs/features/overview)** - Filters and limits in the product feature set.
- **[FAQ](/docs/faq)** - Why the page count cannot go below 3.
