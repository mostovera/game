/**
 * TownScene.tsx — город: площадь + стриты, town projects (21-client §3.3). Слой v0.3.
 * Рисуется LOD/имперостерами (§3.9) — 100–200 ферм не полными мешами. Каркас-заглушка.
 */

import { Lights, Ground, CameraRig } from '../common/Rig'
import { Prop } from '../assets/Prop'

export function TownScene() {
  return (
    <>
      <Lights />
      <Ground size={60} />
      <CameraRig />
      <Prop assetKey="tp_ferris_wheel" position={[0, 3, -6]} />
      <Prop assetKey="tp_drive_in" position={[8, 1.5, -4]} />
    </>
  )
}
