/**
 * Hud.tsx — DOM-оверлей поверх канваса (21-client §5). НЕ в 3D.
 *
 * СЕЙЧАС: заголовок Sunnyside, переключатель сцен, net-плашка, баланс-заготовка.
 * Полные экраны/панели (ui_*, 19-ui-ux) строят ui-агенты. data-testid — якоря для
 * Playwright-смоуков (§3.10).
 */

import { useStore } from '@/state'
import { SCENE_KEYS } from '@/types'
import { NetPlaque } from './NetPlaque'

const SCENE_LABEL: Record<string, string> = {
  farm: 'Ферма',
  town: 'Город',
  fair: 'Ярмарка',
  shift: 'Смена',
}

export function Hud() {
  const active = useStore((s) => s.scene.active)
  const goto = useStore((s) => s.goto)

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
      {/* Верхний ряд: бренд + net-плашка */}
      <div className="flex items-start justify-between">
        <h1
          data-testid="brand"
          className="pointer-events-none select-none text-2xl font-black tracking-wide"
          style={{ color: '#f5ecd6', textShadow: '0 2px 0 rgba(0,0,0,.35)' }}
        >
          Sunnyside
        </h1>
        <NetPlaque />
      </div>

      {/* Нижний ряд: переключатель сцен (прод-навигация = стор, не URL) */}
      <nav
        data-testid="scene-switch"
        className="pointer-events-auto flex gap-2 self-center rounded-full bg-black/40 p-1.5 backdrop-blur"
      >
        {SCENE_KEYS.map((key) => (
          <button
            key={key}
            data-testid={`scene-btn-${key}`}
            onClick={() => goto(key)}
            className={
              'rounded-full px-4 py-1.5 text-sm font-semibold transition ' +
              (active === key ? 'bg-[#e2523b] text-white' : 'text-white/70 hover:text-white')
            }
          >
            {SCENE_LABEL[key]}
          </button>
        ))}
      </nav>
    </div>
  )
}
