---
title: Ranking and typos
sidebar_position: 3
pageType: concept
description: How Docsense scores matches and handles misspellings.
---

# Ranking and typos

Docsense ranks results so the most useful pages rise to the top, even when the query is slightly wrong.

## Matching

For each query word, Docsense looks for:

1. **Exact** match
2. **Stem** match (English Porter stem: `installing` ↔ `install`)
3. **Prefix** match (query is the start of a longer word)
4. **Fuzzy** match with a small edit distance

Edit distance uses Damerau–Levenshtein (insert, delete, replace, and adjacent transpose). Short tokens allow fewer edits than longer tokens, so short words do not match unrelated words too easily.

API-like tokens (paths, versions, identifiers with `/` `#` `.`) are not stemmed. See [MDX extraction and stemming](/docs/features/mdx-and-stemming).

## Scoring

Matches in different fields carry different weight. In order of importance:

1. Page title
2. Section title
3. Code
4. Breadcrumbs
5. Body text

Docsense also boosts results when more of your query words match, and when the full query matches the page title.

## Pages vs sections

Internally, Docsense can score section-level hits. The modal then keeps the **best hit per page** so you see a clean list of pages (default up to 8), not many rows from the same page.

## Tips for authors

- Use clear, specific headings. Section titles are strong ranking signals.
- Put important terms in the title or early headings when readers will search for them.
- Prefer normal spelling in docs. Typo tolerance helps readers; it does not replace clear writing.

## Next steps

- **[MDX extraction and stemming](/docs/features/mdx-and-stemming)** - Stemming rules and MDX text extraction.
- **[Highlight terms on the page](/docs/features/highlight-on-page)** - How matched terms are marked after a click.
- **[Use filters and page limits](/docs/how-to/use-filters-and-limits)** - How the modal presents page-level results.
- **[FAQ](/docs/faq)** - Common product questions.
