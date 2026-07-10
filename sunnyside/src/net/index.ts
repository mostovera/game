/**
 * net/index.ts — фабрика BackendAdapter (21-client §3.5).
 *
 * Выбор реализации: VITE_BACKEND_ADAPTER ('local' | 'supabase'). Если 'supabase' выбран,
 * но URL/ключ не заданы — падаем на 'local' (dev по умолчанию).
 */

import type { BackendAdapter, BackendAdapterKind, CreateBackendAdapter } from '@/engine/contracts'
import { createLocalAdapter } from './adapters/local'
import { createSupabaseAdapter } from './adapters/supabase'

export const createBackendAdapter: CreateBackendAdapter = (
  kind?: BackendAdapterKind,
): BackendAdapter => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  const requested = kind ?? import.meta.env.VITE_BACKEND_ADAPTER ?? 'local'

  if (requested === 'supabase' && url && key) {
    return createSupabaseAdapter({ url, publishableKey: key })
  }
  return createLocalAdapter()
}

export type { BackendAdapter, BackendAdapterKind } from '@/engine/contracts'
