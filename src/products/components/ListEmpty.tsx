import { listCopy } from '../model/listCopy'
import { registrationCopy } from '../model/registrationCopy'
import { Button } from './Button'
import styles from './ListState.module.css'

interface ListEmptyProps {
  hasFilters: boolean
  // Opens the registration form. Left out while registering is not possible.
  onRegister: (() => void) | undefined
}

// An empty catalogue points at "Nuevo producto"; filters that match nothing do not.
// The header's action is the view's one primary, so this one is secondary.
export function ListEmpty({ hasFilters, onRegister }: ListEmptyProps) {
  if (hasFilters) {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{listCopy.noMatch}</p>
      </div>
    )
  }

  return (
    <div className={styles.empty}>
      <p className={styles.message}>{listCopy.emptyCatalogue}</p>
      {onRegister && (
        <Button variant="secondary" onClick={onRegister}>
          {registrationCopy.openAction}
        </Button>
      )}
    </div>
  )
}
