# Roadmap

We work in small iterations. One iteration = one focused task batch.
Don't jump ahead — finish current iteration, get my "go", then move on.

## Iteration 0 — Setup (day 1)
- [ ] Init Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Setup Supabase project + initial migrations
- [ ] Setup grammy.js bot skeleton
- [ ] Configure .env, .env.example
- [ ] Basic CI: typecheck + lint

## Iteration 1 — Bot + tracking (days 2–4)
- [ ] Bot responds to /start
- [ ] Bot logs messages to `events` table
- [ ] Bot logs reactions
- [ ] Cron job: aggregate events → memberships
- [ ] Unit tests for scoring logic

## Iteration 2 — Public pages (days 5–7)
- [ ] /c/{slug} — chat ranking page
- [ ] /u/{username} — user profile
- [ ] Basic design with shadcn/ui
- [ ] SEO meta + OG images

## Iteration 3 — Admin dashboard (days 8–10)
- [ ] Telegram Login Widget integration
- [ ] /dashboard/{chat_id}
- [ ] Activity chart
- [ ] Member list with search

## Iteration 4 — Certificates (days 11–12)
- [ ] PDF template
- [ ] Generate endpoint
- [ ] /verify/{cert_id} page

## Iteration 5 — Polish + deploy (days 13–14)
- [ ] Landing page at /
- [ ] Vercel deploy (web)
- [ ] Railway deploy (bot)
- [ ] Smoke test on a real BA Telegram channel
