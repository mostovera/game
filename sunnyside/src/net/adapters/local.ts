/**
 * local.ts — LocalBackendAdapter: эмуляция бэкенда в браузере (21-client, анти-чит-паритет).
 *
 * НАЗНАЧЕНИЕ: dev/оффлайн/тесты/Playwright-смоуки без живого Supabase.
 * Персист — IndexedDB (idb). Таймеры детерминированы, серверное время = локальное.
 * Реконструирует результаты серверно (не доверяет клиентским числам) — тот же контракт,
 * что SupabaseBackendAdapter, чтобы UI не различал их.
 *
 * СЕЙЧАС: тонкая обёртка над createStubAdapter. Код-агенты волны «local-sim»
 * переопределяют методы (sow/harvest/craft/…), храня стейт в IndexedDB.
 *
 * ГРАНИЦА: владелец файла — агент net-local (AGENTS.md). Не трогать из scene/.
 */

import type { BackendAdapter } from '@/engine/contracts'
import { createStubAdapter } from './base'

export function createLocalAdapter(): BackendAdapter {
  const base = createStubAdapter('local')
  return {
    ...base,
    // getServerTime в local — локальные часы (offset ≈ 0), чтобы clock.sync прошёл (C4).
    getServerTime: () => Promise.resolve({ ok: true, data: { serverNow: Date.now() } }),
    // ensureSession в local — синтетический анонимный игрок для dev.
    ensureSession: () =>
      Promise.resolve({ ok: true, data: { userId: 'local-dev-player' } }),
    // TODO(net-local): sow/water/harvest/craft/... поверх IndexedDB-стейта.
  }
}
