# TeleRep — Reputation Layer for Telegram

## What we're building
A SaaS platform that tracks Telegram community member activity
and builds public reputation profiles + issues certificates.

## Who we're building for
- **Primary user**: Telegram channel/chat admin (the payer)
- **Secondary user**: active community member (gets the profile)

## MVP scope (only this, nothing more)
1. Telegram bot connects to a chat/channel
2. Tracks member messages (who, when, how many, reactions)
3. Public page with top members ranking
4. Simple admin dashboard
5. PDF certificate for top-N members

## Out of scope (NOT in MVP)
- Anti-spam / anti-cheating logic
- LinkedIn integration
- Cross-community reputation
- Payment processing
- Multi-language UI (Ukrainian + English only)

## Tech stack
- **Frontend + Backend**: Next.js 15 (App Router) + TypeScript
- **Telegram Bot**: grammy.js (separate process in the same monorepo)
- **DB**: Supabase (PostgreSQL)
- **Auth**: Telegram Login Widget
- **Styling**: Tailwind CSS + shadcn/ui
- **Hosting**: Vercel (web) + Railway (bot)

## Conventions
- Strict TypeScript, no `any`
- Files no longer than 300 lines — refactor into modules
- Commits: Conventional Commits (feat:, fix:, chore:)
- Tests: Vitest for critical logic (scoring, tracking)
- ENV: `.env.local` for dev, `.env.example` as template

## Repository structure
```
/app              — Next.js routes
/components       — UI components
/lib              — shared logic (db, scoring, auth)
/bot              — grammy.js bot (separate entry point)
/supabase         — migrations
/docs             — PRD, ARCHITECTURE, TASKS
```

## How to work with me
- Before big changes — show me the plan first
- Don't install packages without asking, justify the choice first
- After each task — short summary of what was done
- If something in the docs is unclear or contradictory — ask, don't assume
- Prefer boring, well-known solutions over clever ones
