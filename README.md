# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Data: baked at build time (no runtime API)

All football-data.org data (league emblems, real club names + crests, and the
season's fixtures) is fetched **once** by `scripts/fetchData.mjs` and saved to
`src/data/realFootballData.json`. The app imports that file directly, so the
deployed version makes **zero runtime API calls** — no CORS, no rate limits, no
proxy, no service worker needed.

To refresh the data, run `node scripts/fetchData.mjs` (uses the key inside the
script) and commit the updated JSON.

Real league logos come from the baked `emblem` field and are shown on the
league-selection screen, falling back to country flags if missing.

