# PRD: TeleRep MVP

## Problem
Active Telegram community members have no way to prove their
expertise or contributions. Admins have no tool to recognize
and retain their most active members.

## Solution
A bot + web app that automatically tracks activity and issues
public reputation profiles + certificates.

## User stories

### US-1: Connect a community
As an **admin**, I want to add the bot to my chat
so it starts tracking member activity.

**Acceptance criteria:**
- Admin adds the bot as a chat administrator
- Bot greets itself with one welcome message
- Bot starts logging messages from the moment of joining
- Admin receives a link to the dashboard for their chat

### US-2: Activity tracking
As a **system**, I must log every message with metadata:
user_id, chat_id, timestamp, message_length, has_media.

**Acceptance criteria:**
- Only metadata is stored, NOT the message text (privacy)
- Reactions count as +1 to the author's activity
- Bot ignores service messages (join/leave)

### US-3: Public ranking
As a **visitor**, I want to see the top-20 members
of a community on a public page.

**Acceptance criteria:**
- URL: `/c/{chat_slug}`
- Shows: rank, name, avatar, score, message count
- Sort by score (formula in ARCHITECTURE.md)
- Refreshes every 15 minutes

### US-4: Personal profile
As a **member**, I want to see my profile with activity
across all connected communities.

**Acceptance criteria:**
- URL: `/u/{telegram_username}`
- Login via Telegram Login Widget
- Shows: list of communities, rank in each, total score

### US-5: PDF certificate
As an **admin**, I want to issue a certificate to a top member
with one click from the dashboard.

**Acceptance criteria:**
- "Generate certificate" button next to each member
- PDF contains: member name, community name, rank, date, unique ID
- Validity check available at: `/verify/{cert_id}`

### US-6: Admin dashboard
As an **admin**, I want to see stats for my chat.

**Acceptance criteria:**
- URL: `/dashboard/{chat_id}` (only for that chat's admins)
- Metrics: total members, active in last 7d, top 10
- 30-day activity chart

## Non-functional
- Public page latency: < 500ms
- Bot message processing: < 2s
- DB supports 100 chats × 1000 members at launch
