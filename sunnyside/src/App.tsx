/**
 * App.tsx — корень приложения (21-client §3.2). Ровно ОДИН <Canvas> на активную сцену
 * + DOM-<Hud/> поверх. Смена scene.active размонтирует старый граф и монтирует новый.
 */

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useStore } from '@/state'
import { ActiveScene } from '@/scene'
import { Hud } from '@/ui/Hud'
import { color } from '@/scene/assets/palette'

export function App() {
  const active = useStore((s) => s.scene.active)
  const liteMode = useStore((s) => s.ui.perf.liteMode)

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
          <ActiveScene active={active} />
        </Suspense>
      </Canvas>
      <Hud />
    </div>
  )
}
