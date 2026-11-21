---
title: Indexing
sidebar_position: 2
pageType: concept
description: What Docsense reads from your Markdown and MDX files.
---

# Indexing

Docsense builds its index from your source files, not from rendered HTML.

## What gets indexed

For each Markdown or MDX file, Docsense stores:

- **Title** from frontmatter (`title` or `sidebar_label`) or the first heading
- **Sections** from headings (`##`, `###`, and so on), including body text under each heading
- **Code blocks** under those headings (kept for ranking)
- **Tags** from `tags` or `keywords` in frontmatter when present
- **Page type**, **version**, and **language** (from path, frontmatter, or plugin defaults)

## Page types

Filters in the search modal use `pageType`.

Docsense sets page type in this order:

1. Explicit `pageType` in frontmatter
2. Inferred from the URL path
3. Fallback to `page` or `docs`

Path rules:

| Path contains | Page type |
| --- | --- |
| `/how-to` or `/howto` | `howto` |
| `/concept` | `concept` |
| `/reference` | `reference` |
| `/tutorial` | `tutorial` |
| `/api` or `api-reference` | `api` |
| `/blog` | `blog` |
| `/docs` (and none of the above) | `docs` |

Example frontmatter:

```md
---
title: Install Docsense
pageType: howto
---
```

## What is stripped (and what MDX keeps)

The indexer turns Markdown into plain text for search. It removes common markup noise and also:

- Drops `import` / `export` lines and MDX comments
- Keeps string values from textish JSX attributes (`title`, `description`, `alt`, `aria-label`, `label`, `cta`, and similar)

Critical terms should still appear in headings or prose when possible. See [MDX extraction and stemming](/docs/features/mdx-and-stemming).

## Where the index lives

Default output:

```text
static/docsense/search-index.json
```

Change the relative path with the plugin `indexPath` option. The SearchBar loads it from your site root (for example `/docsense/search-index.json`).

## Next steps

- **[MDX extraction and stemming](/docs/features/mdx-and-stemming)** - What text is extracted from MDX.
- **[Ranking and typos](/docs/concepts/ranking-and-typos)** - How indexed fields are scored.
- **[Plugin options](/docs/reference/plugin-options)** - `docsDirs`, `indexPath`, and related settings.
- **[Use filters and page limits](/docs/how-to/use-filters-and-limits)** - Page types from paths and frontmatter.
- **[FAQ](/docs/faq)** - Common product questions.
