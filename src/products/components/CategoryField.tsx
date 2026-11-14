import { useId, useState, type KeyboardEvent, type Ref } from 'react'
import type { CategoryResponse } from '../model/category'
import { filterCategories, MAX_VISIBLE_CATEGORIES } from '../model/categorySearch'
import type { Loadable } from '../model/loadable'
import { registrationCopy } from '../model/registrationCopy'
import { Button } from './Button'
import { Field } from './Field'
import styles from './CategoryField.module.css'

export { MAX_VISIBLE_CATEGORIES }

interface CategoryFieldProps {
  id: string
  categories: Loadable<CategoryResponse[]>
  value: string
  // A message about this field from validation or from the service.
  error: string | undefined
  // Context for the field that is not an error (why it starts empty).
  hint?: string
  inputRef: Ref<HTMLInputElement>
  onChange: (categoryId: string) => void
  onRetry: () => void
}

// A searchable selector. Only active categories can receive a product, and the list searched is
// the complete one the page already loaded (every page), so typing narrows the real set, not a
// partial page. The chosen category lives in `value`: typing only filters, it never changes the
// choice, and leaving the field restores the chosen name. Only picking another option replaces it.
export function CategoryField({ id, categories, value, error, hint, inputRef, onChange, onRetry }: CategoryFieldProps) {
  const listId = `${useId()}-list`
  const [query, setQuery] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const all = categories.status === 'ready' ? categories.value.filter((category) => category.active) : []
  const chosen = all.find((category) => category.categoryId === value)
  const unavailable = unavailableMessage(categories, all.length)
  const typing = query !== null
  const { shown, total } = filterCategories(all, typing ? query : '')
  const optionId = (index: number) => `${listId}-${index}`

  function pick(category: CategoryResponse | undefined) {
    if (!category) return
    onChange(category.categoryId)
    setQuery(null)
    setOpen(false)
    setActive(-1)
  }
  function close() {
    setQuery(null)
    setOpen(false)
    setActive(-1)
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!shown.length) return
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => current < 0 && step < 0 ? shown.length - 1 : (current + step + shown.length) % shown.length)
    } else if (event.key === 'Enter') {
      // Never submit the form from the selector; pick only what the person highlighted.
      event.preventDefault()
      if (open && active >= 0) pick(shown[active])
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      close()
    }
  }

  const expanded = open && categories.status === 'ready' && all.length > 0

  return (
    <Field
      id={id}
      label={registrationCopy.categoryLabel}
      hint={hint}
      error={unavailable ?? error}
      after={
        categories.status === 'error' && (
          <div>
            <Button variant="secondary" onClick={onRetry}>
              {registrationCopy.retry}
            </Button>
          </div>
        )
      }
    >
      {(control) => (
        <div className={styles.wrapper}>
          <input
            {...control}
            ref={inputRef}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={listId}
            aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
            type="text"
            autoComplete="off"
            disabled={categories.status === 'loading'}
            placeholder={placeholderFor(categories)}
            value={typing ? query : (chosen?.name ?? '')}
            onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(-1) }}
            onFocus={() => { if (categories.status === 'ready') setOpen(true) }}
            onBlur={close}
            onKeyDown={onKeyDown}
          />
          <div className={styles.popup} hidden={!expanded}>
            {shown.length > 0 && (
              <ul id={listId} role="listbox" aria-label={registrationCopy.categoryOptionsLabel} className={styles.list}>
                {shown.map((category, index) => (
                  <li
                    key={category.categoryId}
                    id={optionId(index)}
                    role="option"
                    aria-selected={category.categoryId === value}
                    data-active={index === active || undefined}
                    className={styles.option}
                    // mousedown, not click: the input's blur would otherwise close the list first.
                    onMouseDown={(event) => { event.preventDefault(); pick(category) }}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            )}
            {shown.length === 0 && <p className={styles.note}>{registrationCopy.categoryNoMatches}</p>}
            {total > shown.length && <p className={styles.note}>{registrationCopy.categoryShowing(shown.length, total)}</p>}
          </div>
        </div>
      )}
    </Field>
  )
}

function unavailableMessage(categories: Loadable<CategoryResponse[]>, activeCount: number): string | undefined {
  if (categories.status === 'error') return registrationCopy.categoriesFailed
  if (categories.status === 'ready' && activeCount === 0) return registrationCopy.categoriesEmpty
  return undefined
}

function placeholderFor(categories: Loadable<CategoryResponse[]>): string {
  switch (categories.status) {
    case 'loading':
      return registrationCopy.categoryLoading
    case 'error':
      return registrationCopy.categoriesUnavailable
    case 'ready':
      return registrationCopy.categoryPlaceholder
  }
}
