/**
 * ui/shift/ShiftHost.tsx — жизненный цикл смены: idle → running → receipt (09-fair §3.4).
 *
 * Держит гейт входа (F2: нужен готовый сток → иначе подсказка «сначала наготовь»), старт
 * (seed из serverNow, детерминированная очередь движка), и переключение на чек по завершении.
 * Читает стор селекторами (serverNow / inventory / уровень палатки) — ноль three/net (§3).
 *
 * Монтируется сценой ярмарки через drei <Html> (см. scene/fair/FairScene.tsx). Сам компонент —
 * чистый DOM. Управляет pointer-events: в idle кликабелен только компактный старт-каркас,
 * в running/receipt — полноэкранный оверлей.
 */

import { useMemo, useState } from 'react'
import { useStore } from '@/state'
import type { TentLevel } from '@/engine/fair'
import { poolFromInventory } from './pool'
import { deriveSeed, initRun, type RunState } from './session'
import { ShiftScreen, type ShiftResult } from './ShiftScreen'
import { Receipt } from './Receipt'
import { T } from './theme'

type Phase =
  | { kind: 'idle' }
  | { kind: 'running'; run: RunState; startedAt: number }
  | { kind: 'receipt'; result: ShiftResult }

function clampTent(level: number | undefined): TentLevel {
  const l = Math.min(5, Math.max(1, Math.floor(level ?? 1)))
  return l as TentLevel
}

export function ShiftHost() {
  const serverNow = useStore((s) => s.serverNow)
  const inventory = useStore((s) => s.inventory)
  const stallLevel = useStore((s) => s.fair.stall?.level)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  const pool = useMemo(() => poolFromInventory(inventory), [inventory])
  const tentLevel = clampTent(stallLevel)
  const canStart = pool.length > 0

  function start() {
    if (!canStart) return
    const startedAt = serverNow()
    const run = initRun({ seed: deriveSeed(startedAt), tentLevel, pool })
    setPhase({ kind: 'running', run, startedAt })
  }

  if (phase.kind === 'running') {
    return (
      <ShiftScreen
        initial={phase.run}
        startedAt={phase.startedAt}
        now={serverNow}
        onEnd={(result) => setPhase({ kind: 'receipt', result })}
      />
    )
  }

  if (phase.kind === 'receipt') {
    return <Receipt result={phase.result} onClose={() => setPhase({ kind: 'idle' })} />
  }

  // idle — компактный старт-каркас (не блокирует орбит-камеру: pointer-events только на карточке).
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 20,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        data-testid="shift-start-card"
        style={{
          pointerEvents: 'auto',
          background: T.cream,
          borderRadius: 14,
          padding: '12px 16px',
          textAlign: 'center',
          boxShadow: `0 6px 20px ${T.shadow}`,
          fontFamily: '"Courier New", ui-monospace, monospace',
          color: T.ink,
          maxWidth: 320,
        }}
      >
        <div style={{ fontWeight: 900, letterSpacing: 1, marginBottom: 6 }}>
          ✶ Прилавок открыт ✶
        </div>
        <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 10 }}>
          {canStart
            ? 'Собирай подносы под заказы гостей. Держи серию — чаевые ×2!'
            : 'Сначала наготовь блюд — смене нужен готовый сток.'}
        </div>
        <button
          data-testid="shift-start"
          onClick={start}
          disabled={!canStart}
          style={{
            background: canStart ? T.cherry : T.chromeDark,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 22px',
            fontWeight: 800,
            fontSize: 16,
            fontFamily: 'inherit',
            cursor: canStart ? 'pointer' : 'default',
            opacity: canStart ? 1 : 0.7,
            boxShadow: `0 2px 0 ${T.shadow}`,
          }}
        >
          Начать смену
        </button>
      </div>
    </div>
  )
}
