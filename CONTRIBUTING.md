# Contributing

## Development

```bash
npm install
npm test
npm run build
```

## Test plan we keep green

1. **Unit tests** (`packages/*/src/**/*.test.ts`) — tokenizer, ranking, context, markdown, plugin scan.
2. **Golden relevance** — fixture docs; first hit must match expected page/section.
3. **Round-trip** — index → JSON → parse → search.
4. **Example CLI** — `npm run index -w @docsense/example-basic` then `npm run search -w @docsense/example-basic -- "upload audio"`.
5. **CI** — GitHub Actions runs test + build on every PR.

Add a golden case when you change ranking.
