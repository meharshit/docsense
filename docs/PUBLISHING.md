# Publishing Docsense

Docsense is an **npm package for Docusaurus**, not a VS Code extension. Consumers install the plugin into their docs site. The demo documentation site in this repo is for development and marketing only.

## What consumers install

```bash
npm install docusaurus-plugin-docsense
```

That pulls **only** the published package contents (`dist/` + theme assets listed in `package.json` `files`). It does **not** install:

- `examples/docusaurus-site` (this docs/marketing site)
- screenshots, brand sheets, or internal scripts

Root `package.json` is `"private": true`. Publish the packages under `packages/`, not the monorepo root.

## Packages to publish

| Package | Registry name | Role |
| --- | --- | --- |
| `packages/docusaurus-plugin` | `docusaurus-plugin-docsense` | Docusaurus plugin + SearchBar |
| `packages/core` | `@docsense/core` | Search / rank / tokenize |
| `packages/indexer` | `@docsense/indexer` | Markdown/MDX → index |
| `packages/runtime` | `@docsense/runtime` | Browser client |

Typical first publish (from each package after `npm run build`):

```bash
npm login
cd packages/core && npm publish --access public
cd ../indexer && npm publish --access public
cd ../runtime && npm publish --access public
cd ../docusaurus-plugin && npm publish --access public
```

Pin dependency versions between packages before publish so `docusaurus-plugin-docsense` resolves `@docsense/*` from npm.

## Cloning this repo vs installing the plugin

| Goal | Do this |
| --- | --- |
| Use Docsense on your docs site | `npm install docusaurus-plugin-docsense` and add the plugin to `docusaurus.config` |
| Contribute to Docsense | Clone this repo, `npm install` at the root, run tests / the example site |
| Host the marketing docs | Deploy `examples/docusaurus-site` separately (GitHub Pages, Netlify, etc.) |

Do **not** copy `examples/docusaurus-site/docs` into a partner product repo. That content is Docsense’s own documentation.

## Demo site and git

- Keep `examples/docusaurus-site` **in git** (sources only).
- `.gitignore` already ignores `examples/**/build`, `.docusaurus`, and generated `search-index.json`.
- Do not publish the example site to npm (`private: true`).

## VS Code Marketplace (different product)

The [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/) hosts **editor extensions** (`.vsix`), not Docusaurus plugins.

| Surface | What it is | Where it publishes |
| --- | --- | --- |
| Docsense today | Docs-site search plugin | **npm** |
| VS Code extension | Commands/UI inside VS Code | **VS Code Marketplace** (+ optional Open VSX) |

If you want a VS Code extension later (for example “index this workspace” or “preview Docsense queries”), you would:

1. Create a new package with `yo code` or `@vscode/vsce` scaffolding (`package.json` with `"engines": { "vscode": "^1.x" }`).
2. Implement activation events and commands in TypeScript.
3. Add icons (use `docs/brand/docsense-icon-*.png`).
4. Get a [Azure DevOps publisher](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) account.
5. Run `vsce package` → `vsce publish`.

That extension can **depend on** `@docsense/core` from npm, but it is a separate project and listing from `docusaurus-plugin-docsense`.

## Checklist before first npm release

1. `npm test` and `npm run build` pass in the monorepo.
2. Example site builds with the local plugin.
3. README install steps match the published package name.
4. `files` in each `package.json` includes only what consumers need.
5. LICENSE (MIT) and repository URL set on each package.
6. Decide version (`0.1.0`) and tag `v0.1.0` after publish.
