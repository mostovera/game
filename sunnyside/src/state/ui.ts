/**
 * ui.ts — DOM-оверлей: панели, тосты, локаль, lite mode, дебаг (21-client §3.4).
 * Персистятся ТОЛЬКО locale, liteMode, activePanel. toasts и debug — рантайм-only.
 */

import type { UiScreenKey, Locale, Toast, DebugParams, PerfState } from '@/types'
import type { SliceCreator } from './types'

export interface UiSlice {
  ui: {
    locale: Locale
    activePanel: UiScreenKey | null
    toasts: Toast[]
    debug: DebugParams
    perf: PerfState
  }
  setLocale: (locale: Locale) => void
  openPanel: (panel: UiScreenKey | null) => void
  pushToast: (toast: Toast) => void
  dismissToast: (id: string) => void
  setDebug: (debug: DebugParams) => void
  setLiteMode: (lite: boolean) => void
}

const initial: UiSlice['ui'] = {
  locale: 'ru',
  activePanel: null,
  toasts: [],
  debug: {},
  perf: { liteMode: false, showHud: false, fps: 60 },
}

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  ui: initial,
  setLocale: (locale) => set((s) => ({ ui: { ...s.ui, locale } })),
  openPanel: (activePanel) => set((s) => ({ ui: { ...s.ui, activePanel } })),
  pushToast: (toast) => set((s) => ({ ui: { ...s.ui, toasts: [...s.ui.toasts, toast] } })),
  dismissToast: (id) =>
    set((s) => ({ ui: { ...s.ui, toasts: s.ui.toasts.filter((t) => t.id !== id) } })),
  setDebug: (debug) => set((s) => ({ ui: { ...s.ui, debug } })),
  setLiteMode: (liteMode) => set((s) => ({ ui: { ...s.ui, perf: { ...s.ui.perf, liteMode } } })),
})
