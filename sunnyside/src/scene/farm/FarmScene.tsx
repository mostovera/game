/**
 * FarmScene.tsx — личная ферма (21-client §3.3): интерактивная 3D-сцена.
 *
 * Собирает: свет/тон по фазе недели (`DayNight`), землю и 3/4-камеру (`common/Rig`), сетку
 * A-слотов грядок (`PlotField`), постройки/станки/животных (заглушки по реестру), env-пропсы.
 * Действия игрока идут через `FarmActionsProvider` → системы движка/оптимистичный кэш —
 * сцена НЕ ходит в net напрямую (AGENTS.md §3).
 *
 * До гидрации net-bootstrap'ом (getFarm→setFarm — TODO main.tsx) сцена сеет демо-снапшот,
 * чтобы поле сразу было живым и кликабельным (21-client §3.3 «играбельна офлайн»).
 */

import { useEffect } from 'react'
import { Ground, CameraRig } from '../common/Rig'
import { PlaceholderMesh } from '@/assets/placeholders/PlaceholderMesh'
import { useStore } from '@/state'
import { DayNight } from './DayNightRig'
import { PlotField } from './PlotField'
import { Buildings } from './Buildings'
import { Machines } from './Machines'
import { Animals } from './Animals'
import { FarmActionsProvider } from './systems'
import { demoFarmSnapshot } from './demo'
import { ENV_BUSH_POSITIONS, ENV_TREE_POSITIONS } from './layout'

/** Env-пропсы (деревья/кусты) по углам участка — инстансинг-кандидаты (§3.9). */
function EnvProps() {
  return (
    <group>
      {ENV_TREE_POSITIONS.map((pos, i) => (
        <PlaceholderMesh key={`tree-${i}`} id="env_tree" position={pos} />
      ))}
      {ENV_BUSH_POSITIONS.map((pos, i) => (
        <PlaceholderMesh key={`bush-${i}`} id="env_bush" position={pos} />
      ))}
    </group>
  )
}

export function FarmScene() {
  // Демо-сев кэша фермы до серверной гидрации — один раз, если слайс пуст.
  useEffect(() => {
    const st = useStore.getState()
    if (!st.farm) st.setFarm(demoFarmSnapshot(st.serverNow()))
  }, [])

  return (
    <>
      <DayNight />
      <Ground size={40} />
      <CameraRig />

      <FarmActionsProvider>
        <Buildings />
        <PlotField />
        <Machines />
        <Animals />
        <EnvProps />
      </FarmActionsProvider>
    </>
  )
}
