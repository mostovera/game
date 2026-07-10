/**
 * TownScene.tsx — город (11-town): площадь с ярмарочным кругом (Town Projects по
 * стадиям стройки), улицы-стриты с фермами соседей (из local-симуляции — `town` слайс,
 * гидратируемый `adapter.getTown()`), точки фуражинга обочины, визит на чужую ферму.
 *
 * ГРАНИЦА (AGENTS.md §3): читает `state` селекторами, вызывает системы (`engine`).
 * Ноль `@/net` — раскладка/логика вынесены в `layout.ts` (чистые функции) и подкомпоненты.
 *
 * TODO(mail-foraging-owner, social-owner, net-bootstrap): «клик → собрать через adapter»
 * и «помощь/подарок через adapter» упираются в отсутствующую инфраструктуру ВНЕ этой зоны:
 *  - `MailForagingSystem`/`SocialSystem` (engine/contracts.ts) пока не имеют фабрик
 *    (`engine/mail-foraging/system.ts`, `engine/social/system.ts` не существуют);
 *  - `main.tsx` ещё не создаёт `BackendAdapter`/`SystemContext` и не прокидывает их сцене
 *    (см. TODO в main.tsx — «шаги 2–6» бутстрапа сети).
 * Сцена не имеет права дёрнуть `@/net` напрямую (лит-страж `pnpm lint:boundary`), поэтому
 * оба обработчика ниже — честный, задокументированный шов: локальный оптимистичный отклик
 * (тост + локальное состояние), без начисления наград (истина — только с сервера,
 * AGENTS.md §0.3). Когда системы/бутстрап появятся — правки только в `handleHelp`/
 * `handleGift`/`handleForageCollect`, вся раскладка и клики уже готовы.
 */

import { useMemo, useState } from 'react'
import { Billboard, Html, Text } from '@react-three/drei'
import { Lights, Ground, CameraRig } from '../common/Rig'
import { useStore } from '@/state'
import type { HelpActionType } from '@/types'
import { TownProjects } from './TownProjects'
import { Streets, type VisitTarget } from './Streets'
import { ForagePoints } from './ForagePoints'
import { FarmVisitPanel } from './FarmVisitPanel'
import { layoutForagePoints } from './layout'

/** Дневной лимит помощи — гипотеза 11-town §3.3.2/§4.1 (20/день). Локальная UX-подсказка,
 *  истина лимита — серверная (не считаем награду сами, AGENTS.md §0.3). */
const HELP_DAILY_LIMIT_HYPOTHESIS = 20

export function TownScene() {
  const town = useStore((s) => s.town)
  const ownFarmId = useStore((s) => s.session.identity?.farmId)
  const pushToast = useStore((s) => s.pushToast)
  const serverNow = useStore((s) => s.serverNow)

  const [selectedFarm, setSelectedFarm] = useState<VisitTarget | null>(null)
  const [collectedForageIds, setCollectedForageIds] = useState<ReadonlySet<string>>(new Set())
  const [helpsUsedToday, setHelpsUsedToday] = useState(0)

  const foragePoints = useMemo(() => layoutForagePoints(town?.townId ?? 'town-default'), [town?.townId])

  function handleSelectFarm(farm: VisitTarget) {
    setSelectedFarm(farm)
  }

  function handleCloseVisit() {
    setSelectedFarm(null)
  }

  function handleHelp(type: HelpActionType) {
    if (!selectedFarm) return
    if (helpsUsedToday >= HELP_DAILY_LIMIT_HYPOTHESIS) {
      pushToast({
        id: `visit-help-limit-${serverNow()}`,
        kind: 'info',
        message: 'На сегодня помощей хватит — загляни завтра 🙂',
        createdAt: serverNow(),
        ttlMs: 4000,
      })
      return
    }
    // TODO(social-owner): заменить на SocialSystem.help(selectedFarm.farmId, type) —
    // см. шапку файла.
    setHelpsUsedToday((n) => n + 1)
    pushToast({
      id: `visit-help-${type}-${serverNow()}`,
      kind: 'success',
      message: `Помог(ла) соседу «${selectedFarm.displayName}»`,
      createdAt: serverNow(),
      ttlMs: 4000,
    })
  }

  function handleGift() {
    if (!selectedFarm) return
    // TODO(social-owner): заменить на SocialSystem.gift(selectedFarm.farmId, itemKey, qty) —
    // см. шапку файла (требует ещё Gift compose — выбор стака из склада, F4/11-town §3.4).
    pushToast({
      id: `visit-gift-${serverNow()}`,
      kind: 'success',
      message: `Подарок отправлен соседу «${selectedFarm.displayName}»`,
      createdAt: serverNow(),
      ttlMs: 4000,
    })
  }

  function handleForageCollect(pointId: string) {
    // TODO(mail-foraging-owner): заменить на MailForagingSystem.forageClaim/forageCollect —
    // см. шапку файла.
    setCollectedForageIds((prev) => new Set(prev).add(pointId))
    pushToast({
      id: `forage-${pointId}-${serverNow()}`,
      kind: 'success',
      message: 'Собрано на обочине!',
      createdAt: serverNow(),
      ttlMs: 3000,
    })
  }

  return (
    <>
      <Lights />
      <Ground size={70} />
      <CameraRig />

      <TownProjects projects={town?.projects ?? {}} />
      <Streets
        streets={town?.streets ?? []}
        roster={town?.roster ?? []}
        ownFarmId={ownFarmId}
        onSelectFarm={handleSelectFarm}
      />
      <ForagePoints points={foragePoints} collectedIds={collectedForageIds} onCollect={handleForageCollect} />

      {!town && (
        <Billboard position={[0, 5, 0]}>
          <Text fontSize={0.4} color="#2b2b2e" outlineWidth={0.02} outlineColor="#f5ecd6" anchorX="center" anchorY="bottom">
            Открываем карту города…
          </Text>
        </Billboard>
      )}

      {selectedFarm && (
        <Html fullscreen>
          <FarmVisitPanel
            farm={selectedFarm}
            onClose={handleCloseVisit}
            onHelp={handleHelp}
            onGift={handleGift}
            helpsLeftToday={Math.max(0, HELP_DAILY_LIMIT_HYPOTHESIS - helpsUsedToday)}
          />
        </Html>
      )}
    </>
  )
}
