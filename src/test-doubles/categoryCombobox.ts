import { within } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'

type User = ReturnType<typeof userEvent.setup>

// The category selector is a searchable combobox: open it, narrow the list by typing, click the option.
export async function chooseCategory(user: User, combobox: HTMLElement, name: string) {
  await user.click(combobox)
  await user.clear(combobox)
  await user.type(combobox, name)
  const listbox = document.getElementById(combobox.getAttribute('aria-controls')!)!
  await user.click(within(listbox).getByRole('option', { name }))
}

// The names offered, in the order shown, after opening the list.
export async function offeredCategories(user: User, combobox: HTMLElement): Promise<string[]> {
  await user.click(combobox)
  const listbox = document.getElementById(combobox.getAttribute('aria-controls')!)
  return listbox ? within(listbox).queryAllByRole('option').map((option) => option.textContent ?? '') : []
}
