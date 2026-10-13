import type { FieldErrors } from './productForm'

// A message for the whole form, shown as an alert: a title in Spanish and,
// when the service sent one, its own message as the detail.
export interface FormAlert {
  title: string
  detail?: string
}

// How a failed registration is shown: next to the fields it names, and/or as
// one alert for the form. The form keeps what the user typed in every case.
export interface CreateProductFailure {
  fieldErrors: FieldErrors
  alert: FormAlert | null
}
