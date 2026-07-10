import { defineConfig, devices } from '@playwright/test'

// Смоук-прогоны ключевых экранов через ?screen= + мок-Supabase (21-client §3.10).
// Не полноценный e2e с живым бэкендом — только «сцена смонтировалась, нет console-error, клик отзывается».
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Vite dev-сервер: `import.meta.env.DEV === true` ⇒ `isDebugEnabled()` пропускает
  // дип-линки `?screen=`/`?panel=` (в prod-preview они игнорируются гейтом §3.8, C9,
  // и смоук всех экранов был бы невозможен). Local-адаптер — по умолчанию (нет Supabase URL).
  webServer: {
    command: 'pnpm dev --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
