/**
 * DayNight.tsx — свет и тон сцены по фазе игровой недели (01-core-loop, canon §2.3).
 * Фаза берётся из серверного календаря (`clock.calendar.phase`); чистое отображение
 * фаза→тон живёт в `daynight.ts`. Суббота — тёплый закат, воскресенье — вечер, будни — день.
 */

import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Color } from 'three'
import { useStore } from '@/state'
import { phaseTone } from './daynight'

export function DayNight() {
  const phase = useStore((s) => s.clock.calendar?.phase ?? null)
  const tone = useMemo(() => phaseTone(phase), [phase])
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    scene.background = new Color(tone.background)
  }, [scene, tone.background])

  return (
    <>
      <ambientLight intensity={tone.ambient} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={tone.dirIntensity}
        color={tone.dirColor}
        castShadow
      />
    </>
  )
}
