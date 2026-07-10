/**
 * collections.ts — игрушки, косметика, открытки, ленты (17-collections). Кэш.
 */

import type { CollectionsSnapshot } from '@/types'
import type { SliceCreator } from './types'

export interface CollectionsSlice {
  collections: CollectionsSnapshot | null
  setCollections: (collections: CollectionsSnapshot) => void
}

export const createCollectionsSlice: SliceCreator<CollectionsSlice> = (set) => ({
  collections: null,
  setCollections: (collections) => set({ collections }),
})
