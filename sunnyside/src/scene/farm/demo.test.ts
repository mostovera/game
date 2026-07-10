/**
 * demo.test.ts — демо-снапшот фермы для standalone-сцены (node).
 */

import { describe, it, expect } from 'vitest'
import { getAsset } from '@/assets/placeholders/registry'
import { demoFarmSnapshot } from './demo'
import { cropAssetId, animalAssetId, machineAssetId } from './assetMap'
import { resolvePlotAction } from './interactions'

describe('demoFarmSnapshot', () => {
  const now = 1_000_000
  const farm = demoFarmSnapshot(now)

  it('6 стартовых слотов, как в локальном мире', () => {
    expect(farm.plots).toHaveLength(6)
    expect(farm.plots.map((p) => p.slot)).toEqual([0, 1, 2, 3, 4, 5])
  })
  it('покрывает все три действия (посев/полив/сбор) в одном кадре', () => {
    const actions = new Set(farm.plots.map((p) => resolvePlotAction(p, now)))
    expect(actions.has('sow')).toBe(true)
    expect(actions.has('water')).toBe(true)
    expect(actions.has('harvest')).toBe(true)
  })
  it('все культуры/животные/станки резолвятся в существующие заглушки', () => {
    for (const p of farm.plots) {
      const id = cropAssetId(p.cropKey ?? p.seedKey)
      if (id !== null) expect(getAsset(id)).toBeDefined()
    }
    for (const a of farm.animals) expect(getAsset(animalAssetId(a.kind))).toBeDefined()
    for (const m of farm.machines) expect(getAsset(machineAssetId(m.key))).toBeDefined()
  })
  it('постройки резолвятся в заглушки реестра', () => {
    for (const key of Object.keys(farm.buildings)) expect(getAsset(key)).toBeDefined()
  })
})
