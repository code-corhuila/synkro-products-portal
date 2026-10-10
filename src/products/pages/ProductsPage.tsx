import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { ProductFilterBar } from '../components/ProductFilterBar'
import { ProductListBody } from '../components/ProductListBody'
import { ProductRegistrationForm } from '../components/ProductRegistrationForm'
import { registrationCopy } from '../model/registrationCopy'
import { toListView } from '../model/productList'
import styles from './ProductsPage.module.css'
import { useAnnouncement } from './useAnnouncement'
import { useCategories } from './useCategories'
import { useProductList } from './useProductList'

// The product catalogue list. Products and categories load independently: the
// table keeps its rows when the categories fail, and the filter offers a retry.
// "Nuevo producto" opens the registration form in the page itself: registration
// has no route of its own.
export function ProductsPage() {
  const products = useProductList()
  const categories = useCategories()
  const announcement = useAnnouncement()
  const view = toListView(products.state, categories.state, products.filters)

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

  function closeForm() {
    returnFocusToAction.current = true
    setIsFormOpen(false)
  }

  function handleRegistered() {
    closeForm()
    products.reloadFromFirstPage()
    announcement.announce(registrationCopy.registered)
  }

  return (
    <section>
      <div className={styles.header}>
        <h1>Products</h1>
        {!isFormOpen && (
          <Button ref={openAction} onClick={() => setIsFormOpen(true)}>
            {registrationCopy.openAction}
          </Button>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className={styles.announcement}>
        {announcement.message}
      </div>

      {isFormOpen && (
        <ProductRegistrationForm
          categories={categories.state}
          onRetryCategories={categories.retry}
          onRegistered={handleRegistered}
          onCancel={closeForm}
        />
      )}

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
        onRegister={isFormOpen ? undefined : () => setIsFormOpen(true)}
      />
    </section>
  )
}
