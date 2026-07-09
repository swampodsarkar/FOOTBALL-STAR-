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

## Environment & API key (security)

The football-data.org key is **server-side only** and is never bundled into the
browser. The frontend calls `/api/football/*`, which is proxied by:

- `api/football.js` — a Vercel Serverless Function (production)
- the Vite dev proxy in `vite.config.ts` (local `npm run dev`)

Create a local `.env` (gitignored) from `.env.example`:

```
FOOTBALL_DATA_API_KEY=your_key_here
```

On Vercel, add the **Environment Variable** `FOOTBALL_DATA_API_KEY` (no `VITE_`
prefix) in the project settings. Because the key lives only on the server,
users cannot read it from the deployed app.

