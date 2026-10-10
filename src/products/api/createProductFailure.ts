import type { CreateProductFailure } from '../model/createProductFailure'
import type { FieldErrors, ProductField } from '../model/productForm'
import { registrationCopy } from '../model/registrationCopy'

// The error the host's client rejects with. The portal cannot import the host's
// class, so it recognizes the error by its shape.
interface HostError {
  status: number
  body: { message?: unknown; details?: unknown }
}

const FIELD_OF_REQUEST_PROPERTY: Record<string, ProductField> = {
  name: 'name',
  priceCents: 'price',
  categoryId: 'categoryId',
}

export function toCreateProductFailure(error: unknown): CreateProductFailure {
  if (!isHostError(error)) return alertOnly(registrationCopy.notRegistered)

  const { status, body } = error
  if (status === 0) return alertOnly(registrationCopy.offline)
  if (status === 404) return { fieldErrors: { categoryId: registrationCopy.categoryNotFound }, alert: null }
  if (status === 400) return fromValidationDetails(body)
  return alertOnly(registrationCopy.notRegistered, messageOf(body))
}

function fromValidationDetails(body: HostError['body']): CreateProductFailure {
  const details = detailsOf(body)
  if (details.length === 0) return alertOnly(registrationCopy.notRegistered, messageOf(body))

  const fieldErrors: FieldErrors = {}
  const unmatched: string[] = []

  for (const { field, message } of details) {
    const formField = FIELD_OF_REQUEST_PROPERTY[field]
    if (formField === undefined) unmatched.push(message)
    else fieldErrors[formField] ??= message
  }

  const alert = unmatched.length > 0 ? { title: registrationCopy.notRegistered, detail: unmatched.join(' ') } : null
  return { fieldErrors, alert }
}

function alertOnly(title: string, detail?: string): CreateProductFailure {
  return { fieldErrors: {}, alert: detail === undefined ? { title } : { title, detail } }
}

function isHostError(error: unknown): error is HostError {
  if (typeof error !== 'object' || error === null) return false
  const { status, body } = error as Partial<HostError>
  return typeof status === 'number' && typeof body === 'object' && body !== null
}

function messageOf(body: HostError['body']): string | undefined {
  return typeof body.message === 'string' && body.message !== '' ? body.message : undefined
}

function detailsOf(body: HostError['body']): { field: string; message: string }[] {
  if (!Array.isArray(body.details)) return []
  return body.details.filter(
    (detail): detail is { field: string; message: string } =>
      typeof detail?.field === 'string' && typeof detail?.message === 'string',
  )
}
