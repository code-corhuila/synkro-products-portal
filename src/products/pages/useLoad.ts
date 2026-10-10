import { useCallback, useEffect, useState } from 'react'
import type { Loadable } from '../model/loadable'

// Runs `load` for `key`. A new key, a retry or an unmount aborts the request in
// flight, and an answer that arrives after its abort is never shown, so the
// newest request always wins.
export function useLoad<K, T>(key: K, load: (key: K, signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<Loadable<T>>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    load(key, controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) setState({ status: 'ready', value })
      },
      () => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      },
    )

    return () => controller.abort()
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((count) => count + 1), [])

  return { state, retry }
}
