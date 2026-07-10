/**
 * Prop.tsx — рендер ассета по ключу канона (21-client §3.7).
 * Компонент НЕ знает конкретный ассет — только ключ. Реестр решает placeholder|final.
 *
 * СЕЙЧАС рисуем только примитивы (заглушки). Когда у записи появится `final` и агент
 * подключит useGLTF — здесь добавится ветка загрузки GLB с fallback на placeholder (C8).
 *
 * Эстетика прототипа: MeshLambertMaterial, плоские цвета, ноль PBR (наследие CLAUDE.md).
 */

import { color } from './palette'
import { getAsset, type PlaceholderPart, type PlaceholderSpec } from './registry'

function Primitive({ part }: { part: PlaceholderPart }) {
  const [w, h, d] = part.size
  const c = color(part.color)
  const pos: [number, number, number] = part.offset ?? [0, 0, 0]
  return (
    <mesh position={pos} castShadow receiveShadow>
      {part.shape === 'box' && <boxGeometry args={[w, h, d]} />}
      {part.shape === 'cylinder' && <cylinderGeometry args={[w, w, d, 16]} />}
      {part.shape === 'cone' && <coneGeometry args={[w, d, 16]} />}
      {part.shape === 'sphere' && <sphereGeometry args={[w, 16, 12]} />}
      {part.shape === 'plane' && <planeGeometry args={[w, d]} />}
      <meshLambertMaterial color={c} />
    </mesh>
  )
}

function renderPlaceholder(spec: PlaceholderSpec) {
  if (spec.shape === 'group' && spec.parts) {
    return (
      <group>
        {spec.parts.map((part, i) => (
          <Primitive key={i} part={part} />
        ))}
      </group>
    )
  }
  const part: PlaceholderPart = {
    shape: spec.shape === 'group' ? 'box' : spec.shape,
    size: spec.size ?? [1, 1, 1],
    color: spec.color ?? 'chrome',
  }
  return <Primitive part={part} />
}

export interface PropProps {
  assetKey: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}

export function Prop({ assetKey, position, rotation, scale }: PropProps) {
  const entry = getAsset(assetKey)
  if (!entry) {
    // Неизвестный ключ — заметный маркер вместо пустоты (dev).
    return (
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshLambertMaterial color="#ff00ff" />
      </mesh>
    )
  }
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {renderPlaceholder(entry.placeholder)}
    </group>
  )
}
