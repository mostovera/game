/**
 * scene/index.tsx — активная сцена по scene.active (21-client §3.2/§3.3).
 * App монтирует ровно ОДИН <Canvas> и внутри — этот свитч. Смена сцены размонтирует
 * старый граф (освобождение GPU). Code-splitting (React.lazy на *Scene) — задача §3.9,
 * добавляется scene-агентами; здесь прямой импорт ради простоты каркаса.
 */

import type { SceneKey } from '@/types'
import { FarmScene } from './farm/FarmScene'
import { TownScene } from './town/TownScene'
import { FairScene } from './fair/FairScene'
import { ShiftScene } from './shift/ShiftScene'

export function ActiveScene({ active }: { active: SceneKey }) {
  switch (active) {
    case 'farm':
      return <FarmScene />
    case 'town':
      return <TownScene />
    case 'fair':
      return <FairScene />
    case 'shift':
      return <ShiftScene />
  }
}
