/**
 * app/notifications.ts — мост «события бэкенда → лента уведомлений» (S4, 19-ui-ux §3.1).
 *
 * ДВА ИСТОЧНИКА (интегратор C3):
 *   1) Realtime-каналы адаптера (`subscribe`) — для supabase; local их не рассылает
 *      (`subscribe` = no-op), так что для local это forward-совместимая заглушка.
 *   2) Диф снапшотов после гидрации (`diffWorld`) — ЧИСТАЯ функция: сравнивает прошлый
 *      и новый срез мира (неделя/вехи ивента/вымпел) и выдаёт `NotificationItem[]`. Это
 *      то, что реально наполняет колокол при игре на local-адаптере (rollover, вехи котла).
 *
 * ГРАНИЦА: композиция (`src/app/**`). Чистый диф (`diffWorld`/`worldSummary`) node-тестируем.
 */

import { useStore } from '@/state'
import type { BackendAdapter, Unsubscribe } from '@/engine/contracts'
import type { NotificationItem, ServerCalendar, EventSnapshot, RealtimeChannelKind } from '@/types'

/** Минимальный «уведомляемый» срез мира — то, чьё изменение стоит показать в колоколе. */
export interface WorldSummary {
  weekIndex: number
  /** Проценты уже пробитых вех котла ивента (25/50/75/100). */
  milestonesHit: number[]
  streetPennant: boolean
}

/** Снять срез из снапшотов календаря/ивента (null — если ещё не гидрированы). */
export function worldSummary(
  calendar: ServerCalendar | null,
  event: EventSnapshot | null,
): WorldSummary | null {
  if (!calendar || !event) return null
  return {
    weekIndex: calendar.weekIndex,
    milestonesHit: event.meter.milestones.filter((m) => m.hit).map((m) => m.pct),
    streetPennant: event.streetPennant ?? false,
  }
}

/**
 * Чистый диф двух срезов → уведомления (тёплый тон, canon §1.2). `now` — метка serverNow.
 * Первый вызов (prev=null) молчит: это первичная гидрация, а не «событие».
 */
export function diffWorld(
  prev: WorldSummary | null,
  next: WorldSummary,
  now: number,
): NotificationItem[] {
  if (!prev) return []
  const out: NotificationItem[] = []

  if (next.weekIndex > prev.weekIndex) {
    out.push({
      id: `notif-week-${next.weekIndex}`,
      kind: 'server',
      message: `Новая неделя началась — свежая доска спроса и ивент! (нед. ${next.weekIndex})`,
      createdAt: now,
    })
  }

  for (const pct of next.milestonesHit) {
    if (!prev.milestonesHit.includes(pct)) {
      out.push({
        id: `notif-milestone-${next.weekIndex}-${pct}`,
        kind: 'server',
        message: `Котёл Гримсби заполнен на ${pct}% — веха взята!`,
        createdAt: now,
      })
    }
  }

  if (next.streetPennant && !prev.streetPennant) {
    out.push({
      id: `notif-pennant-${next.weekIndex}`,
      kind: 'social',
      message: 'Ваш стрит поднял вымпел на площади — так держать!',
      createdAt: now,
    })
  }

  return out
}

// ── Состояние моста (модуль-синглтон): последний известный срез ──
let lastSummary: WorldSummary | null = null

/**
 * Вызывается после каждой гидрации: считает диф от прошлого среза и пушит уведомления.
 * Идемпотентно по id (`pushNotification` кэпит ленту; повтор id безвреден для UX).
 */
export function noteHydration(): void {
  const s = useStore.getState()
  const next = worldSummary(s.clock.calendar, s.event)
  if (!next) return
  const items = diffWorld(lastSummary, next, s.serverNow())
  for (const item of items) s.pushNotification(item)
  lastSummary = next
}

/** Сброс среза (тесты / повторный бутстрап). */
export function resetNotificationBridge(): void {
  lastSummary = null
}

/** Каналы, чьи рассылки превращаем в уведомления (supabase; local — no-op). */
const WATCHED_CHANNELS: RealtimeChannelKind[] = ['event', 'projects', 'street_board', 'inbox']

/**
 * Подписка на Realtime-каналы адаптера. Для local `subscribe` — no-op (рассылки нет),
 * поэтому это forward-совместимый каркас: supabase-адаптер начнёт слать payload сюда.
 * Возвращает функцию отписки от всех каналов разом.
 */
export function subscribeNotifications(adapter: BackendAdapter): Unsubscribe {
  const unsubs: Unsubscribe[] = WATCHED_CHANNELS.map((ch) =>
    adapter.subscribe(ch, (payload) => {
      const item = payloadToNotification(ch, payload, useStore.getState().serverNow())
      if (item) useStore.getState().pushNotification(item)
    }),
  )
  return () => unsubs.forEach((u) => u())
}

/** Мап сырого Realtime-payload в уведомление (best-effort; неизвестное — тихо игнор). */
function payloadToNotification(
  channel: RealtimeChannelKind,
  payload: unknown,
  now: number,
): NotificationItem | null {
  const msg =
    payload && typeof payload === 'object' && 'message' in payload
      ? String((payload as { message: unknown }).message)
      : null
  if (!msg) return null
  return {
    id: `notif-${channel}-${now}`,
    kind: channel === 'street_board' || channel === 'inbox' ? 'social' : 'server',
    message: msg,
    createdAt: now,
  }
}
