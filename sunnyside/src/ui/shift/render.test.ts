/**
 * ui/shift/render.test.ts — смоук рендера компонентов смены в node-харнессе (vitest).
 *
 * ПОЧЕМУ renderToString (а не @testing-library/jsdom). Харнесс vitest здесь node-only
 * (`environment: 'node'`, include `*.test.ts`) — общий с engine/state (граница §3.1). Полный
 * DOM-рендер+клик потребовал бы jsdom и `.tsx` в include, т.е. правку архитектурного
 * vite.config (чужой файл, AGENTS.md §0.6). Ключевые ВЗАИМОДЕЙСТВИЯ уже покрыты чистым
 * презентером (`session.test.ts`); здесь — дешёвый смоук «компонент рендерится без краха»
 * через `react-dom/server` + `createElement` (JSX в .ts недоступен), эффекты (rAF) не запускаются.
 */

import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ShiftScreen } from './ShiftScreen'
import { Receipt } from './Receipt'
import { ShiftHost } from './ShiftHost'
import { DEMO_DISH_POOL } from './pool'
import { initRun } from './session'

describe('render smoke', () => {
  it('ShiftScreen рендерится (начальный кадр) и печатает счётчики', () => {
    const run = initRun({ seed: 42, tentLevel: 1, pool: [...DEMO_DISH_POOL] })
    const html = renderToStaticMarkup(
      createElement(ShiftScreen, {
        initial: run,
        startedAt: 0,
        now: () => 0,
        onEnd: () => {},
      }),
    )
    expect(html).toContain('СМЕНА')
    expect(html).toContain('Серия ×0')
    expect(html).toContain('Готовый сток')
  })

  it('Receipt печатает итоговые числа как чек', () => {
    const html = renderToStaticMarkup(
      createElement(Receipt, {
        result: { served: 12, fairScore: 840, bucks: 620, tips: 74, ticketsRaw: 1, maxCombo: 7 },
        onClose: () => {},
      }),
    )
    expect(html).toContain('SUNNYSIDE')
    expect(html).toContain('$620')
    expect(html).toContain('×7')
    expect(html).toContain('🎟 1')
  })

  it('ShiftHost (idle) рендерит старт-каркас смены', () => {
    const html = renderToStaticMarkup(createElement(ShiftHost))
    expect(html).toContain('Начать смену')
  })
})
