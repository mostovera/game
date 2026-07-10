/**
 * @vitest-environment jsdom
 *
 * RecipeBox.test.tsx — K2 таб Unlocked/Locked/Secret, mastery ★ по кэшу timesCooked.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useStore } from '@/state'
import { recipes } from '@/data/catalogs/recipes'
import { RecipeBox } from './RecipeBox'

describe('RecipeBox (K2)', () => {
  beforeEach(() => {
    useStore.setState({ ui: { ...useStore.getState().ui, locale: 'ru' }, collections: null })
  })

  it('открытые рецепты показывают mastery-звёзды и счётчик приготовлений', () => {
    const starter = recipes.find((r) => r.unlock.kind === 'starter')
    expect(starter).toBeDefined()
    useStore.getState().setCollections({ toys: {}, cosmetics: {}, postcards: [], ribbons: [], recipeMastery: { [starter!.key]: 12 } })
    render(<RecipeBox />)
    const card = screen.getByTestId(`recipe-card-${starter!.key}`)
    expect(card.textContent).toMatch(/готовили 12 раз/)
    expect(screen.getByTestId(`recipe-card-stars-${starter!.key}`).textContent).toBe('★★☆☆☆')
  })

  it('таб «Секретки» показывает только experiment-рецепты', () => {
    useStore.getState().setCollections({ toys: {}, cosmetics: {}, postcards: [], ribbons: [] })
    render(<RecipeBox />)
    fireEvent.click(screen.getByTestId('recipe-box-tab-secret'))
    const secretRecipe = recipes.find((r) => r.unlock.kind === 'experiment')
    expect(secretRecipe).toBeDefined()
    expect(screen.getByTestId(`recipe-card-${secretRecipe!.key}`)).toBeTruthy()
    const starter = recipes.find((r) => r.unlock.kind === 'starter')!
    expect(screen.queryByTestId(`recipe-card-${starter.key}`)).toBeNull()
  })

  it('клик «Готовить» вызывает onCraft с ключом рецепта', () => {
    useStore.getState().setCollections({ toys: {}, cosmetics: {}, postcards: [], ribbons: [] })
    const starter = recipes.find((r) => r.unlock.kind === 'starter')!
    let called: string | null = null
    render(<RecipeBox onCraft={(k) => (called = k)} />)
    fireEvent.click(screen.getByTestId(`recipe-card-craft-${starter.key}`))
    expect(called).toBe(starter.key)
  })
})
