/**
 * ui/collections — экраны коллекций (17-collections.md): Recipe Box, Ribbon Wall,
 * Postcards, Toy Shelf (+ Prize Machine pulls), Achievement Wall, Kodachrome Photo
 * Mode, Neon Builder. Композиция оборачивает дерево в `<CollectionSystemProvider>`
 * с реальным `CollectionSystem` (см. `CollectionSystemContext.tsx`).
 */
export { RecipeBox } from './RecipeBox'
export type { RecipeBoxProps } from './RecipeBox'

export { RibbonWall } from './RibbonWall'
export type { RibbonWallProps } from './RibbonWall'

export { Postcards } from './Postcards'
export type { PostcardsProps } from './Postcards'

export { ToyShelf } from './ToyShelf'
export type { ToyShelfProps } from './ToyShelf'

export { AchievementWall } from './AchievementWall'
export type { AchievementWallProps } from './AchievementWall'

export { PhotoMode } from './PhotoMode'
export type { PhotoModeProps, PhotoFilterKey } from './PhotoMode'

export { NeonBuilder } from './NeonBuilder'
export type { NeonBuilderProps } from './NeonBuilder'

export { CollectionSystemProvider, useCollectionSystem } from './CollectionSystemContext'
