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
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
