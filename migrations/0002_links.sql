create table if not exists links (
  code text primary key,
  url text not null,
  title text not null default '',
  description text not null default '',
  image text,
  favicon text,
  hostname text not null,
  path text not null default '/',
  chain text not null default '[]',
  tracker_count integer not null default 0,
  risk text not null default 'safe',
  reasons text not null default '[]',
  summary text not null default '',
  pass_hash text,
  pass_salt text,
  owner_hash text not null,
  expiry_at timestamptz not null,
  is_one_time boolean not null default false,
  consumed boolean not null default false,
  clicks integer not null default 0,
  hide_brand boolean not null default false,
  unverified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists link_hits (
  id serial primary key,
  code text not null,
  country text not null default 'Unattributed',
  device text not null default 'Desktop',
  created_at timestamptz not null default now()
);

create index if not exists link_hits_code_idx on link_hits (code);
