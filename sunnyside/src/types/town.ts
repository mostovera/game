/**
 * town.ts — город, стриты, town projects, кооп, potluck, переезды (11-town, 12-migration).
 * Городской слой — v0.3. TownScene рендерится LOD/имперостерами (21-client §3.9).
 */

import type { UUID, EpochMs, Versioned } from './common'
import type { ProductKey } from './ingredients'

/** Town Projects (canon §3.7). 6 коллективных построек. */
export type TownProjectKey =
  | 'tp_drive_in' // Автокино
  | 'tp_ferris_wheel' // Колесо обозрения
  | 'tp_radio_wsun' // Радиостанция WSUN
  | 'tp_bandstand' // Городская эстрада
  | 'tp_water_tower' // Водонапорная башня
  | 'tp_welcome_arch' // Приветственная арка шоссе

export const TOWN_PROJECT_KEYS: readonly TownProjectKey[] = [
  'tp_drive_in',
  'tp_ferris_wheel',
  'tp_radio_wsun',
  'tp_bandstand',
  'tp_water_tower',
  'tp_welcome_arch',
] as const

/** Прогресс town-проекта (Realtime `town:{id}:projects`). */
export interface TownProject extends Versioned {
  key: TownProjectKey
  progress: number
  goal: number
  built: boolean
  myContribution: number
}

/** Стрит (10–20 ферм, canon §2.4). */
export interface Street {
  id: UUID
  name: string // из пула 20 названий (canon §3.3)
  memberCount: number
  farmIds: UUID[]
}

/**
 * Кооп-заказ (coop_contribute). Дедлайн Чт 23:59. Пул на уровне стрита;
 * ≤10 участников на заказ (canon C11).
 */
export interface CoopOrder extends Versioned {
  id: UUID
  requirements: { itemKey: ProductKey; qty: number; filled: number }[]
  deadlineAt: EpochMs
  myContribution: Record<ProductKey, number>
  reward: string
}

/** Potluck-стол стрита (mech_potluck, potluck_contribute). Бафф стриту на субботу. */
export interface Potluck {
  weekIndex: number
  totalScore: number
  myScore: number
  buffActive: boolean
}

/** Предложение переезда (migration_propose/vote, 12-migration). Без скипа за ◉ (12-O1). */
export type MigrationKind = 'moving_van' | 'street_caravan' | 'town_merge'

export interface MigrationProposal extends Versioned {
  id: UUID
  kind: MigrationKind
  targetTownId: UUID
  votingWindow: { opensAt: EpochMs; closesAt: EpochMs }
  tally: { yes: number; no: number; quorum: number }
  myVote?: 'yes' | 'no'
}

/** Снапшот города (town-слайс). Кэш; требует свежих серверных данных (не офлайн). */
export interface TownSnapshot {
  townId: UUID
  streets: Street[]
  projects: Partial<Record<TownProjectKey, TownProject>>
  /** Ростер соседей (для визитов). */
  roster: { userId: UUID; farmId: UUID; displayName: string; streetId: UUID }[]
  coopOrders: CoopOrder[]
  potluck?: Potluck
  migrations: MigrationProposal[]
}
