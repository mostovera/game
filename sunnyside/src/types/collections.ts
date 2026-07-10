/**
 * collections.ts — игрушки, открытки, ленты, косметика (17-collections, canon §3.10/§3.11).
 * Престиж и самовыражение. Σ(косметика+коллекции) в Farm Value капится 15%.
 */

import type { UUID } from './common'
import type { StateKey } from './expeditions'
import type { ContestKey } from './fair'

/** Серии игрушек Prize Machine (canon §3.10). 5 серий. */
export type ToySeriesKey =
  | 'toy_highway_dinos'
  | 'toy_cosmos_57'
  | 'toy_route_critters'
  | 'toy_chrome_rockets'
  | 'toy_diner_mascots'

export const TOY_SERIES_KEYS: readonly ToySeriesKey[] = [
  'toy_highway_dinos',
  'toy_cosmos_57',
  'toy_route_critters',
  'toy_chrome_rockets',
  'toy_diner_mascots',
] as const

/** Собранная игрушка (ui_toy_shelf). */
export interface Toy {
  key: string // toy_<series>_<n>
  series: ToySeriesKey
  owned: boolean
  duplicate: number
}

/** Косметик-сеты (canon §3.11). Скины: дайнер/грузовик/стафф/вывеска/интерьер. */
export type CosmeticKey = 'cos_googie' | 'cos_chrome' | 'cos_tiki' | 'cos_xmas_55'

export const COSMETIC_KEYS: readonly CosmeticKey[] = [
  'cos_googie',
  'cos_chrome',
  'cos_tiki',
  'cos_xmas_55',
] as const

export type CosmeticTarget = 'diner' | 'truck' | 'staff' | 'sign' | 'interior'

export interface Cosmetic {
  key: CosmeticKey
  owned: boolean
  appliedTo: CosmeticTarget[]
}

/** Открытка «Greetings from…» (mech_greetings_postcard). 1/штат/ивент; полный сет → бафф. */
export interface Postcard {
  key: string
  stateKey?: StateKey
  owned: boolean
}

/** Лента (🎀 Blue Ribbon с конкурсов). Только витрина/декор (canon §2.1). */
export interface Ribbon {
  id: UUID
  contestKey: ContestKey
  weekIndex: number
  rank: number
}

/** Снапшот коллекций (collections-слайс). */
export interface CollectionsSnapshot {
  toys: Record<string, Toy>
  cosmetics: Partial<Record<CosmeticKey, Cosmetic>>
  postcards: Postcard[]
  ribbons: Ribbon[]
}
