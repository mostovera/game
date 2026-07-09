/**
 * <Hero> — персонаж. Клик по земле задаёт цель, герой идёт к ней.
 *
 * Модель приезжает из hero.glb тремя узлами: HeroBody и две ноги, у которых
 * origin в бедре (см. tools/_export_hero.py). Ходьбу анимирует этот компонент,
 * а не AnimationMixer: ног две, цикл — синус, мешать сюда клипы незачем.
 *
 * Взаимодействие со слотами остаётся мгновенным и от позиции героя не зависит:
 * ходьба здесь декоративная. Поэтому в game/ ничего не добавляется.
 */
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { applyPalette, type Palette, type Vec3 } from '../assets/scene'
import { heroTarget } from './heroTarget'

const HERO_URL = '/assets/props/hero.glb'
useGLTF.preload(HERO_URL)

const SPEED = 1.6 // м/с
const STEP_RATE = 9 // рад/с — частота шага
const STEP_AMP = 0.5 // рад — размах ноги
const TURN_LAMBDA = 10 // скорость доворота на цель
const AMP_LAMBDA = 8 // с какой скоростью ноги замирают на месте
const ARRIVE = 0.05 // ближе этого считаем, что пришли
const MAX_DT = 0.1 // как в TruckTick: на фоновой вкладке dt огромен

/** Куда герой смотрит в модели — на −Z, как принято в three. */
function yawTo(dx: number, dz: number) {
  return Math.atan2(-dx, -dz)
}

export function Hero({ palette, start }: { palette: Palette; start: Vec3 }) {
  const { scene } = useGLTF(HERO_URL)

  const model = useMemo(() => {
    const clone = scene.clone(true)
    applyPalette(clone, palette, { cast: true })
    return clone
  }, [scene, palette])

  const legs = useMemo(
    () => ({
      l: model.getObjectByName('HeroLegL'),
      r: model.getObjectByName('HeroLegR'),
    }),
    [model],
  )

  const group = useRef<THREE.Group>(null)
  const phase = useRef(0)
  const amp = useRef(0)

  // Без этого цель осталась бы в мировом нуле и герой на старте пошёл бы в дом.
  useEffect(() => {
    heroTarget.set(...start)
  }, [start])

  useFrame((_, rawDt) => {
    const g = group.current
    if (!g) return

    // Незажатый dt телепортирует героя: шаг ограничен дистанцией до цели,
    // и один длинный кадр (свёрнутая вкладка, пауза GC) проходит весь путь.
    const dt = Math.min(rawDt, MAX_DT)

    const dx = heroTarget.x - g.position.x
    const dz = heroTarget.z - g.position.z
    const dist = Math.hypot(dx, dz)
    const walking = dist > ARRIVE

    if (walking) {
      const step = Math.min(SPEED * dt, dist) // не перелетаем цель
      g.position.x += (dx / dist) * step
      g.position.z += (dz / dist) * step

      // Доворот по кратчайшей дуге: без нормализации герой крутится через полный круг.
      const delta = ((yawTo(dx, dz) - g.rotation.y + Math.PI) % (2 * Math.PI)) - Math.PI
      g.rotation.y += delta * (1 - Math.exp(-TURN_LAMBDA * dt))

      phase.current += STEP_RATE * dt
    }

    // Ноги не замирают рывком в случайной точке цикла — размах затухает.
    amp.current = THREE.MathUtils.damp(amp.current, walking ? STEP_AMP : 0, AMP_LAMBDA, dt)
    const swing = Math.sin(phase.current) * amp.current
    if (legs.l) legs.l.rotation.x = swing
    if (legs.r) legs.r.rotation.x = -swing
  })

  return (
    <group ref={group} position={start}>
      <primitive object={model} />
    </group>
  )
}
