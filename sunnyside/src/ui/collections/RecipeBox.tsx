/**
 * ui/collections/RecipeBox.tsx — K2 Recipe Box (docs/specs/19-ui-ux.md §3.3 K2,
 * 17-collections §2.1): «бабушкина коробка карточек» — веер/сетка рецептов,
 * mastery ★ по счётчику «готовили N раз», таб `Unlocked / Locked / Secret`.
 *
 * Читает контент-каталог `@/data/catalogs/recipes` (read-only) + кэш
 * `collections.recipeMastery` (state/collections.ts, счётчик `timesCooked` —
 * серверная истина, инкремент при `craft_collect`, эта карточка не считает
 * mastery сама — только показывает производную через `masteryProgress`
 * (engine/collections/mastery.ts), см. AGENTS.md §0.3 анти-чит.
 *
 * «Разблокировано» — эвристика презентации (данных о завершённых экспедициях/
 * секретных открытиях в сторе пока нет, TODO(owner: progression/expeditions)):
 *  - starter → всегда разблокирован.
 *  - level → farmLevel игрока ≥ требуемого.
 *  - state → есть открытка этого штата (сет открыток приходит только после
 *    завершения экспедиции туда, `engine/collections/postcards.ts`).
 *  - experiment (секретка) → уже «проявлена» (есть запись в recipeMastery).
 * Запуск готовки (K2 «карточки веером... + запуск готовки») — вне скоупа этой
 * карточки: реальный `CraftSystem.start` живёт в зоне ui-kitchen (см.
 * `ui/kitchen/MachineQueues.tsx`); эта карточка отдаёт `onCraft` как опциональный
 * колбэк композиции, не дублирует крафт-механику.
 */
import { useMemo, useState } from 'react'
import { useStore } from '@/state'
import { recipes } from '@/data/catalogs/recipes'
import type { Recipe } from '@/data/schema'
import type { Postcard } from '@/types'
import { masteryProgress } from '@/engine/collections'
import { DINER, PRINT_SHADOW } from './tokens'

type UnlockTab = 'unlocked' | 'locked' | 'secret'

function isUnlocked(recipe: Recipe, farmLevel: number, postcardStateKeys: ReadonlySet<string>, discovered: ReadonlySet<string>): boolean {
  switch (recipe.unlock.kind) {
    case 'starter':
      return true
    case 'level':
      return farmLevel >= recipe.unlock.farmLevel
    case 'state':
      return postcardStateKeys.has(recipe.unlock.stateKey)
    case 'experiment':
      return discovered.has(recipe.key)
    default:
      return false
  }
}

// Fallback стабильной ссылкой — иначе селектор возвращает новый объект/массив на
// каждый вызов и zustand useSyncExternalStore уходит в бесконечный ре-рендер.
const EMPTY_MASTERY: Readonly<Record<string, number>> = {}
const EMPTY_POSTCARDS: readonly Postcard[] = []

export interface RecipeBoxProps {
  onCraft?: (recipeKey: string) => void
  onClose?: () => void
}

export function RecipeBox({ onCraft, onClose }: RecipeBoxProps) {
  const locale = useStore((s) => s.ui.locale)
  const farmLevel = useStore((s) => s.farm?.farmLevel ?? 1)
  const recipeMastery = useStore((s) => s.collections?.recipeMastery ?? EMPTY_MASTERY)
  const postcards = useStore((s) => s.collections?.postcards ?? EMPTY_POSTCARDS)

  const [tab, setTab] = useState<UnlockTab>('unlocked')
  const [tierFilter, setTierFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all')
  const [query, setQuery] = useState('')

  const postcardStateKeys = useMemo(
    () => new Set(postcards.filter((p) => p.owned && p.stateKey).map((p) => p.stateKey as string)),
    [postcards],
  )
  const discovered = useMemo(() => new Set(Object.keys(recipeMastery)), [recipeMastery])

  const rows = useMemo(() => {
    return (recipes as Recipe[])
      .filter((r) => r.unlock.kind !== 'experiment' || tab === 'secret' || discovered.has(r.key))
      .filter((r) => {
        const unlocked = isUnlocked(r, farmLevel, postcardStateKeys, discovered)
        if (tab === 'secret') return r.unlock.kind === 'experiment'
        if (tab === 'unlocked') return unlocked && r.unlock.kind !== 'experiment'
        return !unlocked && r.unlock.kind !== 'experiment'
      })
      .filter((r) => tierFilter === 'all' || r.tier === tierFilter)
      .filter((r) => {
        if (!query.trim()) return true
        const q = query.trim().toLowerCase()
        return r.name.en.toLowerCase().includes(q) || r.name.ru.toLowerCase().includes(q) || r.key.includes(q)
      })
  }, [tab, tierFilter, query, farmLevel, postcardStateKeys, discovered])

  return (
    <section
      data-testid="recipe-box"
      className="flex max-h-[80vh] w-full max-w-4xl flex-col gap-3 overflow-hidden rounded-2xl p-4"
      style={{ background: DINER.paper }}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-black uppercase tracking-wide" style={{ color: DINER.board }}>
          {locale === 'ru' ? 'Коробка рецептов' : 'Recipe Box'}
        </h2>
        {onClose && (
          <button
            type="button"
            data-testid="recipe-box-close"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-bold"
            style={{ background: DINER.board, color: DINER.boardInk }}
          >
            {locale === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(['unlocked', 'locked', 'secret'] as const).map((t) => (
          <button
            key={t}
            type="button"
            data-testid={`recipe-box-tab-${t}`}
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{
              background: tab === t ? DINER.cherry : DINER.card,
              color: tab === t ? 'white' : '#2b2118',
              border: `1px solid ${DINER.chrome}`,
            }}
          >
            {t === 'unlocked'
              ? locale === 'ru'
                ? 'Открытые'
                : 'Unlocked'
              : t === 'locked'
                ? locale === 'ru'
                  ? 'Закрытые'
                  : 'Locked'
                : locale === 'ru'
                  ? 'Секретки'
                  : 'Secret'}
          </button>
        ))}

        <select
          data-testid="recipe-box-tier-filter"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3 | 4 | 5))}
          className="rounded-lg border px-2 py-1 text-xs"
          style={{ borderColor: DINER.chrome, background: DINER.card, color: '#2b2118' }}
        >
          <option value="all">{locale === 'ru' ? 'Все тиры' : 'All tiers'}</option>
          {[1, 2, 3, 4, 5].map((t) => (
            <option key={t} value={t}>
              T{t}
            </option>
          ))}
        </select>

        <input
          data-testid="recipe-box-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === 'ru' ? 'Поиск…' : 'Search…'}
          className="ml-auto rounded-lg border px-2 py-1 text-xs"
          style={{ borderColor: DINER.chrome, background: DINER.card, color: '#2b2118' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 && (
          <p className="col-span-full text-xs italic opacity-70">
            {tab === 'locked'
              ? locale === 'ru'
                ? 'Пока только тосты — Бабушка Опал подскажет рецепты.'
                : 'Just toast for now — Nana Opal will point you to recipes.'
              : locale === 'ru'
                ? 'Карточек пока нет.'
                : 'No cards yet.'}
          </p>
        )}
        {rows.map((r) => {
          const timesCooked = recipeMastery[r.key] ?? 0
          const progress = masteryProgress(timesCooked)
          const revealed = timesCooked > 0
          return (
            <article
              key={r.key}
              data-testid={`recipe-card-${r.key}`}
              className="flex flex-col gap-1 rounded-xl border-2 p-3 text-xs"
              style={{
                background: revealed ? DINER.card : '#EFE6D2',
                borderColor: DINER.chrome,
                boxShadow: PRINT_SHADOW,
                color: revealed ? '#2b2118' : '#8a8070',
                opacity: revealed ? 1 : 0.75,
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black uppercase" style={{ color: DINER.board }}>
                  {r.name[locale]}
                </h3>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: DINER.mustard }}>
                  T{r.tier}
                </span>
              </div>
              <p className="tabular-nums opacity-80">{r.machineKey}</p>
              <p data-testid={`recipe-card-stars-${r.key}`} aria-label="mastery-stars">
                {'★'.repeat(progress.tier.stars)}
                {'☆'.repeat(5 - progress.tier.stars)}
              </p>
              <p className="tabular-nums">
                {revealed
                  ? locale === 'ru'
                    ? `готовили ${timesCooked} раз`
                    : `cooked ${timesCooked} times`
                  : locale === 'ru'
                    ? 'ещё не готовили'
                    : "haven't cooked yet"}
              </p>
              {progress.next && (
                <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: DINER.paper }}>
                  <div
                    data-testid={`recipe-card-progress-${r.key}`}
                    className="h-full rounded-full"
                    style={{ width: `${progress.fraction * 100}%`, background: DINER.teal }}
                  />
                </div>
              )}
              {onCraft && (
                <button
                  type="button"
                  data-testid={`recipe-card-craft-${r.key}`}
                  onClick={() => onCraft(r.key)}
                  className="mt-1 self-start rounded-lg px-2 py-1 text-[11px] font-bold uppercase text-white"
                  style={{ background: DINER.teal }}
                >
                  {locale === 'ru' ? 'Готовить' : 'Cook'}
                </button>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
