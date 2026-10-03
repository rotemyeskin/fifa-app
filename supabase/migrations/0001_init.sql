-- FIFA League schema

create table if not exists players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(trim(name)) between 1 and 30),
  emoji       text not null default '⚽',
  color       text not null default '#2cf58a',
  created_at  timestamptz not null default now()
);

-- A session is a full round-robin: every participant plays every other participant exactly once.
create table if not exists sessions (
  id             uuid primary key default gen_random_uuid(),
  player_ids     uuid[] not null check (cardinality(player_ids) >= 2),
  first_home_id  uuid not null references players(id),
  first_away_id  uuid not null references players(id),
  first_draw     text not null check (first_draw in ('random', 'manual')),
  status         text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at     timestamptz not null default now(),
  completed_at   timestamptz,
  check (first_home_id <> first_away_id)
);

-- Goals are the final score: after 90 minutes, or after 120 when extra_time is true.
-- A draw after extra time stays a draw. Winner/loser are derived from goals, never stored.
create table if not exists matches (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references sessions(id) on delete set null,
  home_player_id  uuid not null references players(id),
  away_player_id  uuid not null references players(id),
  home_goals      smallint not null check (home_goals between 0 and 99),
  away_goals      smallint not null check (away_goals between 0 and 99),
  home_team       text,
  away_team       text,
  home_stars      numeric(2,1) not null check (home_stars between 0 and 5 and mod(home_stars * 2, 1) = 0),
  away_stars      numeric(2,1) not null check (away_stars between 0 and 5 and mod(away_stars * 2, 1) = 0),
  extra_time      boolean not null default false,
  played_at       timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  check (home_player_id <> away_player_id)
);

create index if not exists matches_played_at_idx on matches (played_at desc);
create index if not exists matches_session_idx on matches (session_id);
create index if not exists sessions_status_idx on sessions (status, started_at desc);

-- RLS on with no policies: only the server (service role key) can read/write.
alter table players  enable row level security;
alter table sessions enable row level security;
alter table matches  enable row level security;
