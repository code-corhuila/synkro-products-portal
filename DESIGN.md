# Catalogue Excel download (HU-VEN-18) — design

The design was recorded before implementation. The verification below describes the finished branch.

## Scope

Adds one control to the existing catalogue screen (`/products`): a button that downloads the
**currently filtered catalogue** as a `.xlsx` file, plus a "Solo con existencias" checkbox that
narrows the file to products with stock greater than zero. No new route, no new API, no change to
the table, the filters it already has, or any other screen (`/stock`, `/stock-alerts` are untouched,
so the download exists only where "catalogue" means the full management view).

Out of scope: a background job, a server-generated file, an email, or any format other than a
single-sheet `.xlsx`.

## Data design

One row per product, already resolved to its display form:

| Column header | Source | Type in the sheet |
|---|---|---|
| `Referencia de producto` | `ProductResponse.productId` | text |
| `Nombre` | `ProductResponse.name` | text |
| `Categoría` | `ProductResponse.categoryId`, resolved through the catalogue's own categories list (same `listCopy.categoryLabel.unknown` fallback the table uses for an id the list does not contain) | text |
| `Precio` | `ProductResponse.priceCents / 100` | number, `numFmt '#,##0.00'` |
| `Stock` | `ProductResponse.stock` | number, `numFmt '#,##0'` |

`productId` is the identifier in the API contract, so the workbook labels the column
"Referencia de producto". The contract has no separate SKU field.

Prices are converted from integer cents to numeric amounts with two decimal places. Values outside
Excel's supported precision stop the export.

## Why "solo con existencias" is a local filter, not a query

`GET /products` (`productsApi.ts`) accepts `stockAtMost` (stock **at most** N — used today for the
"Agotados" tile, `stockAtMost=0`). It has **no** "stock greater than zero" or "stock at least N"
parameter. Rather than guess an unsupported query parameter, the checkbox filters the rows already
read from the API, client-side, after every matching page has been fetched. This keeps the request
to the real contract: the server still decides which products match `name`/`categoryId`/`active`,
and the export only ever drops rows locally, never asks the server a question it cannot answer.

## Pagination and authorization

The export reads every page of `GET /products` that matches the catalogue's current filters
(`name`, `categoryId`, `active` — the same `ProductFilters` the table already uses), through
`listProducts` (`shell/apiClient`, so the same host transport, credential and correlation id as
every other request). It stops and throws before reading further once the first page's
`meta.totalPages` exceeds **`EXPORT_MAX_PAGES` (50 pages × 20 products = 1 000 rows)** — an explicit,
documented bound, not a silent truncation: the user sees a message asking to narrow the filters, and
no file is produced.

**A page that fails fails the whole export.** The pages are read with a plain sequential `await`
loop (`listAllMatchingProducts`, the same shape as `listAllCategories`/`listAllOpenAlerts` already in
this codebase): if any page's request rejects, the whole promise rejects and the caller never builds
a workbook from a partial read. A `401`/`403` from the host (the same shape every other request
already recognizes: `{ status, body }`) is shown as its own message; the download never attempts a
second request with different credentials and never bypasses the host's authorization.

The categories used to label each row must already be loaded (the catalogue loads them once, like
today): the button stays disabled until `categories` is `ready`, so the file never shows "Cargando…"
as a category name.

## Workbook construction

- `write-excel-file` is loaded on demand and creates a local XLSX `Blob`. The test suite uses
  ExcelJS as an independent reader.
- **One sheet**, named "Catálogo", one header row (the column names above) and one row per product.
- The reference, name and category pass through `safeText` and are written as literal strings.
- **Numeric cells are real numbers** (`Precio`, `Stock`), not text, with an explicit `numFmt` so a
  reader can filter/sum them without reparsing text.
- `downloadBlob` starts the download using a temporary object URL.
- File name: `catalogo-productos.xlsx` (no accents, so it is a safe file-system name on every OS;
  the sheet's visible tab name keeps the accent, "Catálogo", because that one is just a label).

## States and copy

One small component, `CatalogueExport`, sits in the catalogue section right after the filter bar:

- **Idle**: "Descargar Excel" (secondary button) and the "Solo con existencias" checkbox. Disabled
  while the categories have not loaded yet.
- **Pending**: the live region announces "Generando archivo…" and both controls are disabled.
- **Done**: the live region announces "Catálogo descargado".
- **Error**: an inline `role="alert"`, with a message distinguishing session-ended (401),
  no-permission (403), network (`status: 0`), the explicit "too many rows" bound, and anything else —
  the same shape `ListError`/`SalesError`-style messages already use elsewhere in this portal. The
  button stays enabled, so a retry (after narrowing the filters, if that was the cause) needs no
  special action.

All of this Spanish text lives in `model/exportCopy.ts`, the pattern `copy.test.ts` already enforces
for every other screen: no other new source file carries Spanish text of its own.

## Accessibility and keyboard

The checkbox is a real `<label>`/`<input type="checkbox">` pair; the button is the shared `Button`
component. Both sit in the existing tab order, after "Estado" and before the table region (updated in
`ProductsPage.layout.test.tsx`). Nothing here introduces a modal, a new focus trap, or a colour-only
signal: the error alert carries the message in text, on the same card background as every other
alert in this portal.

## Verification

Node 22 passed the 1,021-test suite and two additional component checks. The tests cover keyboard
order, filtered pagination, limits, permissions, the stock option and reading the generated
workbook with an independent library. Lint, TypeScript/Vite and the compiled Host boundary check
passed. The checks use fixtures. Browser acceptance against the deployed stack remains a release
check.
