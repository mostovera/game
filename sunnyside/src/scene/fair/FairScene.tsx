/**
 * FairScene.tsx — ярмарка: прилавок игрока + ряды прилавков, конкурсы (21-client §3.3).
 * v0.2: пассивный прилавок + конкурсы; Appetite Meter/event — v0.4. Каркас-заглушка.
 */

import { Lights, Ground, CameraRig } from '../common/Rig'
import { Prop } from '../assets/Prop'

export function FairScene() {
  return (
    <>
      <Lights />
      <Ground size={30} />
      <CameraRig />
      <Prop assetKey="bld_diner" position={[0, 1, 0]} />
    </>
  )
}
