/**
 * ShiftScene.tsx — активная смена у прилавка (21-client §3.3). Мини-игра подачи (соло, D4).
 * Тики локальны в пределах смены; итог — одна серверная мутация (§3.6). Каркас-заглушка.
 */

import { Lights, Ground, CameraRig } from '../common/Rig'
import { Prop } from '../assets/Prop'

export function ShiftScene() {
  return (
    <>
      <Lights />
      <Ground size={16} />
      <CameraRig />
      <Prop assetKey="bld_diner" position={[0, 1, -2]} />
    </>
  )
}
