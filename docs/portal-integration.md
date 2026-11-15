# Portal integration

Detailed procedures and delivery notes moved from the repository README at
[source cf0e560](https://github.com/code-corhuila/synkro-products-portal/blob/cf0e56094902be425910f4faa1dc3dc0812a68ac/README.md).
Recorded execution results retain their original scope; moving them does not
constitute a new execution or certify a different revision.

Run commands from the repository root unless a step explicitly changes directory.

## What this repository is

A React 19 + Vite **remote** loaded by the `synkro-front` host through
`@originjs/vite-plugin-federation`. It does not run on its own: the host mounts it.

| | |
|---|---|
| Remote name | `productsPortal` |
| Exposed module | `./App` (default export: a React component without props) |
| Entry file, delivered with the platform | `http://localhost:5173/remotes/products/assets/remoteEntry.js` (through the host) |
| Entry file, `npm run preview` only | `http://localhost:5175/assets/remoteEntry.js` |
| Host routes | `/products`, `/stock`, `/stock-alerts` |

### Screens

| Route | Screen | Roles (enforced by the host) | What it reads |
|---|---|---|---|
| `/products` | Catalogue, management and categories | ADMIN, INVENTORY | products, categories, open stock alerts |
| `/stock` | Stock lookup, read-only | SALESPERSON | active products, categories |
| `/stock-alerts` | Stock alerts, read-only | ADMIN, INVENTORY | stock alerts, products by id |

`routes.tsx` serves exactly these three paths (an optional trailing slash is accepted) and nothing for any other.
Access by role belongs to the host: it redirects a role away from a route it may not see, so a screen never checks
the role and `/stock` never asks for alerts, which a salesperson may not read (403).

### HTTP client and session

The host owns the single HTTP client and the session; this portal only consumes them
as federated modules (typed in `src/shell.d.ts`):

- `shell/apiClient` — `apiClient.request(path, { method, body, headers, query, idempotencyKey, signal })`
- `shell/session` — `session.user()` (declared in `src/shell.d.ts`; no screen reads it yet: the host decides who sees what)

The portal requests relative paths (`/api/v1/...`). It never calls `fetch`/`axios`
and never stores a token. The lint config rejects `fetch`, `XMLHttpRequest`, `axios`,
`localStorage` and `sessionStorage`, and `src/httpGuard.test.ts` proves it.

### Folder layout

```
src/
├── App.tsx            # module exposed to the host; renders the screen for the current location
├── routes.tsx         # path → screen; the only place that knows the portal's routes
├── navigation.ts      # navigateTo(path): History API push + popstate, for links between screens
├── federation.config.ts
├── shell.d.ts         # types of the modules the host exposes
├── products/
│   ├── api/           # typed calls through shell/apiClient
│   ├── components/    # presentation only
│   ├── model/         # types, money formatting, mapping to view rows
│   └── pages/         # the screen, and the hooks that hold its state
└── test-doubles/      # fakes for shell/apiClient and shell/session, and shared fixtures
deploy/                # Dockerfile, nginx.conf.template, compose.yml (see "Deployment")
scripts/               # check-compiled.mjs: the compiled-code check CI and the image run
.github/               # CODEOWNERS, pull request template, ci.yml
```
