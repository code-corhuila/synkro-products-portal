import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { ProductFilterBar } from '../components/ProductFilterBar'
import { ProductListBody } from '../components/ProductListBody'
import { ProductRegistrationForm } from '../components/ProductRegistrationForm'
import { SummaryTiles } from '../components/SummaryTiles'
import { listCopy } from '../model/listCopy'
import { registrationCopy } from '../model/registrationCopy'
import { toListView } from '../model/productList'
import { toSummaryTiles } from '../model/summary'
import styles from './ProductsPage.module.css'
import { useAnnouncement } from './useAnnouncement'
import { useCategories } from './useCategories'
import { useProductList } from './useProductList'
import { useSummary } from './useSummary'

// The product catalogue list. Products, categories and each summary tile load
// independently: one failing never changes the others. "Nuevo producto" opens
// the registration form in the page itself: registration has no route of its own.
export function ProductsPage() {
  const products = useProductList()
  const categories = useCategories()
  const summary = useSummary()
  const announcement = useAnnouncement()
  const catalogueTitleId = useId()
  const view = toListView(products.state, categories.state, products.filters)
  const tiles = toSummaryTiles(summary.activeProducts.state, summary.outOfStock.state, categories.state)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const openAction = useRef<HTMLButtonElement>(null)
  const returnFocusToAction = useRef(false)

  // The action is not rendered while the form is open, so focus goes back to it
  // once it is on screen again.
  useEffect(() => {
    if (isFormOpen || !returnFocusToAction.current) return
    returnFocusToAction.current = false
    openAction.current?.focus()
  }, [isFormOpen])

  function openForm() {
    setIsFormOpen(true)
  }

  function closeForm() {
    returnFocusToAction.current = true
    setIsFormOpen(false)
  }

  function handleRegistered() {
    closeForm()
    products.reloadFromFirstPage()
    summary.reload()
    announcement.announce(registrationCopy.registered)
  }

  return (
    <section>
      <div className={styles.header}>
        <h1 className={styles.title}>{listCopy.title}</h1>
        {!isFormOpen && (
          <Button ref={openAction} onClick={openForm}>
            {registrationCopy.openAction}
          </Button>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className={styles.announcement}>
        {announcement.message}
      </div>

      <SummaryTiles
        tiles={tiles}
        onRetry={{
          activeProducts: summary.activeProducts.retry,
          outOfStock: summary.outOfStock.retry,
          activeCategories: categories.retry,
        }}
      />

      {isFormOpen && (
        <div className={styles.formSlot}>
          <ProductRegistrationForm
            categories={categories.state}
            onRetryCategories={categories.retry}
            onRegistered={handleRegistered}
            onCancel={closeForm}
          />
        </div>
      )}

      <section aria-labelledby={catalogueTitleId} className={styles.catalogue}>
        <h2 id={catalogueTitleId} className={styles.catalogueTitle}>
          {listCopy.catalogue}
        </h2>
        <ProductFilterBar
          filters={products.filters}
          categories={categories.state}
          onChange={products.updateFilters}
          onRetryCategories={categories.retry}
        />
        <ProductListBody
          view={view}
          onRetry={products.retry}
          onPageChange={products.goToPage}
          onRegister={isFormOpen ? undefined : openForm}
        />
      </section>
    </section>
  )
}
