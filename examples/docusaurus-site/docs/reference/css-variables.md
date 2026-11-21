---
title: CSS variables
sidebar_position: 2
pageType: reference
description: Theme tokens for the Docsense SearchBar and modal.
---

# CSS variables

Override these in your site CSS to match your brand.

## Trigger

| Variable | Default (conceptually) |
| --- | --- |
| `--docsense-trigger-bg` | Site surface color |
| `--docsense-trigger-border` | Site border color |
| `--docsense-trigger-color` | Site text color |
| `--docsense-trigger-radius` | `999px` |
| `--docsense-trigger-padding` | `0.4rem 0.7rem 0.4rem 0.75rem` |

## Accent and modal

| Variable | Default (conceptually) |
| --- | --- |
| `--docsense-accent` | Accent / gold |
| `--docsense-accent-contrast` | Text on accent |
| `--docsense-overlay` | Dimmed backdrop |
| `--docsense-modal-bg` | Modal background |
| `--docsense-modal-fg` | Modal primary text |
| `--docsense-modal-muted` | Modal secondary text |
| `--docsense-modal-border` | Modal dividers / outlines |
| `--docsense-modal-width` | `720px` |
| `--docsense-modal-radius` | `16px` |

## Destination-page marks

| Variable | Default (conceptually) |
| --- | --- |
| `--docsense-mark-bg` | Warm yellow highlight |
| `--docsense-mark-color` | Inherit / near-black |

For a full styled example with a screenshot, see [Style the search UI](/docs/how-to/style-search).

## Example

```css
:root {
  --docsense-accent: #2563eb;
  --docsense-accent-contrast: #ffffff;
  --docsense-modal-width: 680px;
  --docsense-trigger-radius: 999px;
}
```

Class names are prefixed with `docsense-` (for example `.docsense-modal`, `.docsense-chip`) so they stay isolated from other theme CSS.

## Next steps

- **[Style the search UI](/docs/how-to/style-search)** - Worked theme example with preview and CSS.
- **[Highlight terms on the page](/docs/features/highlight-on-page)** - Destination-page mark behavior.
- **[Plugin options](/docs/reference/plugin-options)** - Labels and behavior configuration.
- **[FAQ](/docs/faq)** - Common product questions.
