/**
 * Machines.tsx — станки кухни на ферме (04-machines). Читает `farm.machines` селектором,
 * выстраивает в ряд перед кухней (`layout.ts`). Клик по станку → кухонный оверлей
 * (Recipe Box / очереди станков, 19-ui-ux §3.3) через `useFarmActions.openKitchen`.
 */

import { useStore } from '@/state'
import { PlaceholderMesh } from '@/assets/placeholders/PlaceholderMesh'
import { machineAssetId } from './assetMap'
import { machinePosition } from './layout'
import { useFarmActions } from './systems'

function setCursor(value: string) {
  if (typeof document !== 'undefined') document.body.style.cursor = value
}

export function Machines() {
  const machines = useStore((s) => s.farm?.machines)
  const actions = useFarmActions()
  if (!machines || machines.length === 0) return null

  return (
    <group>
      {machines.map((machine, i) => (
        <group
          key={machine.id}
          position={machinePosition(i)}
          onClick={(e) => {
            e.stopPropagation()
            actions.openKitchen(machine.id)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setCursor('pointer')
          }}
          onPointerOut={() => setCursor('auto')}
        >
          <PlaceholderMesh id={machineAssetId(machine.key)} />
        </group>
      ))}
    </group>
  )
}
