/**
 * Streets.tsx — лучи стритов от площади с фермами соседей (11-town §3.1/§3.2).
 * Клик по чужой ферме поднимает панель визита (TownScene владеет выбором — этот
 * компонент только сообщает, какую ферму выбрали через `onSelectFarm`).
 */

import { Billboard, Text } from '@react-three/drei'
import { Prop } from '../assets/Prop'
import { farmPosition, groupRosterByStreet, orderedStreets, streetSignPosition, type RosterEntry } from './layout'
import type { Street } from '@/types'

export interface VisitTarget {
  farmId: string
  displayName: string
  streetId: string
}

export interface StreetsProps {
  streets: readonly Street[]
  roster: readonly RosterEntry[]
  /** Своя ферма (session.identity.farmId) — подсвечивается, клик по ней не открывает визит. */
  ownFarmId?: string
  onSelectFarm: (farm: VisitTarget) => void
}

function FarmMarker({
  entry,
  position,
  isOwn,
  onSelectFarm,
}: {
  entry: RosterEntry
  position: [number, number, number]
  isOwn: boolean
  onSelectFarm: (farm: VisitTarget) => void
}) {
  return (
    <group
      position={position}
      data-testid={`town-farm-${entry.farmId}`}
      onClick={(e) => {
        e.stopPropagation()
        if (isOwn) return
        onSelectFarm({ farmId: entry.farmId, displayName: entry.displayName, streetId: entry.streetId })
      }}
    >
      <Prop assetKey={isOwn ? 'bld_diner' : 'bld_house'} position={[0, 1, 0]} scale={isOwn ? 1.15 : 1} />
      <Billboard position={[0, 2.4, 0]}>
        <Text fontSize={0.26} color="#2b2b2e" outlineWidth={0.02} outlineColor="#f5ecd6" anchorX="center" anchorY="bottom">
          {isOwn ? `${entry.displayName} (ты)` : entry.displayName}
        </Text>
      </Billboard>
    </group>
  )
}

export function Streets({ streets, roster, ownFarmId, onSelectFarm }: StreetsProps) {
  const ordered = orderedStreets(streets)
  const grouped = groupRosterByStreet(roster)
  const total = ordered.length

  return (
    <group>
      {ordered.map((street, streetIndex) => {
        const members = grouped.get(street.id) ?? []
        const signPos = streetSignPosition(streetIndex, total)
        return (
          <group key={street.id}>
            <Billboard position={[signPos[0], 1.4, signPos[2]]}>
              <Text fontSize={0.34} color="#e2523b" outlineWidth={0.02} outlineColor="#f5ecd6" anchorX="center" anchorY="bottom">
                {street.name}
              </Text>
            </Billboard>
            {members.map((entry, farmIndex) => (
              <FarmMarker
                key={entry.farmId}
                entry={entry}
                position={farmPosition(streetIndex, total, farmIndex)}
                isOwn={entry.farmId === ownFarmId}
                onSelectFarm={onSelectFarm}
              />
            ))}
          </group>
        )
      })}
    </group>
  )
}
