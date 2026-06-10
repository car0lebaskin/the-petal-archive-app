create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  organiser text not null,
  location text not null,
  session_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_code text not null unique,
  session_id uuid references sessions(id) on delete set null,
  event_name text not null,
  organiser text not null,
  location text not null,
  session_date date not null,
  customer_race text,
  customer_age text,
  customer_gender text,
  payment_method text,
  total_amount numeric(12,2) not null default 0,
  item_count integer not null default 0,
  synced_from_device text,
  created_at timestamptz not null default now()
);

create table if not exists transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  category text not null,
  chain text,
  style text,
  shape text,
  series text,
  metal text,
  base text,
  colour_letter text,
  price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists transactions_event_idx on transactions(event_name);
create index if not exists transactions_location_idx on transactions(location);
create index if not exists transactions_created_at_idx on transactions(created_at);
create index if not exists transaction_items_transaction_id_idx on transaction_items(transaction_id);
