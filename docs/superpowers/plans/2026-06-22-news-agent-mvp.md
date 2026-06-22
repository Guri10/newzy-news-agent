# News Agent MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small website that fetches daily geopolitical and sports news through TheNewsAPI, lets the user enable/disable categories, schedule a daily fetch time, read generated digests, and verify the experience with Playwright.

**Architecture:** Use a Next.js TypeScript app with server-side routes for settings, manual fetches, and digest reads. Keep TheNewsAPI behind a provider interface, store normalized data in SQLite through Prisma, and run scheduling through an app-local cron worker for the MVP.

**Tech Stack:** Next.js, React, TypeScript, Prisma, SQLite, TheNewsAPI, node-cron, Vitest, Testing Library, Playwright.

---

## Current Context

- Local workspace: `/Users/atharvagurav/Documents/Newzy`
- Git state: empty repository with no commits.
- GitHub repo: `Guri10/newzy-news-agent`
- GitHub access: authenticated user has admin and push permissions.
- Playwright: not installed yet.
- API key: user has a TheNewsAPI key; store it in `.env.local` as `THENEWSAPI_API_KEY`.

## Product Scope

### In Scope For MVP

- Readable daily news dashboard.
- Category toggles for:
  - Geopolitics
  - Sports
- Daily scheduler settings:
  - enabled/disabled
  - local time
  - timezone
- Manual fetch button for development and user-triggered refresh.
- TheNewsAPI integration.
- Normalized article storage.
- Daily digest storage.
- Playwright browser tests for the settings and dashboard flows.
- Unit tests for provider normalization, settings validation, and digest assembly.

### Out Of Scope For MVP

- iOS app.
- Push notifications.
- User accounts.
- Multiple users.
- Payment or subscription handling.
- AI-generated long-form analysis.
- Multiple news providers, except for provider-interface support.

## File Structure

- `package.json`  
  Project scripts and dependencies.

- `next.config.ts`  
  Next.js configuration.

- `tsconfig.json`  
  TypeScript configuration.

- `.env.example`  
  Required environment variable names without secrets.

- `.gitignore`  
  Ignore `.env.local`, database files, Playwright reports, build outputs, and dependencies.

- `prisma/schema.prisma`  
  SQLite database schema for settings, articles, digests, and fetch runs.

- `src/app/page.tsx`  
  Dashboard page.

- `src/app/api/settings/route.ts`  
  GET/PUT API for category and schedule settings.

- `src/app/api/fetch-now/route.ts`  
  POST API to run the fetcher immediately.

- `src/app/api/digests/latest/route.ts`  
  GET API for the latest digest.

- `src/features/settings/settings-schema.ts`  
  Zod schema and defaults for category and schedule settings.

- `src/features/settings/settings-repository.ts`  
  Database read/write access for settings.

- `src/features/news/news-provider.ts`  
  Provider interface and normalized article type.

- `src/features/news/thenewsapi-provider.ts`  
  TheNewsAPI implementation.

- `src/features/news/news-service.ts`  
  Category-to-query mapping, fetch orchestration, deduplication, and persistence.

- `src/features/digests/digest-service.ts`  
  Digest generation from normalized articles.

- `src/features/scheduler/scheduler.ts`  
  MVP cron scheduler that reads settings and runs the fetcher.

- `src/lib/db.ts`  
  Prisma client singleton.

- `src/lib/time.ts`  
  Timezone and daily schedule helpers.

- `src/test/fixtures/news.ts`  
  Deterministic article fixtures.

- `src/**/*.test.ts`  
  Unit tests run by Vitest.

- `tests/e2e/news-agent.spec.ts`  
  Playwright tests for dashboard, settings, and manual fetch behavior.

- `playwright.config.ts`  
  Playwright configuration.

## Data Model

### `Settings`

- `id`: string, fixed value `default`
- `geopoliticsEnabled`: boolean
- `sportsEnabled`: boolean
- `scheduleEnabled`: boolean
- `scheduleTime`: string in `HH:mm`
- `timezone`: string, default from browser during first setup
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `Article`

- `id`: string
- `externalId`: string, nullable
- `url`: string, unique
- `title`: string
- `description`: string, nullable
- `source`: string
- `imageUrl`: string, nullable
- `publishedAt`: DateTime
- `category`: enum `GEOPOLITICS | SPORTS`
- `createdAt`: DateTime

### `Digest`

- `id`: string
- `date`: string in `YYYY-MM-DD`
- `sections`: JSON
- `createdAt`: DateTime

### `FetchRun`

- `id`: string
- `startedAt`: DateTime
- `finishedAt`: DateTime, nullable
- `status`: enum `RUNNING | SUCCESS | FAILED`
- `message`: string, nullable

## TheNewsAPI Strategy

- Use `https://api.thenewsapi.com/v1/news/top` for top category news.
- Use `categories=sports` for sports.
- Use `categories=politics` plus query terms for geopolitics when available.
- Use `language=en`.
- Start with US/global English coverage, then make locale configurable later.
- Normalize every API result into the local `Article` shape before persistence.
- Never expose `THENEWSAPI_API_KEY` to client components.

## Task 1: Connect Repository And Scaffold App

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/page.tsx`

- [ ] Add GitHub remote.

Run:

```bash
git remote add origin https://github.com/Guri10/newzy-news-agent.git
git remote -v
```

Expected: `origin` points to `https://github.com/Guri10/newzy-news-agent.git`.

- [ ] Create the Next.js TypeScript scaffold.

Run:

```bash
npm create next-app@latest . -- --ts --eslint --app --src-dir --no-tailwind --import-alias "@/*"
```

Expected: project files exist and `npm run lint` is available.

- [ ] Install runtime dependencies.

Run:

```bash
npm install @prisma/client prisma zod node-cron date-fns-tz
```

Expected: dependencies are added to `package.json`.

- [ ] Install test dependencies, including Playwright.

Run:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test
npx playwright install chromium
```

Expected: Playwright Chromium browser is installed locally.

- [ ] Add `.env.example`.

```env
THENEWSAPI_API_KEY=
DATABASE_URL="file:./dev.db"
```

- [ ] Commit scaffold.

```bash
git add .
git commit -m "chore: scaffold news agent app"
```

## Task 2: Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

- [ ] Write Prisma schema for settings, articles, digests, and fetch runs.

- [ ] Run migration.

```bash
npx prisma migrate dev --name init
```

Expected: migration succeeds and Prisma client is generated.

- [ ] Commit database schema.

```bash
git add prisma src/lib/db.ts package.json package-lock.json
git commit -m "feat: add database schema"
```

## Task 3: Settings Model And API

**Files:**
- Create: `src/features/settings/settings-schema.ts`
- Create: `src/features/settings/settings-repository.ts`
- Create: `src/features/settings/settings-schema.test.ts`
- Create: `src/app/api/settings/route.ts`

- [ ] Write failing tests for default settings and invalid schedule times.

Run:

```bash
npm test -- src/features/settings/settings-schema.test.ts
```

Expected: tests fail because the settings schema does not exist.

- [ ] Implement the settings schema with Zod.

- [ ] Implement repository functions:
  - `getSettings()`
  - `updateSettings(input)`

- [ ] Implement `GET /api/settings`.

- [ ] Implement `PUT /api/settings`.

- [ ] Run tests.

```bash
npm test -- src/features/settings/settings-schema.test.ts
```

Expected: tests pass.

- [ ] Commit settings API.

```bash
git add src/features/settings src/app/api/settings
git commit -m "feat: add settings api"
```

## Task 4: News Provider

**Files:**
- Create: `src/features/news/news-provider.ts`
- Create: `src/features/news/thenewsapi-provider.ts`
- Create: `src/features/news/thenewsapi-provider.test.ts`
- Create: `src/test/fixtures/news.ts`

- [ ] Write failing tests that normalize TheNewsAPI articles into local articles.

Run:

```bash
npm test -- src/features/news/thenewsapi-provider.test.ts
```

Expected: tests fail because provider files do not exist.

- [ ] Implement the `NewsProvider` interface.

- [ ] Implement TheNewsAPI request construction.

- [ ] Implement response normalization.

- [ ] Handle missing optional fields without throwing.

- [ ] Do not call the real API in unit tests; inject `fetch` into the provider.

- [ ] Run tests.

```bash
npm test -- src/features/news/thenewsapi-provider.test.ts
```

Expected: tests pass.

- [ ] Commit provider.

```bash
git add src/features/news src/test/fixtures
git commit -m "feat: add thenewsapi provider"
```

## Task 5: Fetch Service And Digest Service

**Files:**
- Create: `src/features/news/news-service.ts`
- Create: `src/features/news/news-service.test.ts`
- Create: `src/features/digests/digest-service.ts`
- Create: `src/features/digests/digest-service.test.ts`
- Create: `src/app/api/fetch-now/route.ts`
- Create: `src/app/api/digests/latest/route.ts`

- [ ] Write failing test for category selection from settings.

- [ ] Write failing test for deduplicating articles by URL.

- [ ] Write failing test for digest sections containing enabled categories only.

- [ ] Implement category mapping:
  - geopolitics: TheNewsAPI politics/top news query
  - sports: TheNewsAPI sports/top news query

- [ ] Implement persistence for fetched articles.

- [ ] Implement digest creation from the newest persisted articles.

- [ ] Implement `POST /api/fetch-now`.

- [ ] Implement `GET /api/digests/latest`.

- [ ] Run service tests.

```bash
npm test -- src/features/news/news-service.test.ts src/features/digests/digest-service.test.ts
```

Expected: tests pass.

- [ ] Commit fetch and digest services.

```bash
git add src/features/news src/features/digests src/app/api/fetch-now src/app/api/digests
git commit -m "feat: add news fetch and digest services"
```

## Task 6: Scheduler

**Files:**
- Create: `src/lib/time.ts`
- Create: `src/lib/time.test.ts`
- Create: `src/features/scheduler/scheduler.ts`
- Create: `src/features/scheduler/scheduler.test.ts`

- [ ] Write failing test for detecting when a configured schedule is due.

- [ ] Write failing test that disabled schedules do not run.

- [ ] Implement timezone-aware schedule helper.

- [ ] Implement scheduler wrapper around `node-cron`.

- [ ] Ensure the scheduler reads settings before each run.

- [ ] Run scheduler tests.

```bash
npm test -- src/lib/time.test.ts src/features/scheduler/scheduler.test.ts
```

Expected: tests pass.

- [ ] Commit scheduler.

```bash
git add src/lib/time.ts src/features/scheduler
git commit -m "feat: add daily scheduler"
```

## Task 7: Dashboard UI

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/page.test.tsx`
- Create: `src/features/settings/settings-panel.tsx`
- Create: `src/features/digests/digest-view.tsx`

- [ ] Write failing component test for rendering category toggles.

- [ ] Write failing component test for saving schedule settings.

- [ ] Write failing component test for rendering digest sections.

- [ ] Implement dashboard layout.

- [ ] Implement category toggles.

- [ ] Implement schedule controls.

- [ ] Implement manual fetch button.

- [ ] Implement digest view.

- [ ] Run component tests.

```bash
npm test -- src/app/page.test.tsx
```

Expected: tests pass.

- [ ] Commit UI.

```bash
git add src/app/page.tsx src/app/page.test.tsx src/features/settings src/features/digests
git commit -m "feat: add news dashboard"
```

## Task 8: Playwright End-To-End Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/news-agent.spec.ts`

- [ ] Add Playwright config that starts the Next.js dev server.

- [ ] Write e2e test for dashboard load.

- [ ] Write e2e test for toggling geopolitics and sports settings.

- [ ] Write e2e test for saving schedule time.

- [ ] Write e2e test for manual fetch with route mocking.

- [ ] Run Playwright tests.

```bash
npm run test:e2e
```

Expected: Playwright opens Chromium, tests pass, and no text overlaps at desktop or mobile viewport.

- [ ] Commit Playwright tests.

```bash
git add playwright.config.ts tests/e2e package.json package-lock.json
git commit -m "test: add playwright coverage"
```

## Task 9: Local Verification And Push

**Files:**
- Modify only if verification exposes bugs.

- [ ] Run unit tests.

```bash
npm test
```

Expected: all unit tests pass.

- [ ] Run lint.

```bash
npm run lint
```

Expected: no lint errors.

- [ ] Run Playwright.

```bash
npm run test:e2e
```

Expected: all browser tests pass.

- [ ] Start local dev server.

```bash
npm run dev
```

Expected: app is available at `http://localhost:3000`.

- [ ] Open the app in the in-app browser and visually verify:
  - dashboard loads
  - toggles are usable
  - schedule controls fit
  - digest content is readable
  - mobile viewport does not overlap text

- [ ] Push branch to GitHub.

```bash
git push -u origin codex/news-agent-mvp
```

- [ ] Open a draft pull request titled `Build news agent MVP`.

## Risk Notes

- TheNewsAPI free tier may be enough for development but can be sparse because low-tier plans may cap article count per request.
- A long-running scheduler inside Next.js is deployment-sensitive. For the MVP it is acceptable locally; for production, move scheduling to a hosted cron job or worker process.
- Geopolitics requires more nuance than the raw `politics` category. Start with politics plus query terms, then refine sources and filters after observing real daily output.
- API secrets must stay in `.env.local` and never be committed.

## Self-Review

- No implementation code is included in this plan.
- Playwright installation is explicit.
- The GitHub repo and local empty-repo state are reflected.
- The plan uses TDD for behavior-bearing code.
- The API key storage path is explicit.
- The scheduler production risk is called out.
