# Sunnyside

Браузерная кооперативная ферма-дайнер в эстетике американских 50-х. Игрок
выращивает культуры, готовит блюда и обслуживает гостей на ярмарке; часть систем
кооперативные и живут на сервере.

## Стек

Vite 5 · React 18 · TypeScript (strict) · @react-three/fiber 8 · @react-three/drei 9 ·
three 0.169 · zustand 5 · @supabase/supabase-js 2 · idb 8 · Tailwind 4 · vitest 2 · Playwright.

Пакетный менеджер: **pnpm**. `package.json` в корне репозитория.

## Где что лежит

```
src/
  types/     Словарь всей игры. Лист графа зависимостей: ноль импортов three/react.
  engine/    Логика и контракты. econ/ — чистые эконом-формулы (гейт покрытия ≥90%).
  state/     Zustand-сторы (слайсы). Не импортируют three/scene/ui/net.
  net/       BackendAdapter: local (IndexedDB) и supabase. Очередь мутаций (FIFO, idb).
  scene/     R3F-рендер по сценам (farm/town/fair/shift). Ноль бизнес-правил, ноль net.
  ui/        DOM-оверлей поверх канваса (HUD, панели). Ноль three.
  assets/placeholders/  Мастер-реестр заглушек-ассетов (registry-converge).
  bootstrap/, main.tsx, App.tsx  Композиция и порядок инициализации.
e2e/         Playwright-смоуки ключевых экранов.
scripts/     check-boundaries (страж границ), gen-assets-table, db-apply, agent-db.
docs/specs/  Спеки и канон — источник правил игры.
supabase/    Миграции и edge-функции бэкенда.
```

**Граница `логика ↔ рендер` жёсткая:** `types/`/`engine/`/`state/` не знают `three`
и `@react-three/*`. Проверяется `pnpm lint:boundary`. Если в них появился импорт
three — это баг, а не решение.

## Источник правды по правилам

`docs/specs/` — канон и спеки. При конфликте истина — `00-canon.md`. Клиент —
`21-client.md`, бэкенд — `20-backend.md`. Конвенции кода, владение файлами и
тестовые гейты — в `AGENTS.md` (корень).

## Команды

| Команда | Что делает |
|---|---|
| `pnpm dev` | Vite dev-сервер |
| `pnpm build` | `tsc -b && vite build` — должен быть зелёным до коммита |
| `pnpm test` | vitest (node) — юниты `engine/`/`state/` |
| `pnpm test:coverage` | покрытие; гейт `engine/econ/**` ≥ 90% строк |
| `pnpm e2e` | Playwright-смоуки |
| `pnpm lint:boundary` | страж границ модулей |

**CI-гейт до мержа:** `pnpm lint:boundary && pnpm test && pnpm build` зелёные.

## Правила работы

- `pnpm lint:boundary`, `pnpm test` и `pnpm build` проходят перед коммитом.
- Не добавлять зависимости без спроса. Не использовать `any`, не глушить ошибки
  try/catch без обработки.
- Клиент не считает награду сам — любая мутация серверного стейта идёт через
  `BackendAdapter`. Время в игровой логике — только `serverNow()`, не `Date.now()`.
- Балансы валют не персистятся (анти-подмена).
- Нейминг сущностей — из канона (`00-canon.md`), не выдумывается. Ключи в коде —
  английский `snake_case`; UI-строки — RU/EN через `ui.locale`.

## Агентский протокол

Перед работой прочти `AGENTS.md` и сделай checkin (`scripts/agent-db.mjs`).
