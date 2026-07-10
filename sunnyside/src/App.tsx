/**
 * App.tsx — корень приложения (21-client §3.2, интегратор C3). Собирает играбельное целое:
 *
 *  ┌ <Canvas key=scene> … ActiveScene ┐  ← ровно ОДИН 3D-канвас на активную сцену
 *  │ (смена scene.active → размонтаж графа, освобождение GPU)                       │
 *  └───────────────────────────────────────────────────────────────────────────────┘
 *  Поверх канваса — DOM-оверлеи, обёрнутые в <SystemsProvider> (DI систем движка):
 *    · <Hud/>        — marquee/навигация/тосты/колокол/net-плашка (зона hud-nav)
 *    · <PanelHost/>  — все канон-панели `ui_*` в модальном каркасе (ui.activePanel)
 *    · <OnboardingHost/> — FTUE поверх всего, пока не пройден (18-onboarding)
 *
 * БУТСТРАП (§3.2): при монтировании — init адаптера → сессия → serverOffset → гидрация
 * слайсов → подписка на уведомления. Дип-линки `?screen=`/`?panel=` (dev/e2e) применяются
 * поверх (для ручного/смоук-обхода всех экранов), FTUE при этом пропускается, чтобы экран
 * был виден.
 */

import { Canvas } from '@react-three/fiber'
import { Component, Suspense, useEffect, type ReactNode } from 'react'
import { useStore } from '@/state'
import { ActiveScene } from '@/scene'
import { Hud } from '@/ui/Hud'
import { OnboardingHost, useFtueStore } from '@/ui/onboarding'
import { color } from '@/scene/assets/palette'
import { isDebugEnabled } from '@/bootstrap/debug'
import { SystemsProvider } from './app/SystemsProvider'
import { PanelHost } from './app/PanelHost'
import { bootstrap, getAdapter } from './app/backend'
import { subscribeNotifications } from './app/notifications'

// СБРОС ТРАНЗИЕНТНОГО ОВЕРЛЕЯ НА СТАРТЕ (до первого рендера): `ui.activePanel` попадает в
// persist-whitelist, поэтому после перезагрузки восстанавливается открытая модалка. Это (а)
// нежелательный UX (оверлей — транзиентный), и (б) заставляет Modal смонтироваться сразу
// active=true → в StrictMode двойной прогон history-эффекта Modal сам себя закрывает (гонка
// history.back()→popstate). Открытие панелей идёт только через пост-маунт путь (дип-линк/клик),
// где Modal уже смонтирована неактивной и активируется чисто. Модуль App импортируется в
// main.tsx ДО createRoot — сброс успевает до рендера.
if (useStore.getState().ui.activePanel !== null) useStore.getState().openPanel(null)

// Dev/e2e: доступ к сторам из консоли/смоуков (только dev-сборка).
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { sunnyside?: unknown }).sunnyside = { useStore, useFtueStore }
}

/**
 * SceneBoundary — граница ошибки ВНУТРИ Canvas вокруг активной сцены. Без неё исключение
 * при рендере сцены (напр. drei <Text> не смог подгрузить шрифт в оффлайне/под CSP)
 * всплывает наружу Canvas и гасит ВСЁ приложение вместе с HUD. С границей — падает только
 * сцена (пустой кадр), HUD жив, а переключение сцены (`key` на Canvas меняется) поднимает
 * свежий граф. `sceneKey` сбрасывает границу при смене сцены.
 */
class SceneBoundary extends Component<{ sceneKey: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidUpdate(prev: { sceneKey: string }) {
    if (prev.sceneKey !== this.props.sceneKey && this.state.failed) this.setState({ failed: false })
  }
  render() {
    // Пустой кадр при падении сцены — HUD (вне Canvas) остаётся управляемым.
    return this.state.failed ? null : this.props.children
  }
}

/** Бутстрап + подписки + применение дебаг-дип-линков. Один раз на монтирование App. */
function useBootstrap() {
  useEffect(() => {
    let unsub: (() => void) | undefined
    let cancelled = false

    void bootstrap().then((adapter) => {
      if (cancelled) return
      unsub = subscribeNotifications(adapter)

      // Дип-линки дебага (?panel=; ?screen= уже применён в main.tsx через goto).
      // ВАЖНО: FTUE пропускаем ТОЛЬКО при явном дип-линке экрана/панели (обход всех
      // экранов для дебага/смоуков), а не на каждом dev-запуске — иначе живой FTUE
      // никогда бы не показался в разработке.
      if (isDebugEnabled()) {
        const { panel, screen } = useStore.getState().ui.debug
        if (panel) useStore.getState().openPanel(panel)
        if (screen || panel) {
          const ftue = useFtueStore.getState()
          if (ftue.phase !== 'done') ftue.finish()
        }
      }
    })

    return () => {
      cancelled = true
      unsub?.()
      void getAdapter().dispose()
    }
  }, [])
}

export function App() {
  const active = useStore((s) => s.scene.active)
  const liteMode = useStore((s) => s.ui.perf.liteMode)
  const locale = useStore((s) => s.ui.locale)
  const streetJoined = useFtueStore((s) => s.streetJoined)

  useBootstrap()

  return (
    <div className="relative h-full w-full">
      <Canvas
        // key по сцене → полный размонтаж графа при переходе (освобождение GPU-памяти).
        key={active}
        shadows={!liteMode}
        dpr={liteMode ? 1 : ([1, 1.5] as [number, number])}
        camera={{ position: [10, 9, 12], fov: 42 }}
        style={{ background: color('sky_day') }}
      >
        <Suspense fallback={null}>
          <SceneBoundary sceneKey={active}>
            <ActiveScene active={active} />
          </SceneBoundary>
        </Suspense>
      </Canvas>

      {/* DOM-оверлеи поверх канваса, с DI-провайдерами систем движка. */}
      <SystemsProvider>
        <Hud />
        <PanelHost />
        <OnboardingHost
          locale={locale}
          canSkip={streetJoined}
          onStreetJoin={() => useFtueStore.getState().joinStreet()}
        />
      </SystemsProvider>
    </div>
  )
}
