/**
 * econ.test.ts — юниты чистых эконом-формул (пример для агентов; гейт ≥90% строк).
 * Запускается в node без браузера — доказывает границу game/scene (21-client §3.1/§3.10).
 */

import { describe, it, expect } from 'vitest'
import { dimeSpeedupCost, saturation, salePrice, farmValue } from './index'

describe('dimeSpeedupCost — ceil(0.41 · t^0.53)', () => {
  it('нулевое/отрицательное время → 0', () => {
    expect(dimeSpeedupCost({ remainingMin: 0 })).toBe(0)
    expect(dimeSpeedupCost({ remainingMin: -5 })).toBe(0)
  })
  it('монотонно растёт с временем', () => {
    const a = dimeSpeedupCost({ remainingMin: 10 })
    const b = dimeSpeedupCost({ remainingMin: 100 })
    expect(b).toBeGreaterThan(a)
    expect(a).toBeGreaterThanOrEqual(1)
  })
})

describe('saturation — убывает с объёмом продаж', () => {
  it('нулевые продажи → без штрафа (≈1)', () => {
    expect(saturation({ category: 'garden', soldQty: 0, demandMultiplier: 1 })).toBeCloseTo(1)
  })
  it('больше продал — ниже множитель, всегда в (0,1]', () => {
    const low = saturation({ category: 'garden', soldQty: 10, demandMultiplier: 1 })
    const high = saturation({ category: 'garden', soldQty: 200, demandMultiplier: 1 })
    expect(high).toBeLessThan(low)
    expect(high).toBeGreaterThan(0)
    expect(low).toBeLessThanOrEqual(1)
  })
  it('высокий спрос смягчает перенасыщение', () => {
    const lowDemand = saturation({ category: 'garden', soldQty: 100, demandMultiplier: 0.8 })
    const highDemand = saturation({ category: 'garden', soldQty: 100, demandMultiplier: 1.3 })
    expect(highDemand).toBeGreaterThan(lowDemand)
  })
})

describe('salePrice', () => {
  it('база × спрос × перенасыщение × качество', () => {
    expect(salePrice(100, 1, 1, 1)).toBe(100)
    expect(salePrice(100, 1.2, 1, 1)).toBe(120)
    expect(salePrice(100, 1, 1, 5)).toBe(140) // +0.1·4
    expect(salePrice(100, 1, 0.5, 1)).toBe(50)
  })
  it('не уходит ниже нуля', () => {
    expect(salePrice(0, 1, 1, 1)).toBe(0)
  })
})

describe('farmValue — Σ(косметика+коллекции) капится 15%', () => {
  it('малый soft — не капится', () => {
    const v = farmValue({ production: 800, buildings: 200, collections: 10, cosmetics: 10 })
    expect(v.total).toBe(1020)
  })
  it('большой soft — капится до 15% total', () => {
    const v = farmValue({ production: 800, buildings: 200, collections: 500, cosmetics: 500 })
    // core=1000, cappedSoft = min(1000, 1000·0.15/0.85 ≈ 176.47) → total ≈ 1176
    expect(v.total).toBe(1176)
    const softShare = (v.total - 1000) / v.total
    expect(softShare).toBeLessThanOrEqual(0.1501)
  })
})
