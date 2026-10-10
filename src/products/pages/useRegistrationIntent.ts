import { useCallback, useEffect, useRef, useState } from 'react'
import { createProduct } from '../api/createProduct'
import type { CreateProductFailure } from '../model/createProductFailure'
import type { ProductResponse } from '../model/product'
import type { NewProduct } from '../model/productForm'

// What one submission came to. "ignored" means nothing happened that the form
// should react to: a submission was already in flight, or the form was closed
// before the answer arrived.
export type SubmitOutcome =
  | { status: 'registered'; product: ProductResponse }
  | { status: 'failed'; failure: CreateProductFailure }
  | { status: 'ignored' }

interface Intent {
  fingerprint: string
  idempotencyKey: string
}

// Registers one product per intent. An intent is a piece of data the user means
// to register once: sending the same data again after a failure reuses its
// Idempotency-Key, so the service can recognize a replay and create nothing
// twice. Changed data, or a success, starts a new intent with a new key.
export function useRegistrationIntent() {
  const [isPending, setIsPending] = useState(false)
  const intent = useRef<Intent | null>(null)
  // A ref, not state: two clicks in the same tick both see the old state.
  const inFlight = useRef(false)
  const isOpen = useRef(true)

  useEffect(() => {
    isOpen.current = true
    return () => {
      isOpen.current = false
    }
  }, [])

  const submit = useCallback(async (product: NewProduct): Promise<SubmitOutcome> => {
    if (inFlight.current) return { status: 'ignored' }
    inFlight.current = true
    setIsPending(true)

    const result = await createProduct(product, keyFor(intent, product))

    inFlight.current = false
    if (!isOpen.current) return { status: 'ignored' }

    setIsPending(false)
    if (!result.ok) return { status: 'failed', failure: result.failure }

    intent.current = null
    return { status: 'registered', product: result.product }
  }, [])

  return { isPending, submit }
}

function keyFor(intent: { current: Intent | null }, { name, priceCents, categoryId }: NewProduct): string {
  const fingerprint = JSON.stringify([name, priceCents, categoryId])

  if (intent.current?.fingerprint !== fingerprint) {
    intent.current = { fingerprint, idempotencyKey: crypto.randomUUID() }
  }
  return intent.current.idempotencyKey
}
