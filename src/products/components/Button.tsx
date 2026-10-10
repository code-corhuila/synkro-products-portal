import type { ComponentPropsWithoutRef } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'className'> {
  variant?: 'primary' | 'secondary'
}

// The host's Button is not shared (each framework builds its own from the
// tokens), so this one is the portal's: primary for the one main action of a
// view, secondary for the rest. A button never submits unless it says so.
export function Button({ variant = 'primary', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={`${styles.button} ${styles[variant]}`} {...rest} />
}
