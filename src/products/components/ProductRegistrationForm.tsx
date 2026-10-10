import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import type { CategoryResponse } from '../model/category'
import type { FormAlert } from '../model/createProductFailure'
import type { Loadable } from '../model/loadable'
import type { ProductResponse } from '../model/product'
import {
  PRODUCT_FIELDS,
  validateProductForm,
  type FieldErrors,
  type ProductField,
  type ProductFormValues,
} from '../model/productForm'
import { registrationCopy } from '../model/registrationCopy'
import { useRegistrationIntent } from '../pages/useRegistrationIntent'
import { Button } from './Button'
import { CategoryField } from './CategoryField'
import { Field } from './Field'
import styles from './ProductRegistrationForm.module.css'

interface ProductRegistrationFormProps {
  categories: Loadable<CategoryResponse[]>
  onRetryCategories: () => void
  onRegistered: (product: ProductResponse) => void
  onCancel: () => void
}

const EMPTY_VALUES: ProductFormValues = { name: '', price: '', categoryId: '' }

// Registers a product. The form keeps what the user typed whatever the service
// answers; each error appears next to the field it is about, and focus goes to
// the first invalid field (or to the form alert, when the error is not about a field).
export function ProductRegistrationForm({
  categories,
  onRetryCategories,
  onRegistered,
  onCancel,
}: ProductRegistrationFormProps) {
  const ids = useId()
  const [values, setValues] = useState<ProductFormValues>(EMPTY_VALUES)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [alert, setAlert] = useState<FormAlert | null>(null)
  const { isPending, submit } = useRegistrationIntent()

  const controls = useRef<Partial<Record<ProductField, HTMLElement | null>>>({})
  const alertBox = useRef<HTMLDivElement>(null)
  const focusAfterRender = useRef(false)

  const fieldId = (field: ProductField) => `${ids}-${field}`
  const controlRef = (field: ProductField) => (element: HTMLElement | null) => {
    controls.current[field] = element
  }

  useEffect(() => {
    controls.current.name?.focus()
  }, [])

  // Focus waits for the render that shows the errors: an invalid field must
  // already be marked, and the alert must exist, before it receives focus.
  useEffect(() => {
    if (!focusAfterRender.current) return
    focusAfterRender.current = false

    const firstInvalid = PRODUCT_FIELDS.find((field) => fieldErrors[field] !== undefined)
    if (firstInvalid) controls.current[firstInvalid]?.focus()
    else alertBox.current?.focus()
  }, [fieldErrors, alert])

  function showErrors(errors: FieldErrors, formAlert: FormAlert | null) {
    focusAfterRender.current = true
    setFieldErrors(errors)
    setAlert(formAlert)
  }

  function edit(field: ProductField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors(({ [field]: _edited, ...others }) => others)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateProductForm(values)
    if (!validation.ok) {
      showErrors(validation.errors, null)
      return
    }

    setFieldErrors({})
    setAlert(null)
    const outcome = await submit(validation.product)

    if (outcome.status === 'registered') onRegistered(outcome.product)
    else if (outcome.status === 'failed') showErrors(outcome.failure.fieldErrors, outcome.failure.alert)
  }

  const titleId = `${ids}-title`

  return (
    <form className={styles.form} aria-labelledby={titleId} noValidate onSubmit={handleSubmit}>
      <h2 id={titleId} className={styles.title}>
        {registrationCopy.title}
      </h2>

      <Field
        id={fieldId('name')}
        label={registrationCopy.nameLabel}
        hint={registrationCopy.nameHint}
        error={fieldErrors.name}
      >
        {(control) => (
          <input
            {...control}
            ref={controlRef('name')}
            type="text"
            autoComplete="off"
            value={values.name}
            onChange={(event) => edit('name', event.target.value)}
          />
        )}
      </Field>

      <Field
        id={fieldId('price')}
        label={registrationCopy.priceLabel}
        hint={registrationCopy.priceHint}
        error={fieldErrors.price}
      >
        {(control) => (
          <input
            {...control}
            ref={controlRef('price')}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={values.price}
            onChange={(event) => edit('price', event.target.value)}
          />
        )}
      </Field>

      <CategoryField
        id={fieldId('categoryId')}
        categories={categories}
        value={values.categoryId}
        error={fieldErrors.categoryId}
        selectRef={controlRef('categoryId')}
        onChange={(categoryId) => edit('categoryId', categoryId)}
        onRetry={onRetryCategories}
      />

      {alert && (
        <div role="alert" tabIndex={-1} ref={alertBox} className={styles.alert}>
          <p className={styles.alertTitle}>{alert.title}</p>
          {alert.detail && <p className={styles.alertDetail}>{alert.detail}</p>}
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" disabled={isPending} onClick={onCancel}>
          {registrationCopy.cancel}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? registrationCopy.submitting : registrationCopy.submit}
        </Button>
      </div>
    </form>
  )
}
