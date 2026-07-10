/**
 * registry.ts — реестр ассетов placeholder→final (21-client §3.7/§4.4).
 *
 * Компонент <Prop assetKey="bld_diner"/> смотрит СЮДА: есть `final` и грузится → useGLTF;
 * иначе рисуем примитив по `placeholder`. Замена заглушки на финал = добавить путь в
 * поле `final` ОДНОЙ строки. Ноль правок в сценах.
 *
 * Ключи = ключи канона (bld_/tp_/toy_/cos_/st_ + env_*). Синхронизируется с 22-audio-visual.
 */

import type { PaletteName } from './palette'

/** Форма примитива-заглушки. group — композит (напр. дайнер = корпус+навес+вывеска). */
export type PlaceholderShape = 'box' | 'cylinder' | 'cone' | 'sphere' | 'plane' | 'group'

export interface PlaceholderPart {
  shape: Exclude<PlaceholderShape, 'group'>
  size: [number, number, number]
  color: PaletteName | string
  /** Смещение части внутри группы. */
  offset?: [number, number, number]
}

export interface PlaceholderSpec {
  shape: PlaceholderShape
  size?: [number, number, number]
  color?: PaletteName | string
  accent?: PaletteName | string
  /** Для shape:'group' — набор частей. */
  parts?: PlaceholderPart[]
}

export interface AssetEntry {
  placeholder: PlaceholderSpec
  /** Путь к финальному GLB. Пусто/нет → рисуем placeholder. */
  final?: string
}

/**
 * Стартовый срез (21-client §4.4). Полный реестр (все bld_/tp_/toy_/cos_/st_ + env)
 * дополняют арт/сцен-агенты. Значение доступно рантайму.
 */
export const assetRegistry: Record<string, AssetEntry> = {
  // ── Постройки фермы (canon §3.8) ──
  bld_house: { placeholder: { shape: 'box', size: [3, 2, 3], color: 'diner_red' }, final: '/assets/props/house.glb' },
  bld_diner: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'box', size: [3, 2, 2.5], color: 'diner_red' },
        { shape: 'box', size: [3.4, 0.2, 1.2], color: 'chrome', offset: [0, 1.2, 1.4] },
        { shape: 'cylinder', size: [0.2, 0.2, 1.6], color: 'neon_pink', offset: [1.2, 2.4, 0] },
      ],
    },
    final: '/assets/props/diner.glb',
  },
  bld_barn: { placeholder: { shape: 'box', size: [3, 3, 3], color: 'barn_red' } },
  bld_coop: { placeholder: { shape: 'box', size: [2, 1.6, 2], color: 'roof_red' } },
  bld_kitchen: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'box', size: [2.6, 2, 2.2], color: 'wall_yellow' },
        { shape: 'cone', size: [0.4, 0.4, 1], color: 'chrome_dark', offset: [0.8, 1.6, 0] },
      ],
    },
  },
  bld_garage: { placeholder: { shape: 'box', size: [3, 2, 2], color: 'chrome' } },
  bld_silo: { placeholder: { shape: 'cylinder', size: [1, 1, 4], color: 'chrome_dark' } },
  bld_icehouse: { placeholder: { shape: 'box', size: [2, 2, 2], color: 'window_blue' } },
  bld_apiary: { placeholder: { shape: 'cylinder', size: [0.6, 0.8, 1], color: 'neon_yellow' } },

  // ── Town Projects (canon §3.7) ──
  tp_ferris_wheel: { placeholder: { shape: 'cylinder', size: [3, 3, 0.4], color: 'chrome' } },
  tp_drive_in: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'box', size: [5, 3, 0.3], color: 'road_line' },
        { shape: 'plane', size: [6, 0.1, 6], color: 'road_asphalt', offset: [0, -1.4, 3] },
      ],
    },
  },

  // ── Town Projects — остальные 4 объекта + стройплощадка (11-town §3.7/§3.8) ──
  // scene-town: недостающие записи реестра для оставшихся town-project'ов канона —
  // AGENTS.md §5 «добавляешь сущность канона — заведи её запись в registry.ts».
  tp_radio_wsun: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'cylinder', size: [0.15, 0.15, 3], color: 'chrome_dark' },
        { shape: 'sphere', size: [0.25, 0.25, 0.25], color: 'neon_yellow', offset: [0, 3, 0] },
      ],
    },
  },
  tp_bandstand: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'cylinder', size: [1.4, 1.4, 0.3], color: 'diner_cream' },
        { shape: 'cone', size: [1.6, 1.6, 1.2], color: 'roof_red', offset: [0, 1, 0] },
      ],
    },
  },
  tp_water_tower: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'cylinder', size: [1, 1, 1.4], color: 'chrome' },
        { shape: 'cylinder', size: [0.15, 0.15, 2.5], color: 'chrome_dark', offset: [0, -1.8, 0] },
      ],
    },
  },
  tp_welcome_arch: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'box', size: [0.3, 3, 0.3], color: 'chrome', offset: [-2, 1.5, 0] },
        { shape: 'box', size: [0.3, 3, 0.3], color: 'chrome', offset: [2, 1.5, 0] },
        { shape: 'box', size: [4.6, 0.3, 0.3], color: 'neon_teal', offset: [0, 3, 0] },
      ],
    },
  },
  /** Стройплощадка (леса/каркас) — общая заглушка для стадий 1-2 любого tp_* (11-town §3.8.1). */
  tp_construction_site: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'box', size: [1.6, 1.6, 1.6], color: 'chrome_dark' },
        { shape: 'box', size: [0.1, 2, 0.1], color: 'trunk', offset: [0.8, 1, 0.8] },
        { shape: 'box', size: [0.1, 2, 0.1], color: 'trunk', offset: [-0.8, 1, -0.8] },
      ],
    },
  },

  // ── Окружение (инстансится; часть reuse из прототипа) ──
  env_tree: {
    placeholder: {
      shape: 'group',
      parts: [
        { shape: 'cylinder', size: [0.15, 0.15, 1], color: 'trunk' },
        { shape: 'cone', size: [0.7, 0.7, 1.4], color: 'grass_dark', offset: [0, 1, 0] },
      ],
    },
  },
  env_bush: { placeholder: { shape: 'sphere', size: [0.6, 0.4, 0.6], color: 'grass_dark' } },

  // ── Культуры (scale 0→1 при росте; reuse из прототипа) ──
  crop_tomato: { placeholder: { shape: 'sphere', size: [0.2, 0.2, 0.2], color: 'crop_tomato' } },
  crop_greens: { placeholder: { shape: 'cone', size: [0.2, 0.2, 0.3], color: 'crop_greens' } },
  crop_carrot: { placeholder: { shape: 'cone', size: [0.15, 0.15, 0.3], color: 'crop_carrot' } },
}

/** Достать запись реестра (или undefined, если ключ ещё не заведён). */
export function getAsset(assetKey: string): AssetEntry | undefined {
  return assetRegistry[assetKey]
}
