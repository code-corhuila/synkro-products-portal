// Module Federation contract with the host (synkro-front): its registry loads
// `productsPortal/App` from this remote's `assets/remoteEntry.js`.
const SHELL_ENTRY_URL = 'http://localhost:5173/assets/remoteEntry.js'

// Same range the host pins, so the host's singleton React is reused.
const REACT_RANGE = '^19.2.8'

export const federationConfig = {
  name: 'productsPortal',
  filename: 'remoteEntry.js',
  exposes: { './App': './src/App.tsx' },
  // `shell` is the host's own federation entry: it exposes the single HTTP
  // client and the session this portal consumes (shell/apiClient, shell/session).
  remotes: { shell: SHELL_ENTRY_URL },
  shared: {
    react: { requiredVersion: REACT_RANGE },
    'react-dom': { requiredVersion: REACT_RANGE },
  },
}
