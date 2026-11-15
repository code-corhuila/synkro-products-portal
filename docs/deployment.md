# Deployment

Detailed procedures and delivery notes moved from the repository README at
[source cf0e560](https://github.com/code-corhuila/synkro-products-portal/blob/cf0e56094902be425910f4faa1dc3dc0812a68ac/README.md).
Recorded execution results retain their original scope; moving them does not
constitute a new execution or certify a different revision.

Run commands from the repository root unless a step explicitly changes directory.

## Deployment

`deploy/` holds the image of this portal alone; the composition of the whole system lives in `synkro-infra`.

The delivered container publishes **no host port**: it listens on 80 inside the external `platform` network and the host
(`synkro-front`) proxies `/remotes/products/` to it. Port 5175 belongs only to `npm run preview`. The `platform` network must
exist before the portal starts (the root creates it; alone, `docker network create platform`), and the host must be reachable
for anything to mount the remote.

```bash
cp .env.example .env   # then uncomment what you change; .env is never committed
docker compose --env-file .env -f deploy/compose.yml up --build   # no published port: reached through the host
```

- **`deploy/Dockerfile`**: multi-stage. Node 22 alpine runs `npm ci`, builds, and runs `npm run check:compiled` (the build fails if the
  compiled portal has a gateway address or token handling); `nginx:1.27-alpine` serves `dist/`. Build argument `VITE_SHELL_ENTRY_URL`
  (default `http://localhost:5173/assets/remoteEntry.js`) is the host's federation entry, the only thing the portal knows about where it runs.
  Build argument `VITE_BASE_PATH` (default and compose value `/remotes/products/`) is the Vite `base`, so the assets of the entry resolve
  under the prefix the host proxies; without it the base is `/`, as in `npm run preview`.
- **`deploy/nginx.conf.template`**, rendered by the image's template mechanism with one variable, `HOST_ORIGIN` (default
  `http://localhost:5173`; `NGINX_ENVSUBST_FILTER=^HOST_ORIGIN$` leaves nginx's own `$variables` alone):
  `/assets/remoteEntry.js` is `Cache-Control: no-store` (it decides which version of the portal the browser loads); the other
  `/assets/*` are `public, max-age=31536000, immutable` (hashed names); both carry `Access-Control-Allow-Origin: $HOST_ORIGIN` and
  `Vary: Origin`, because the host imports them from another origin. `add_header` is not inherited into a location that sets its own,
  so each block repeats what it needs. `index.html` is `no-cache`; gzip is on.
- **No gateway address, token or secret in the image.** The portal asks for relative paths and only the host knows the gateway;
  `scripts/compiledCheck.mjs` enforces it (patterns anchored so React's own `fetchPriority` and `prefetchDNS` do not trip it: a call
  is a `fetch(` that is not part of a longer name and not a method).
- **CI** (`.github/workflows/ci.yml`) keeps its jobs and adds `container-image`: it builds the image without pushing it and runs
  `nginx -t` against the rendered configuration; the build job also runs `npm run check:compiled`.

## Root composition delivery

The deployed Products remote is served through the host at
`http://localhost:5173/remotes/products/assets/remoteEntry.js`. Its container
publishes no host port and joins `platform`. Its Vite base is `/remotes/products/`;
the host proxies that prefix to the internal portal, stripping it. Local Vite preview remains
a separate development command. The host build accepts `VITE_PRODUCTS_PORTAL_ENTRY`
for this route. The Auth, Customers and Sales portals are delivered by their own repositories.
`python tests/test_root_deploy.py` (`python3` where that is the executable) checks the deployment files only: it starts no container and
opens no browser.
