import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import { CategoryField, MAX_VISIBLE_CATEGORIES } from './CategoryField'

const category = (n: number, over: Partial<CategoryResponse> = {}): CategoryResponse => ({ categoryId: `c-${n}`, name: `Categoría ${n}`, active: true, ...over })
const named = (id: string, name: string, active = true): CategoryResponse => ({ categoryId: id, name, active })

function Harness({ categories, initial = '', error, onRetry = () => {} }: { categories: Loadable<CategoryResponse[]>; initial?: string; error?: string; onRetry?: () => void }) {
  const [value, setValue] = useState(initial)
  return <>
    <CategoryField id="cat" categories={categories} value={value} error={error} inputRef={createRef<HTMLInputElement>()} onChange={setValue} onRetry={onRetry} />
    <output aria-label="elegida">{value}</output>
  </>
}
const ready = (value: CategoryResponse[]): Loadable<CategoryResponse[]> => ({ status: 'ready', value })
const box = () => screen.getByRole('combobox', { name: 'Categoría' })
const chosen = () => screen.getByLabelText('elegida').textContent

const all = ready([named('a', 'Periféricos'), named('b', 'Monitores'), named('c', 'Ópticos y lentes'), named('d', 'Inactiva vieja', false)])

it('no ofrece categorías inactivas', async () => {
  const user = userEvent.setup()
  render(<Harness categories={all} />)
  await user.click(box())
  expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Monitores', 'Ópticos y lentes', 'Periféricos'])
})

it('filtra por texto sin distinguir mayúsculas ni acentos', async () => {
  const user = userEvent.setup()
  render(<Harness categories={all} />)
  await user.type(box(), 'OPTICOS')
  expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Ópticos y lentes'])
})

it('elige con clic y muestra el nombre elegido en el campo', async () => {
  const user = userEvent.setup()
  render(<Harness categories={all} />)
  await user.type(box(), 'perif')
  await user.click(screen.getByRole('option', { name: 'Periféricos' }))
  expect(chosen()).toBe('a')
  expect(box()).toHaveValue('Periféricos')
  expect(screen.queryByRole('listbox')).toBeNull()
})

it('teclado: flechas, Enter y Escape', async () => {
  const user = userEvent.setup()
  render(<Harness categories={all} />)
  await user.click(box())
  await user.keyboard('{ArrowDown}{ArrowDown}')
  expect(box()).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[1].id)
  await user.keyboard('{Enter}')
  expect(chosen()).toBe('c')
  await user.click(box())
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('listbox')).toBeNull()
  expect(chosen()).toBe('c')
})

it('cambiar el texto no pierde la categoría elegida: solo la reemplaza otra elección', async () => {
  const user = userEvent.setup()
  render(<Harness categories={all} initial="a" />)
  expect(box()).toHaveValue('Periféricos')
  await user.clear(box())
  await user.type(box(), 'mon')
  expect(chosen()).toBe('a')
  await user.tab()
  expect(chosen()).toBe('a')
  expect(box()).toHaveValue('Periféricos')
})

it('Enter con una lista vacía no cambia la elección', async () => {
  const user = userEvent.setup()
  render(<Harness categories={all} initial="b" />)
  await user.clear(box())
  await user.type(box(), 'zzzz')
  await user.keyboard('{Enter}')
  expect(chosen()).toBe('b')
  expect(screen.getByText('No hay categorías que coincidan con la búsqueda.')).toBeVisible()
})

it('con muchas categorías muestra un lote acotado e indica que hay más', async () => {
  const user = userEvent.setup()
  const many = Array.from({ length: 500 }, (_, i) => category(i + 1))
  render(<Harness categories={ready(many)} />)
  await user.click(box())
  expect(screen.getAllByRole('option')).toHaveLength(MAX_VISIBLE_CATEGORIES)
  expect(screen.getByText(new RegExp(`Mostrando ${MAX_VISIBLE_CATEGORIES} de 500`))).toBeVisible()
  await user.type(box(), 'Categoría 499')
  expect(screen.getByRole('option', { name: 'Categoría 499' })).toBeVisible()
})

it('mientras cargan las categorías el campo avisa y no se puede usar', () => {
  render(<Harness categories={{ status: 'loading' }} />)
  expect(box()).toBeDisabled()
  expect(box()).toHaveAttribute('placeholder', 'Cargando categorías…')
})

it('si fallan, informa y ofrece reintentar', async () => {
  const user = userEvent.setup()
  const retry = vi.fn()
  render(<Harness categories={{ status: 'error' }} onRetry={retry} />)
  expect(screen.getByText('No se pudieron cargar las categorías.')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Reintentar' }))
  expect(retry).toHaveBeenCalledTimes(1)
})

it('sin categorías activas lo dice', () => {
  render(<Harness categories={ready([named('d', 'Vieja', false)])} />)
  expect(screen.getByText('No hay categorías activas. Crea una antes de registrar productos.')).toBeVisible()
})

it('muestra el error de validación asociado al campo', () => {
  render(<Harness categories={all} error="Elige una categoría." />)
  expect(box()).toBeInvalid()
  expect(box()).toHaveAccessibleDescription('Elige una categoría.')
})
