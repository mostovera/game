/**
 * FarmScene.tsx — личная ферма (21-client §3.3). MVP-точка входа игрока.
 *
 * СЕЙЧАС: каркас — земля, свет, камера, несколько placeholder-построек из реестра.
 * Грядки/животные/станки, клики по слотам, инстансинг — добавляют farm/scene-агенты,
 * читая farm-слайс через селекторы (§3.4). Здесь — доказательство, что сцена рендерится.
 */

import { Lights, Ground, CameraRig } from '../common/Rig'
import { Prop } from '../assets/Prop'

export function FarmScene() {
  return (
    <>
      <Lights />
      <Ground />
      <CameraRig />

      {/* Стартовый набор построек-заглушек (позиции — гипотеза, финал из scene-layout). */}
      <Prop assetKey="bld_house" position={[0, 1, 0]} />
      <Prop assetKey="bld_diner" position={[5, 1, -1]} />
      <Prop assetKey="bld_barn" position={[-5, 1.5, -2]} />
      <Prop assetKey="bld_kitchen" position={[-2, 1, 3]} />
      <Prop assetKey="bld_garage" position={[3, 1, 4]} />

      <Prop assetKey="env_tree" position={[-8, 0.7, 5]} />
      <Prop assetKey="env_tree" position={[8, 0.7, 5]} />
      <Prop assetKey="env_bush" position={[-6, 0.2, 6]} />
    </>
  )
}
