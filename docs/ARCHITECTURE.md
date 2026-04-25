# Architecture

## Data model (Supabase / PostgreSQL)

```sql
-- Chats connected to the bot
chats (
  id, telegram_chat_id, title, slug,
  added_by_user_id, created_at
)

-- Telegram users
users (
  id, telegram_user_id, username,
  display_name, avatar_url, created_at
)

-- user ↔ chat link with aggregated score
memberships (
  id, user_id, chat_id,
  message_count, reaction_count,
  score, last_active_at
)

-- Raw events (so we can recompute score later)
events (
  id, user_id, chat_id, type,
  metadata_jsonb, created_at
)

-- Issued certificates
certificates (
  id (uuid), user_id, chat_id,
  rank, issued_at, issued_by
)
```

## Scoring formula (MVP — keep it simple)

```
score = (messages × 1)
      + (reactions_received × 2)
      + (replies_received × 3)
      - (inactive_days_penalty)
```

Recompute hourly via cron.

## Bot architecture
- Long polling (NOT webhook in MVP — easier to debug)
- Separate process on Railway
- Writes events directly to Supabase
- Does NOT store message text

## Auth
- Telegram Login Widget on /login
- JWT in httpOnly cookie
- Middleware checks JWT for /dashboard/*

## PDF generation
- @react-pdf/renderer
- Template at /lib/certificate/template.tsx
- Files are NOT stored — generated on-the-fly

## Privacy / Compliance
- We do NOT store message text
- Members can request deletion (GDPR)
- On leaving a chat — soft delete after 30 days
