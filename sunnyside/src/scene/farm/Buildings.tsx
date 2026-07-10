/**
 * Buildings.tsx — постройки фермы (canon §3.8) по фиксированной планировке (`layout.ts`).
 * Читает `farm.buildings` селектором. Клик по кухне/дайнеру → кухонный оверлей (19-ui-ux §3.3);
 * прочие постройки — пассивные заглушки (апгрейд-панель F3 — ui-агент).
 */

import { useStore } from '@/state'
import type { BuildingKey } from '@/types'
import { PlaceholderMesh } from '@/assets/placeholders/PlaceholderMesh'
import { BUILDING_LAYOUT, KITCHEN_BUILDINGS } from './layout'
import { useFarmActions } from './systems'

function setCursor(value: string) {
  if (typeof document !== 'undefined') document.body.style.cursor = value
}

export function Buildings() {
  const buildings = useStore((s) => s.farm?.buildings)
  const actions = useFarmActions()
  if (!buildings) return null

  const keys = Object.keys(buildings) as BuildingKey[]

  return (
    <group>
      {keys.map((key) => {
        const position = BUILDING_LAYOUT[key]
        if (!position) return null
        const isKitchen = KITCHEN_BUILDINGS.includes(key)
        return (
          <group
            key={key}
            position={position}
            onClick={
              isKitchen
                ? (e) => {
                    e.stopPropagation()
                    actions.openKitchen()
                  }
                : undefined
            }
            onPointerOver={
              isKitchen
                ? (e) => {
                    e.stopPropagation()
                    setCursor('pointer')
                  }
                : undefined
            }
            onPointerOut={isKitchen ? () => setCursor('auto') : undefined}
          >
            <PlaceholderMesh id={key} />
          </group>
        )
      })}
    </group>
  )
}
