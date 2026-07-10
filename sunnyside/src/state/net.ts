/**
 * net.ts — статус сети, оффлайн-очередь, каналы (21-client §3.5).
 * Только queueLen персистится (сама очередь — в IndexedDB через net/queue.ts).
 */

import type { NetState, QueuedMutation } from '@/types'
import type { SliceCreator } from './types'

export interface NetSlice {
  net: NetState & {
    /** Зеркало длины очереди для UI; сами элементы живут в IndexedDB. */
    pending: QueuedMutation[]
  }
  setOnline: (online: boolean) => void
  setReconnecting: (reconnecting: boolean) => void
  setQueueLen: (len: number) => void
  markSynced: (at: number) => void
}

const initial: NetSlice['net'] = {
  online: true,
  reconnecting: false,
  queueLen: 0,
  lastSyncAt: null,
  channelStatus: {},
  pending: [],
}

export const createNetSlice: SliceCreator<NetSlice> = (set) => ({
  net: initial,
  setOnline: (online) => set((s) => ({ net: { ...s.net, online } })),
  setReconnecting: (reconnecting) => set((s) => ({ net: { ...s.net, reconnecting } })),
  setQueueLen: (queueLen) => set((s) => ({ net: { ...s.net, queueLen } })),
  markSynced: (lastSyncAt) => set((s) => ({ net: { ...s.net, lastSyncAt } })),
})
