/**
 * engine/econ — ЧИСТЫЕ эконом-формулы (14-economy). Ноль сети, ноль three, детерминизм.
 *
 * ВАЖНО (анти-чит): это ТОЛЬКО предсказание для UI («примерно $N»), НИКОГДА не источник
 * начисления — сервер считает сам. Гейт покрытия ≥90% строк (21-client §3.10, vite.config).
 *
 * Мастер-числа (коэффициенты) — гипотезы из канона §2.2 / 14-economy; при расхождении
 * канон — истина. Формулы стабильны, числа выносятся в конфиг позже.
 */

import type {
  EconSystem,
  // (тип системы — для справки; здесь экспортируем функции + сборку объекта)
} from '@/engine/contracts'
import type {
  SaturationInput,
  DimeSpeedupInput,
  FarmValueAxes,
} from '@/types'

/**
 * Цена Dimes-ускорения: ceil(0.41 · t^0.53), t — оставшиеся минуты (21-client §3.10).
 */
export function dimeSpeedupCost({ remainingMin }: DimeSpeedupInput): number {
  if (remainingMin <= 0) return 0
  return Math.ceil(0.41 * Math.pow(remainingMin, 0.53))
}

/**
 * Множитель перенасыщения S_sat (14-economy): чем больше продал стрит категории,
 * тем ниже маржа. Убывающая кривая в (0,1], смягчённая спросом.
 * Гипотеза: 1 / (1 + soldQty / (k · demandMultiplier)), k=20.
 */
export function saturation({ soldQty, demandMultiplier }: SaturationInput): number {
  const k = 20
  const denom = 1 + Math.max(0, soldQty) / (k * Math.max(0.01, demandMultiplier))
  return 1 / denom
}

/**
 * Итоговая цена продажи: base × demand × saturation × qualityFactor.
 * qualityFactor: 1 + 0.1·(quality−1) (5 ступеней → до ×1.4).
 */
export function salePrice(
  basePrice: number,
  demandMult: number,
  saturationMult: number,
  quality: number,
): number {
  const qualityFactor = 1 + 0.1 * (Math.max(1, quality) - 1)
  return Math.max(0, Math.round(basePrice * demandMult * saturationMult * qualityFactor))
}

/**
 * Агрегат Farm Value (13/14): сумма 4 осей, но Σ(косметика+коллекции) капится 15% total.
 */
export function farmValue(axes: Omit<FarmValueAxes, 'total'>): FarmValueAxes {
  const core = axes.production + axes.buildings
  const soft = axes.collections + axes.cosmetics
  // total = core + min(soft, 15% итога). Решаем неравенство относительно cap.
  const cappedSoft = Math.min(soft, (core * 0.15) / 0.85)
  const total = Math.round(core + cappedSoft)
  return { ...axes, total }
}

/** Сборка EconSystem из чистых функций (для внедрения в системы). */
export const econSystem: EconSystem = {
  saturation,
  dimeSpeedupCost,
  salePrice,
  farmValue,
}
