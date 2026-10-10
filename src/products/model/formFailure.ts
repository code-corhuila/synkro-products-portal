// A message for the whole form or dialog, shown as an alert: a title in Spanish
// and, when the service sent one, its own message as the detail.
export interface FormAlert {
  title: string
  detail?: string
}

// How a failed request is shown: next to the fields it names, and/or as one
// alert. The form keeps what the user typed in every case. `gone` is set when
// the service says the thing no longer exists, so the screen reloads its list.
export interface FormFailure<Field extends string = never> {
  fieldErrors: Partial<Record<Field, string>>
  alert: FormAlert | null
  gone?: boolean
}

export type Result<Value, Field extends string = never> =
  | { ok: true; value: Value }
  | { ok: false; failure: FormFailure<Field> }
