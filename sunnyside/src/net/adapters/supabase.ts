/**
 * supabase.ts — SupabaseBackendAdapter: реальные RPC/Edge/Realtime (20-backend §3.4/§3.5).
 *
 * НАЗНАЧЕНИЕ: прод. Мутации — RPC (SECURITY DEFINER) и Edge Functions; чтения — REST
 * (.from().select()); живые обновления — Realtime-каналы. Ключи из import.meta.env
 * (только VITE_SUPABASE_PUBLISHABLE_KEY — секретный в клиент не попадает, §3.5).
 *
 * СЕЙЧАС: тонкая обёртка над createStubAdapter + ленивое создание клиента.
 * Код-агенты волны «net-supabase» переопределяют методы (rpc('sow', …) и т.п.).
 *
 * ГРАНИЦА: владелец файла — агент net-supabase (AGENTS.md).
 */

import type { BackendAdapter } from '@/engine/contracts'
import { createStubAdapter } from './base'

export interface SupabaseAdapterConfig {
  url: string
  publishableKey: string
}

export function createSupabaseAdapter(config: SupabaseAdapterConfig): BackendAdapter {
  const base = createStubAdapter('supabase')
  // TODO(net-supabase): const client = createClient(config.url, config.publishableKey, {
  //   realtime: { params: { eventsPerSecond: NET_TIMINGS.realtimeEventsPerSecond } },
  // })
  void config
  return {
    ...base,
    // TODO(net-supabase): getServerTime → rpc('get_server_time') (21-client §8 п.1),
    // sow → rpc('sow', {...}), harvest → rpc('harvest', {...}), subscribe → channel(...).
  }
}
