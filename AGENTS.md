# AGENTS.md

## Project Structure

```text
src/
  main/index.ts      main-process entry: ipcMain handlers, qwqnt.main.hooks
  preload/index.ts   contextBridge API, forwards to ipcRenderer
  renderer/index.ts  renderer entry, runs inside the QQNT UI
  global.d.ts        ambient types for APIs exposed by preload
vite.config.ts       mode-keyed builds: main | preload | renderer
dist/                build output; zipped into qwqnt-change-summary.zip
```

QwQNT injects the three entries via the `qwqnt.inject` field in `package.json` (`main/index.js`, `preload/index.cjs`, `renderer/index.js`).

## Commands

```bash
pnpm install
pnpm lint        # eslint .
pnpm lint:fix
pnpm typecheck   # tsc -b --noEmit
pnpm format      # prettier -cw (writes files)
pnpm test:run    # vitest run
pnpm build       # main + preload + renderer -> qwqnt-change-summary.zip
```

No dev/watch script; rebuild and reload the plugin inside QwQNT to test. The repo is not a standalone Electron app.

## Rules

- Keep related docs updated (like `AGENTS.md`s) when you make changes.
- Run typecheck, lint in parallel then format when you make code changes. Run format when you changed docs.

## Commit

Use English conventional commit messages:

```text
type(optional scope): description

- List of change descriptions, focus one point per row

Optional footer(s)
```
