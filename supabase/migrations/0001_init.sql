-- Telegram communities connected to the bot
create table chats (
  id              uuid primary key default gen_random_uuid(),
  telegram_chat_id bigint not null unique,
  title           text not null,
  slug            text not null unique,
  added_by_user_id uuid,
  created_at      timestamptz not null default now()
);

-- Telegram users seen by the bot
create table users (
  id               uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null unique,
  username         text,
  display_name     text not null,
  avatar_url       text,
  created_at       timestamptz not null default now()
);

-- Many-to-many: user ↔ chat, with aggregated counters and score
create table memberships (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  chat_id          uuid not null references chats(id) on delete cascade,
  message_count    integer not null default 0,
  reaction_count   integer not null default 0,
  score            integer not null default 0,
  last_active_at   timestamptz,
  deleted_at       timestamptz,              -- soft delete (GDPR / leave)
  unique (user_id, chat_id)
);

-- Raw activity events (source of truth for score recomputation)
create table events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  chat_id     uuid not null references chats(id) on delete cascade,
  type        text not null,                 -- 'message' | 'reaction' | 'reply'
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Issued certificates
create table certificates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  chat_id     uuid not null references chats(id) on delete cascade,
  rank        integer not null,
  issued_at   timestamptz not null default now(),
  issued_by   uuid references users(id)
);

-- Indexes
create index on memberships (chat_id, score desc);   -- leaderboard queries
create index on memberships (user_id);               -- profile queries
create index on events (chat_id, created_at desc);   -- recent activity
create index on events (user_id, created_at desc);
create index on certificates (user_id);
