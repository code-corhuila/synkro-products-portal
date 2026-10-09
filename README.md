# synkro-products-portal

> products bounded context: web UI (remote)

Part of the **SynkroTech SAS Sales Management System** — organization `code-corhuila`.
Governance and documentation live in [`synkro-docs`](https://github.com/code-corhuila/synkro-docs).

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `synkro-docs`.

## What this repository is

A React 19 + Vite **remote** loaded by the `synkro-front` host through
`@originjs/vite-plugin-federation`. It does not run on its own: the host mounts it.

| | |
|---|---|
| Remote name | `productsPortal` |
| Exposed module | `./App` (default export: a React component without props) |
| Entry file | `http://localhost:5175/assets/remoteEntry.js` |
| Host routes | `/products`, `/stock`, `/stock-alerts` |

### HTTP client and session

The host owns the single HTTP client and the session; this portal only consumes them
as federated modules (typed in `src/shell.d.ts`):

- `shell/apiClient` — `apiClient.request(path, { method, body, headers })`
- `shell/session` — `session.user()`

The portal requests relative paths (`/api/v1/...`). It never calls `fetch`/`axios`
and never stores a token. The lint config rejects `fetch`, `XMLHttpRequest`, `axios`,
`localStorage` and `sessionStorage`, and `src/httpGuard.test.ts` proves it.

### Folder layout

```
src/
├── App.tsx            # module exposed to the host; re-exports the page
├── federation.config.ts
├── shell.d.ts         # types of the modules the host exposes
├── products/
│   ├── api/           # typed calls through shell/apiClient
│   ├── components/
│   ├── model/
│   └── pages/
└── test-doubles/      # fakes for shell/apiClient and shell/session
```

## Running locally

Requires Node 22 (`nvm use`).

```bash
npm ci
cp .env.example .env.local
npm run build && npm run preview   # serves assets/remoteEntry.js on port 5175
```

A federated remote's entry only exists in a build, so there is no dev server.

## Scripts

| Script | What it does |
|---|---|
| `npm run lint` | oxlint, including the HTTP/storage guard |
| `npm test` | Vitest; add `-- --coverage` for the report (floor: 70% statements) |
| `npm run build` | type-check and build the remote |
