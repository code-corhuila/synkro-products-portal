# Implementation boundaries

Detailed procedures and delivery notes moved from the repository README at
[source cf0e560](https://github.com/code-corhuila/synkro-products-portal/blob/cf0e56094902be425910f4faa1dc3dc0812a68ac/README.md).
Recorded execution results retain their original scope; moving them does not
constitute a new execution or certify a different revision.

Run commands from the repository root unless a step explicitly changes directory.

## Notes on the real service

- **`PUT /products/{id}` and 404.** The contract's `NotFound` cannot tell a missing product from a missing or inactive category. The
  real service answers both `404 NOT_FOUND` without `details`; only the message differs (`Product not found` /
  `Category not found or not active`). `api/productFailures.ts` blames the category field when the message names a category, and
  treats any other 404 (including the generic `Resource not found`) as the product.
- **Alerts are read by ADMIN and INVENTORY only.** A salesperson gets 403, so `/stock` never asks.
- **The worker lags** up to 15 minutes (see "Low stock").
- **Idempotency.** `201` the first time, `200` with the same resource when the key repeats; both are success. Registration, stock
  adjustment and category creation use `useSubmissionIntent`; updates are `PUT` and carry no key.

## Conformance with the front-end convention

Against "How this is verified" of `_stacks/frontend.md` in `synkro-docs`:

| Item | Result | Evidence |
|---|---|---|
| Compiles with strict TypeScript; `npm ci` from the versioned lockfile | met | `tsconfig.app.json` is `strict`; `npm ci && npm run build` in the CI job and the image; `package-lock.json` is versioned (`src/deploy.test.ts`, "has package-lock.json") |
| Without a session, a protected route goes to sign-in and back | not applicable to a portal | The host's `RequireAuth` does it; the portal never reads a session |
| Mounts in the host; compiled code has no gateway URL and no token handling | met | `npm run check:compiled`, `src/compiledCheck.test.ts`, the image build; mounted in the real host on `:5173` from `:5175` and from the container |
| Every request carries `Authorization` and a fresh `X-Correlation-Id`; a `401` closes the session | not applicable to a portal | The host's client does it; the portal reaches the API only through `shell/apiClient` (`src/httpGuard.test.ts`, oxlint rules) |
| Every screen shows loading, error with retry, empty and data | met | "its four states" in `StockLookupPage.test.tsx` and `StockAlertsPage.test.tsx`; `ProductsPage.layout.test.tsx` for the list; observed in the real host |
| A form shows the error next to each field, from the client and from the server | met | `ProductEditForm.test.tsx`, `ProductRegistrationForm.test.tsx`, `StockAdjustmentForm.test.tsx` ("when the service refuses"), `CategoryForms.test.tsx` |
| The submit button is disabled while a submission is pending | met | "blocks a second request while one is in flight" in the form tests; `ConfirmDialog.test.tsx` |
| Creation sends `Idempotency-Key` and reuses it on retry | met | `useSubmissionIntent.test.ts`; observed against the real service (`201`, then `200` with the same key) |
| An amount typed as `0.07` reaches the API as `7` | met | `price.test.ts`, `productForm.test.ts`, `priceText.test.ts` (`0,07` ⇄ `7`) |
| A nonexistent route shows the 404 page | not applicable to a portal | The host shows it; the portal renders nothing for a path it does not own (`routes.test.ts`) |
| With one portal's server stopped, the host still starts and only that area shows the notice | not applicable to a portal | Host behaviour (`RemoteBoundary`); not re-verified in this repository |
| Angular only: `customElements.whenDefined`, input setter, stable entry name | not applicable | This is a React remote |
| Angular only: initial navigation, deep link and Back under the host's base path | not applicable | This is a React remote; for this one, a deep link and Back were checked in the real host (see "Navigation") |

## Repository readiness

`src/deploy.test.ts` checks the structure of a domain portal: `deploy/`, `src/products/{api,components,model,pages}`, `src/shell.d.ts`,
`src/vite-env.d.ts`, `.env.example`, `.gitignore` (with `coverage/`), `.nvmrc` and `engines` (Node 22), the versioned lockfile, README,
CODEOWNERS and the pull request template. The CI jobs run from a clean install (`npm ci`): lint, build, `check:compiled`, tests with coverage
(floor 70% statements, `vite.config.ts`) and the image build.

### Styling

Styles are CSS Modules (`*.module.css`) next to the component. They read the host's design tokens by name
(`var(--color-primary-500)`) and never carry a colour, spacing or type literal; `src/styles.test.ts` enforces
it. CSS Modules scope each class name, and a remote's stylesheet lands in the host's document, where a plain
global class could collide with the host's or another portal's. The host publishes the tokens and follows the
operating system's light or dark theme, so no component branches on the theme except the input background
the design system asks to sit on the page colour in dark. The host's `Button` is not shared: `components/Button.tsx` is
this portal's own (primary, secondary, ghost or danger; regular or small). The host publishes no border token, so the table's
row lines use `--color-text-disabled`. Text sits on a card (`--color-bg-card`), where the ink and the muted text
measure above 4.5:1 in both themes; error text stays on a card too, because `--color-error-700` on the canvas
is 4.34:1. `build.cssCodeSplit: false` keeps one stylesheet that the remote entry loads, and the
build test still fails on any unresolved `__v__css__` placeholder.
