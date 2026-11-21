---
title: Why Docsense
sidebar_position: 1
pageType: concept
description: Why documentation sites still need page search when Ask AI exists, and when a local Docusaurus search plugin is the right layer to own.
---

# Why Docsense

Readers come to documentation to complete a task: install a package, call an API, fix an error, or confirm a behavior before they ship.

Today many documentation sites also offer an Ask AI assistant. That raises a fair question: if readers can ask in natural language, why invest in a normal search bar at all?

Docsense exists because **finding the right page** and **getting an answered question** are related jobs, not the same job. Documentation programs that collapse them into chat alone usually discover the gap later, in support tickets, wrong versions, and pages nobody can find again.

## What readers are actually trying to do

A documentation visit usually ends in one of these outcomes:

| Outcome | What success looks like |
| --- | --- |
| Follow a procedure | Open the canonical how-to and complete the steps |
| Confirm a contract | Land on the reference page for a field, error, or endpoint |
| Recover from failure | Reach the troubleshooting section that matches the symptom |
| Share the answer | Send a stable URL to a teammate, customer, or ticket |
| Return later | Bookmark or search again for the same page |

Ask AI can help with the first pass. It summarizes, suggests next steps, and reduces blank-page friction.

It does not replace the need for a **stable, authored page** that your team maintains, versions, and links. Search is how readers (and your own support team) get back to that page on purpose.

## Why Ask AI does not retire documentation search

Strong documentation sites often ship both an assistant and search because each one covers a failure mode the other does not.

### Readers often need the official page, not a paraphrase

When someone needs the Install guide, the webhook signature reference, or the migration note for their version, success is opening that page and working from it.

Search is built around that outcome: a short list of pages, section deep links, breadcrumbs, and filters that follow how the docs are organized. An assistant can explain the same topic well and still fail to put the required page in front of the reader.

### Authored docs are the system of record

Your Markdown and MDX are reviewed, versioned, and deployed with the product. That corpus is the source of truth.

Search makes that corpus navigable.

An assistant reads from the corpus (or from a derived index) and produces a new answer each time. Even when retrieval is good, the reader experiences a generated response, not the maintained document. For API contracts, security steps, and breaking changes, teams usually want the maintained document in front of the reader.

### Predictability matters in support and compliance

The same query in search should return the same short list of pages.

Assistants vary. Phrasing, model updates, and conversation context change the answer. That flexibility is useful for exploration. It is costly when support macros, partner onboarding, or audit trails depend on a known page URL.

### Private and partner docs change the economics

Ask AI introduces model access, retention policy, evaluation, and often a network call.

Many Docusaurus sites are not fully public: partner portals, internal runbooks, staging docs, SSO-gated product docs. For those sites, the hard requirement is often:

- Do not send the documentation corpus to a third-party crawler or model by default
- Keep indexing inside the documentation build you already trust
- Keep query behavior local to the site you already host

Local documentation search is the layer that satisfies those constraints without asking you to stand up an assistant stack first.

### Assistants still depend on a findable docs corpus

If titles, headings, and page structure are weak, both human search and retrieval-augmented assistants get worse. A maintained search index over your docs improves the corpus you already publish, whether or not you also ship chat.

## What was already hard before Ask AI

Even before assistants were common, documentation search for Docusaurus forced awkward tradeoffs:

| Pressure | What teams feel |
| --- | --- |
| Hosted search | Account, crawler or sync pipeline, procurement, and an external data boundary |
| Freshness | Docs deploy today; the index catches up later |
| Local options | Possible, but uneven on docs UX, ranking, filters, theming, or setup cost |
| “Ship something” | A search box that exists, but returns weak or opaque results |

Ask AI did not remove those pressures. In many programs it added a second surface while the underlying findability problem remained.

## What Docsense is for

Docsense is the default local search layer for Docusaurus documentation sites that want to own findability without owning a search service.

Concretely, it does four things that map to the problems above:

1. **Indexes at build time** with your docs, so the index updates when the site updates.
2. **Ships a static JSON index** with the site, so there is no Docsense query cloud and no crawler account for the core path.
3. **Provides a documentation SearchBar** with section results, page-type filters, typo tolerance, and theming.
4. **Stays install-simple**: add the plugin, rebuild, use search.

It is not an Ask AI product. It is the findability layer you still need when you have an assistant, when you plan to add one, or when an assistant is the wrong first investment for private docs.

## When this matters most

Choose a dedicated documentation search layer like Docsense when:

- Readers must land on canonical pages, not only conversational answers
- Docs change often enough that a stale index creates real support cost
- Content is private, partner-gated, or otherwise sensitive to leave your boundary for indexing
- You want open-source local search on Docusaurus with a complete SearchBar, not a hosted account as the default

Prefer a hosted search platform or an assistant-first stack when your main requirement is managed operations, vendor Ask AI, or search far beyond a Docusaurus Markdown documentation tree. [Compare open-source Docusaurus search](/docs/concepts/compare-open-source-search) covers those paths.

## Bottom line

If your docs program only invests in Ask AI, readers can still struggle to open the maintained page, share a stable URL, or trust that today’s deploy is what search will show them tomorrow.

Docsense covers that gap for Docusaurus: local indexing at build time, a static index you deploy with the site, and a SearchBar meant for documentation findability. You can add an assistant later. You should not postpone page search until you do.

## Next steps

- **[What is Docsense?](/docs/intro)** - Product overview and what you get.
- **[How Docsense works](/docs/concepts/how-docsense-works)** - Build-time index and in-browser queries.
- **[Compare open-source Docusaurus search](/docs/concepts/compare-open-source-search)** - Search options and when each fits.
- **[Install Docsense](/docs/how-to/install)** - Add the plugin and rebuild once.
- **[FAQ](/docs/faq)** - Common product questions.
