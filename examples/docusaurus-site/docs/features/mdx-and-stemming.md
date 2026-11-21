---
title: MDX extraction and stemming
sidebar_position: 3
pageType: docs
description: How Docsense indexes MDX component text and matches English word forms.
---

# MDX extraction and stemming

Two indexing/matching improvements help Docsense find the pages readers expect.

## Improved MDX extraction

### What it is for

Many Docusaurus pages mix Markdown with MDX components:

```mdx
<Tip title="Install the plugin first">
Complete setup before you customize the SearchBar.
</Tip>
```

A naive stripper that only removes tags would drop `Install the plugin first`. Docsense pulls **textish attributes** (such as `title`, `description`, `alt`, `aria-label`, `label`, `cta`) and keeps surrounding prose so those words stay searchable.

It also drops `import` / `export` lines and MDX comments so they do not pollute the index.

### What still may not index

| Content | Indexed? |
| --- | --- |
| Markdown headings and prose | Yes |
| Fenced code bodies | Yes (as code) |
| String attributes like `title="…"` | Yes |
| Text only inside complex runtime components with no string props | Often no. Prefer real Markdown headings for critical terms |

:::tip
If a phrase must be findable, put it in a heading or normal paragraph, not only inside a custom component that renders text from data files.
:::

## English stemming

### What it is for

Readers type different word forms than your docs use:

| Query | Docs say | Without stemming | With stemming |
| --- | --- | --- | --- |
| `installing plugin` | Install the plugin | May miss | Matches |
| `streaming audio` | Stream live audio | Weaker | Stronger |

Docsense runs a compact **Porter stemmer** on English tokens during matching. Exact matches still score highest; stem matches score just below exact and above fuzzy typos.

### What is not stemmed

- Very short tokens
- Tokens that look like API paths or identifiers (`v1/sessions`, values with `/`, `#`, `.`, `+`, `_`)
- Non-English / CJK text (not supported yet)

## Next steps

- **[Indexing](/docs/concepts/indexing)** - How files become search records.
- **[Ranking and typos](/docs/concepts/ranking-and-typos)** - Exact, stem, prefix, and fuzzy matching.
- **[Use filters and page limits](/docs/how-to/use-filters-and-limits)** - Page types from paths and frontmatter.
- **[FAQ](/docs/faq)** - Common product questions.
