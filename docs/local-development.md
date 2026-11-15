# Local development

Detailed procedures and delivery notes moved from the repository README at
[source cf0e560](https://github.com/code-corhuila/synkro-products-portal/blob/cf0e56094902be425910f4faa1dc3dc0812a68ac/README.md).
Recorded execution results retain their original scope; moving them does not
constitute a new execution or certify a different revision.

Run commands from the repository root unless a step explicitly changes directory.

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
| `npm run check:compiled` | fails if `dist/` has a gateway address, token handling or a direct HTTP client (run it after the build) |
