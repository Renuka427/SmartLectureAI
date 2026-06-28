# SmartLecture AI

A notebook-inspired student productivity app that transforms lectures into interactive flashcards, quizzes, mind maps, and AI summaries — with Duolingo-style gamification (XP, streaks, achievements).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/smartlecture run dev` — run the frontend (port 25793)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, Framer Motion, next-themes, Tailwind CSS v4, shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, lectures, flashcards, quizzes, achievements, chat, activity)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, user, lectures, flashcards, quizzes, achievements, assistant, search)
- `artifacts/smartlecture/src/` — React frontend (pages, components, theme)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation (do not edit)

## Architecture decisions

- Contract-first: OpenAPI spec gates codegen which gates both frontend hooks and server Zod schemas
- Single demo user (id=1) — no real auth middleware; `DEFAULT_USER_ID = 1` in all routes
- Fake JWT auth (`fake-jwt-${userId}`) stored in localStorage key `sl_auth` — demo mode bypasses login entirely
- XP system: 500 XP per level; flashcard/quiz sessions award XP and update streak on the user row
- Mind map and summary endpoints return pre-generated data for demo; AI integration can replace later
- Subject colors are hardcoded per subject name in both route handlers and frontend constants

## Product

- Login / register with demo mode bypass
- Dashboard: streak counter, XP bar, subject shelves, recent lectures, weekly activity chart, daily goal ring
- Lecture library: subject filter, grid cards, detail view with tabbed Summary / Flashcards / Quiz / Mind Map / Transcript
- Flashcard study: 3D flip animation, spaced repetition difficulty controls (Again/Hard/Good/Easy), XP on session complete
- Quiz: multi-choice questions, score reveal with XP animation, best score tracking
- AI study assistant: chat UI with persistent history, suggested prompts
- Global search across lectures, flashcard decks, and quizzes
- Progress analytics: subject mastery bars, monthly study hours chart, activity feed
- Achievements gallery: locked/unlocked with progress bars
- Profile + Settings with dark/light mode toggle

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after any change to `openapi.yaml`
- Body schema component names must NOT match `<OperationIdPascal>Body` pattern — causes TS2308 collision
- Express 5 wildcard routes need `/{*splat}` syntax; `req.params.id` is `string | string[]` — always parse
- `DEFAULT_USER_ID = 1` is used everywhere; for multi-user support, extract from JWT middleware
- `text("tags").array()` — call `.array()` as method, not `array(text(...))` (Drizzle pitfall)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
