/**
 * TownProjects.tsx — ярмарочный круг: 6 Town Projects по стадиям стройки
 * (canon §3.7, 11-town §3.8). Читает `town.projects` селектором стора, рисует через
 * `<Prop>` (заглушки) — ноль своей геометрии (AGENTS.md §5).
 */

import { Billboard, Text } from '@react-three/drei'
import { Prop } from '../assets/Prop'
import {
  constructionScale,
  PROJECT_RING_ORDER,
  projectRingPosition,
  projectStage,
} from './layout'
import type { TownProject, TownProjectKey } from '@/types'

const PROJECT_LABEL: Record<TownProjectKey, string> = {
  tp_drive_in: 'Drive-in Theater',
  tp_ferris_wheel: 'Ferris Wheel',
  tp_radio_wsun: 'Radio WSUN',
  tp_bandstand: 'Town Bandstand',
  tp_water_tower: 'Water Tower',
  tp_welcome_arch: 'Welcome Arch',
}

function ProjectMarker({ projectKey, project }: { projectKey: TownProjectKey; project: TownProject | undefined }) {
  const index = PROJECT_RING_ORDER.indexOf(projectKey)
  const position = projectRingPosition(index)
  const stage = projectStage(project)
  const pct = project && project.goal > 0 ? Math.round((Math.min(project.progress, project.goal) / project.goal) * 100) : 0

  return (
    <group position={position}>
      {stage === 3 ? (
        <Prop assetKey={projectKey} position={[0, 1, 0]} />
      ) : (
        <Prop assetKey="tp_construction_site" position={[0, 0.8, 0]} scale={constructionScale(stage)} />
      )}
      <Billboard position={[0, stage === 3 ? 3.6 : 2.4, 0]}>
        <Text fontSize={0.32} color="#2b2b2e" outlineWidth={0.02} outlineColor="#f5ecd6" anchorX="center" anchorY="bottom">
          {stage === 3 ? PROJECT_LABEL[projectKey] : `${PROJECT_LABEL[projectKey]} · ${pct}%`}
        </Text>
      </Billboard>
    </group>
  )
}

export function TownProjects({ projects }: { projects: Partial<Record<TownProjectKey, TownProject>> }) {
  return (
    <group>
      {PROJECT_RING_ORDER.map((key) => (
        <ProjectMarker key={key} projectKey={key} project={projects[key]} />
      ))}
    </group>
  )
}
