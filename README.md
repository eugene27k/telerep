# TeleRep

Reputation layer for Telegram communities. A bot tracks member activity (messages, replies, reactions — metadata only, never message text), a public leaderboard surfaces top contributors, and admins can issue verifiable PDF certificates.

See [`docs/PRD.md`](docs/PRD.md) for product scope, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the tech design.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- next-intl for UK/EN routing (UK is default)
- Supabase (Postgres) for data
- grammy.js for the Telegram bot (long-polling, runs as a separate process)
- jose for JWT sessions, @react-pdf/renderer for certificates

## Local development

Prerequisites: Node 20+ (we use Node 24), pnpm, Supabase CLI (`brew install supabase/tap/supabase` or download from [supabase/cli releases](https://github.com/supabase/cli/releases)).

```bash
pnpm install
cp .env.example .env.local
# fill in .env.local — see "Environment" below
supabase login
supabase link --project-ref <your-supabase-project-ref> --password ""
pnpm db:push        # applies supabase/migrations/0001_init.sql
pnpm dev            # web on http://localhost:3000
pnpm bot:dev        # bot (separate terminal)
```

Run scripts:

| script | purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm bot:dev` | bot with file-watch reload |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest |
| `pnpm build` | production build |
| `pnpm db:push` | apply migrations to linked Supabase project |
| `pnpm db:types` | regenerate `lib/db/types.ts` |

## Environment

See [`.env.example`](.env.example). All vars are required at startup (validated by `lib/env.ts`).

| variable | what |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | absolute origin of the deployed site |
| `SUPABASE_URL` | hosted Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only service role key (bypasses RLS) |
| `TELEGRAM_BOT_TOKEN` | from BotFather |
| `TELEGRAM_LOGIN_BOT_USERNAME` | bot username, no `@` |
| `JWT_SECRET` | random ≥32 chars for session signing |
| `CRON_SECRET` | random ≥16 chars; Vercel Cron sends as `Authorization: Bearer …` |

## Telegram bot setup (one time, in @BotFather)

1. `/newbot` → save the bot token.
2. `/setprivacy` → **Disable** privacy mode (otherwise the bot only sees commands and @mentions in groups).
3. `/setdomain` → enter your deployed origin (e.g. `telerep.app`). Required for the production Telegram Login Widget on `/login`.

## Deploy

**Web (Vercel):** import this repo on [vercel.com](https://vercel.com/new). Set all the env vars from the table above. The hourly cron is wired in [`vercel.json`](vercel.json) and authenticated by `CRON_SECRET`.

**Bot (Railway):** new project from this repo on [railway.app](https://railway.app). Set the bot start command to `pnpm bot:start` and add the env vars (only the ones the bot uses: `TELEGRAM_BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

## Project layout

```
app/[locale]/        Next.js App Router pages (locale-prefixed)
app/api/             Route handlers (auth, cron, certificates)
bot/                 grammy.js bot (separate Node process)
components/          UI (shadcn-ui based)
i18n/                next-intl routing config
lib/auth/            session + Telegram widget verification + admin check
lib/db/              Supabase client + queries + write operations
lib/scoring.ts       pure scoring formula (unit tested)
lib/certificate/     @react-pdf/renderer template
messages/            UK + EN strings
supabase/migrations/ SQL schema (run via supabase db push)
docs/                product + architecture docs
```
