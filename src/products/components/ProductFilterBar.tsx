import { useState, type FormEvent } from 'react'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import type { FilterChange, ProductFilters } from '../model/product'

interface ProductFilterBarProps {
  filters: ProductFilters
  categories: Loadable<CategoryResponse[]>
  onChange: (change: FilterChange) => void
  onRetryCategories: () => void
}

type StatusChoice = 'all' | 'active' | 'inactive'

// Name is applied on submit (a search), the other two filters apply as soon as they change.
export function ProductFilterBar({ filters, categories, onChange, onRetryCategories }: ProductFilterBarProps) {
  const [nameDraft, setNameDraft] = useState(filters.name ?? '')

  function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onChange({ name: nameDraft.trim() })
  }

  return (
    <form role="search" onSubmit={submitName}>
      <div>
        <label htmlFor="product-name">Name</label>
        <input
          id="product-name"
          type="text"
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          aria-describedby="product-name-hint"
        />
        <span id="product-name-hint">Partial match, case-insensitive</span>
        <button type="submit">Search</button>
      </div>

      <CategoryFilter
        categoryId={filters.categoryId}
        categories={categories}
        onChange={onChange}
        onRetry={onRetryCategories}
      />

      <div>
        <label htmlFor="product-status">Status</label>
        <select
          id="product-status"
          value={statusChoice(filters.active)}
          onChange={(event) => onChange({ active: activeFrom(event.target.value as StatusChoice) })}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </form>
  )
}

interface CategoryFilterProps {
  categoryId: string | undefined
  categories: Loadable<CategoryResponse[]>
  onChange: (change: FilterChange) => void
  onRetry: () => void
}

function CategoryFilter({ categoryId, categories, onChange, onRetry }: CategoryFilterProps) {
  return (
    <div>
      <label htmlFor="product-category">Category</label>
      <select
        id="product-category"
        value={categoryId ?? ''}
        disabled={categories.status !== 'ready'}
        onChange={(event) => onChange({ categoryId: event.target.value || undefined })}
      >
        {categories.status === 'loading' && <option value="">Loading categories…</option>}
        {categories.status === 'error' && <option value="">Categories unavailable</option>}
        {categories.status === 'ready' && (
          <>
            <option value="">All categories</option>
            {categories.value.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </>
        )}
      </select>
      {categories.status === 'error' && (
        <>
          <p role="alert">Categories could not be loaded.</p>
          <button type="button" onClick={onRetry}>
            Retry categories
          </button>
        </>
      )}
    </div>
  )
}

function statusChoice(active: boolean | undefined): StatusChoice {
  if (active === undefined) return 'all'
  return active ? 'active' : 'inactive'
}

function activeFrom(choice: StatusChoice): boolean | undefined {
  if (choice === 'all') return undefined
  return choice === 'active'
}
