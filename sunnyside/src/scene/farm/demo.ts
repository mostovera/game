/**
 * demo.ts — локальный демо-снапшот фермы для самодостаточной сцены (21-client §3.3
 * «ферма полностью играбельна офлайн»).
 *
 * ЗАЧЕМ: пока net-bootstrap не гидрировал `farm`-слайс (getFarm→setFarm ещё TODO в
 * main.tsx), сцена сеет этот демо-кэш, чтобы игрок сразу видел живое поле и мог кликать.
 * Реальная серверная гидрация позже перезапишет кэш (истина — серверная). Это ТОЛЬКО
 * презентационные состояния (empty/growing/ready), без экономических чисел.
 *
 * ГРАНИЦА: чистые данные, ноль three/react.
 */

import type { EpochMs, FarmSnapshot } from '@/types'

/** UI-only длительность роста демо-грядки (не эконом-формула; сервер даёт свой readyAt). */
export const DEMO_GROW_MS = 8 * 60 * 1000

const ZERO_FARM_VALUE = { production: 0, buildings: 0, collections: 0, cosmetics: 0, total: 0 }

/**
 * Демо-снапшот: 6 стартовых A-слотов в разных состояниях, стартовые постройки, 3 станка,
 * 2 животных — тот же набор, что сеет локальный адаптер (net/local/world.ts), но собранный
 * чисто для standalone-рендера сцены до гидрации.
 */
export function demoFarmSnapshot(now: EpochMs): FarmSnapshot {
  const grownAgo = (ms: number) => now - ms
  return {
    farmId: 'demo-farm',
    farmLevel: 3,
    plots: [
      { version: 1, id: 'demo-plot-0', slot: 0, state: 'empty' },
      {
        version: 1,
        id: 'demo-plot-1',
        slot: 1,
        state: 'growing',
        seedKey: 'crop_tomato',
        cropKey: 'crop_tomato',
        plantedAt: grownAgo(DEMO_GROW_MS * 0.3),
        readyAt: now + DEMO_GROW_MS * 0.7,
      },
      {
        version: 1,
        id: 'demo-plot-2',
        slot: 2,
        state: 'ready',
        seedKey: 'crop_lettuce',
        cropKey: 'crop_lettuce',
        plantedAt: grownAgo(DEMO_GROW_MS),
        readyAt: grownAgo(1),
      },
      {
        version: 1,
        id: 'demo-plot-3',
        slot: 3,
        state: 'growing',
        seedKey: 'crop_potato',
        cropKey: 'crop_potato',
        plantedAt: grownAgo(DEMO_GROW_MS * 0.1),
        readyAt: now + DEMO_GROW_MS * 0.9,
      },
      {
        version: 1,
        id: 'demo-plot-4',
        slot: 4,
        state: 'ready',
        seedKey: 'crop_wheat',
        cropKey: 'crop_wheat',
        plantedAt: grownAgo(DEMO_GROW_MS),
        readyAt: grownAgo(1),
      },
      { version: 1, id: 'demo-plot-5', slot: 5, state: 'empty' },
    ],
    buildings: {
      bld_house: { version: 1, key: 'bld_house', level: 3 },
      bld_barn: { version: 1, key: 'bld_barn', level: 1 },
      bld_coop: { version: 1, key: 'bld_coop', level: 1 },
      bld_kitchen: { version: 1, key: 'bld_kitchen', level: 2 },
      bld_diner: { version: 1, key: 'bld_diner', level: 1 },
      bld_garage: { version: 1, key: 'bld_garage', level: 1 },
      bld_silo: { version: 1, key: 'bld_silo', level: 1 },
    },
    machines: [
      { id: 'demo-machine-0', key: 'mch_grill', level: 1, jobs: [] },
      { id: 'demo-machine-1', key: 'mch_oven', level: 1, jobs: [] },
      { id: 'demo-machine-2', key: 'mch_churn', level: 1, jobs: [] },
    ],
    animals: [
      { version: 1, id: 'demo-animal-0', kind: 'chicken', housing: 'bld_coop', affection: 2, productKey: 'egg' },
      { version: 1, id: 'demo-animal-1', kind: 'cow', housing: 'bld_barn', affection: 1, productKey: 'milk' },
    ],
    farmValue: { ...ZERO_FARM_VALUE },
  }
}
