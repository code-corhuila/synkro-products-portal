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

- `shell/apiClient` — `apiClient.request(path, { method, body, headers, query, idempotencyKey, signal })`
- `shell/session` — `session.user()` (declared in `src/shell.d.ts`; no screen reads it yet)

The portal requests relative paths (`/api/v1/...`). It never calls `fetch`/`axios`
and never stores a token. The lint config rejects `fetch`, `XMLHttpRequest`, `axios`,
`localStorage` and `sessionStorage`, and `src/httpGuard.test.ts` proves it.

### Folder layout

```
src/
├── App.tsx            # module exposed to the host; renders the screen for the current location
├── routes.tsx         # path → screen; the only place that knows the portal's routes
├── federation.config.ts
├── shell.d.ts         # types of the modules the host exposes
├── products/
│   ├── api/           # typed calls through shell/apiClient
│   ├── components/    # presentation only
│   ├── model/         # types, money formatting, mapping to view rows
│   └── pages/         # the screen, and the hooks that hold its state
└── test-doubles/      # fakes for shell/apiClient and shell/session, and shared fixtures
```

## Products list (`/products`)

Filters the catalogue by name (partial, submitted with **Search**), category and status, and
pages 20 products at a time. Access by role (ADMIN, INVENTORY) belongs to the host.

- **Four states:** loading, error with a retry that repeats the same request (the filters stay),
  empty, and data.
- **Categories:** `ProductResponse` carries only `categoryId`. The categories list loads once when the
  screen opens and names each product's category. It is a separate request, so the table keeps its
  rows when categories fail; the category column then shows `Loading…` or `Unavailable`, and
  `Unknown category` for an id the list does not contain.
- **Newest request wins:** a new request aborts the one in flight, and an answer that arrives after
  it was superseded is ignored. Leaving the screen aborts the request too (`pages/useLoad.ts`).
- **Money:** `priceCents` is an integer count of minor units of COP (1/100). `model/money.ts`
  formats it with integer arithmetic only, as `COP 1.234,56` (Colombian separators).

Out of scope here: editing or deactivating products, stock adjustments, the stock lookup
and the stock alerts.

## Registering a product (`/products`)

"Nuevo producto" opens the registration form as a panel inside the list page (registration has no
route of its own, `navigation-map.md`). It posts `{ name, priceCents, categoryId }` to
`POST /api/v1/products` through `shell/apiClient`; stock is never sent, a new product starts at 0.
All user-facing text is in Spanish; the list is still in English until its translation lands.

- **Price:** `model/price.ts` reads the typed text with string splitting and `BigInt`, never a float.
  Accepted: digits with at most one `.` or `,` followed by one or two digits (`0.07` is 7, `12,5` is
  1250, `1234` is 123400). Rejected, with a message on the field and nothing sent: empty, zero, negative,
  letters, more than two decimals (so `1.234` is rejected as ambiguous between a thousand and a fraction),
  and anything above `Number.MAX_SAFE_INTEGER` minor units.
- **Idempotency:** one `Idempotency-Key` (`crypto.randomUUID()`) per intent (`pages/useRegistrationIntent.ts`).
  Sending the same data (trimmed name, price in minor units, category) again after a failure reuses the key;
  changed data, or a success, starts a new key. Only the last intent is remembered, and the key lives as long
  as the open form. A `201` and a replayed `200` are both success.
- **Errors:** the host's error is recognized by its shape (`status` and `body`), because the portal cannot
  import the host's class. `400` with `details` shows each message next to its field (`priceCents` is the
  price field); `404` is the category field; `422`, status `0` and anything else are a form alert that
  keeps the data and allows a retry. Focus goes to the first invalid field, or to the alert.
- **Submitting:** the submit button is disabled while the request is pending and a ref guards the double
  click, so a double click sends one request. Cancel is disabled meanwhile, so an answer is never left without a form.
  On success the form closes, focus returns to "Nuevo producto", the list reloads from its first page with
  the filters kept (the newest request still wins) and a polite live region says "Producto registrado" for 4 seconds.
- **Categories:** the form reuses the list's categories and offers only the active ones. If they failed to
  load, the category field says so and offers a retry.

### Styling

Styles are CSS Modules (`*.module.css`) next to the component. They read the host's design tokens by name
(`var(--color-primary-500)`) and never carry a colour, spacing or type literal; `src/styles.test.ts` enforces
it. CSS Modules scope each class name, and a remote's stylesheet lands in the host's document, where a plain
global class could collide with the host's or another portal's. The host publishes the tokens and follows the
operating system's light or dark theme, so no component branches on the theme except the input background
the design system asks to sit on the page colour in dark. The host's `Button` is not shared: `components/Button.tsx` is
this portal's own. `build.cssCodeSplit: false` keeps one stylesheet that the remote entry loads, and the
build test still fails on any unresolved `__v__css__` placeholder.

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
