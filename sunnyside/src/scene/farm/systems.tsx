/**
 * systems.tsx — мост «клик в сцене → намерение игрока» (02-farm §3.4, 21-client §3.5).
 *
 * Сцена НЕ ходит в net напрямую (AGENTS.md §3): она вызывает систему движка через этот
 * контекст. `FarmActionsProvider` можно инжектить реальными системами (`createFarmSystem`/
 * `createAnimalSystem`, замкнутыми на adapter в композиции App/bootstrap) — тогда клики
 * уходят на бэкенд. Без инъекции работает ДЕФОЛТ: оптимистичный патч кэша фермы + тёплый
 * тост (P3), чтобы сцена была самодостаточной до подключения net-bootstrap.
 *
 * Важно: дефолт кладёт в кэш ТОЛЬКО презентационные состояния грядки (empty→growing→ready),
 * без экономических чисел — награда/качество/цена считаются сервером (AGENTS.md §0.3).
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useStore } from '@/state'
import type { FarmSystem, AnimalSystem } from '@/engine'
import type { UUID, ProductKey, FarmSnapshot, Toast } from '@/types'
import { DEMO_GROW_MS } from './demo'

/** Набор действий, которые умеет сцена фермы. Диспатчер намерений игрока. */
export interface FarmActions {
  /** Посев на пустой слот (реальный выбор культуры — Seed Picker F1, ui-агент). */
  sow: (slot: number, seedKey: ProductKey) => void
  /** Полив грядок (бонус качества/ускорение — считает сервер). */
  water: (plotIds: UUID[]) => void
  /** Сбор урожая грядок. */
  harvest: (plotIds: UUID[]) => void
  /** Покормить животных (03-animals §3.4). */
  feed: (animalIds: UUID[]) => void
  /** Открыть кухонный оверлей (Recipe Box / очереди станков, 19-ui-ux §3.3). */
  openKitchen: (machineId?: UUID) => void
}

const NOOP_ACTIONS: FarmActions = {
  sow: () => {},
  water: () => {},
  harvest: () => {},
  feed: () => {},
  openKitchen: () => {},
}

const FarmActionsContext = createContext<FarmActions>(NOOP_ACTIONS)

/** Хук доступа к действиям фермы из компонентов сцены. */
export function useFarmActions(): FarmActions {
  return useContext(FarmActionsContext)
}

/** Опциональные реальные системы движка (композиция инжектит их поверх дефолта). */
export interface InjectedSystems {
  farm: FarmSystem
  animals: AnimalSystem
}

function toast(kind: Toast['kind'], message: string, now: number): Toast {
  return {
    id: `farm-${now}-${Math.round(Math.random() * 1e6)}`,
    kind,
    message,
    createdAt: now,
    ttlMs: 2500,
  }
}

/** Обновить плоты кэша (оптимистично) через публичный `patchFarm` (кэш, истина серверная). */
function patchPlots(
  farm: FarmSnapshot | null,
  ids: ReadonlySet<UUID>,
  update: (p: FarmSnapshot['plots'][number]) => FarmSnapshot['plots'][number],
): Partial<FarmSnapshot> | null {
  if (!farm) return null
  return { plots: farm.plots.map((p) => (ids.has(p.id) ? update(p) : p)) }
}

/**
 * Провайдер действий фермы. `systems` — опциональные реальные системы (адаптер);
 * при их отсутствии клики дают оптимистичный локальный эффект + тост.
 */
export function FarmActionsProvider({
  systems,
  children,
}: {
  systems?: InjectedSystems
  children: ReactNode
}) {
  const actions = useMemo<FarmActions>(() => {
    const s = useStore.getState
    return {
      sow(slot, seedKey) {
        const now = s().serverNow()
        const farm = s().farm
        if (farm) {
          const patch = patchPlots(farm, new Set(farm.plots.filter((p) => p.slot === slot).map((p) => p.id)), (p) => ({
            ...p,
            state: 'growing',
            seedKey,
            cropKey: seedKey,
            plantedAt: now,
            // UI-only ожидание; серверный readyAt перезапишет при подтверждении.
            readyAt: now + DEMO_GROW_MS,
          }))
          if (patch) s().patchFarm(patch)
        }
        s().pushToast(toast('success', 'Посеяно', now))
        void systems?.farm.sow(slot, seedKey)
      },

      water(plotIds) {
        const now = s().serverNow()
        const farm = s().farm
        const ids = new Set(plotIds)
        const patch = patchPlots(farm, ids, (p) => ({ ...p, wateredUntil: now + DEMO_GROW_MS }))
        if (patch) s().patchFarm(patch)
        s().pushToast(toast('info', 'Полито — грядка скажет спасибо', now))
        void systems?.farm.water(plotIds)
      },

      harvest(plotIds) {
        const now = s().serverNow()
        const farm = s().farm
        const ids = new Set(plotIds)
        const patch = patchPlots(farm, ids, (p) => ({
          ...p,
          state: 'empty',
          seedKey: undefined,
          cropKey: undefined,
          quality: undefined,
          plantedAt: undefined,
          readyAt: undefined,
          wateredUntil: undefined,
        }))
        if (patch) s().patchFarm(patch)
        s().pushToast(toast('success', 'Собрано!', now))
        void systems?.farm.harvest(plotIds)
      },

      feed(animalIds) {
        const now = s().serverNow()
        s().pushToast(toast('success', 'Покормлено', now))
        void systems?.animals.feed(animalIds)
      },

      openKitchen() {
        // Кухонный контекст = Recipe Box / очереди станков (19-ui-ux §3.3). Панель — ui-агент.
        s().openPanel('ui_recipe_box')
      },
    }
  }, [systems])

  return <FarmActionsContext.Provider value={actions}>{children}</FarmActionsContext.Provider>
}
