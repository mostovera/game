/**
 * DevTimeskip.tsx — демо-таймскип кнопка dev-режима (задача зоны `hud-nav`).
 *
 * Сдвигает клиентский `clock.serverOffset` (единственный источник `serverNow()`,
 * 21-client §3.6) вперёд на 1 час за клик — все таймеры, читающие `serverNow()`
 * (плашка дня, `isReady`/`remainingMs` будущих панелей), воспринимают время как
 * прошедшее. Полезно для ручного QA без ожидания.
 *
 * TODO(net-local): это НЕ ускоряет внутренние часы `LocalBackendAdapter`
 * (`net/adapters/local.ts` использует свой `now()`, инжектируемый только в
 * конструкторе — `createLocalAdapter({ clock })`, не в рантайме). Настоящее
 * ускорение локального адаптера для смоук-тестов требует прокинуть общий
 * управляемый `clock` из `net/index.ts` в адаптер при бутстрапе — зона `net local`,
 * не `hud-nav`. До тех пор эта кнопка двигает только клиентское ВОСПРИЯТИЕ времени
 * (баннер/countdown), RPC-мутации по-прежнему валидируются реальным Date.now().
 *
 * Гейт `isDebugEnabled()` (bootstrap/debug, чистая функция) — не в проде.
 */

import { useStore } from '@/state'
import { isDebugEnabled } from '@/bootstrap/debug'

const SKIP_MS = 60 * 60 * 1000 // 1 час

export function DevTimeskip() {
  const setServerOffset = useStore((s) => s.setServerOffset)
  const serverOffset = useStore((s) => s.clock.serverOffset)
  const pushToast = useStore((s) => s.pushToast)
  const pushNotification = useStore((s) => s.pushNotification)
  const serverNow = useStore((s) => s.serverNow)

  if (!isDebugEnabled()) return null

  const handleClick = () => {
    setServerOffset(serverOffset + SKIP_MS)
    const now = serverNow()
    pushToast({
      id: `dev-timeskip-${now}`,
      kind: 'info',
      message: '⏩ +1ч (dev) — clock.serverOffset сдвинут',
      createdAt: Date.now(),
      ttlMs: 6000,
    })
    pushNotification({
      id: `dev-timeskip-notif-${now}`,
      kind: 'system',
      message: 'Время ускорено на 1 час (dev-режим)',
      createdAt: now,
    })
  }

  return (
    <button
      type="button"
      data-testid="dev-timeskip"
      onClick={handleClick}
      title="Dev only: +1ч к clock.serverOffset"
      className="pointer-events-auto rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white/80 hover:text-white"
    >
      ⏩ +1ч
    </button>
  )
}
