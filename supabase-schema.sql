-- Run this in your Supabase SQL editor

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text default 'starter' check (plan in ('starter','pro','agency')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trialing',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  youtube_handle text,
  instagram_handle text,
  tiktok_handle text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);

-- Sponsors (brands)
create table sponsors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  contact_name text,
  contact_email text,
  website text,
  industry text,
  notes text,
  relationship_status text default 'prospect' check (relationship_status in ('prospect','active','paused','churned')),
  avg_deal_value numeric(10,2),
  created_at timestamptz default now()
);

alter table sponsors enable row level security;
create policy "Users manage own sponsors" on sponsors for all using (auth.uid() = user_id);

-- Deals (sponsorship pipeline)
create table deals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  sponsor_id uuid references sponsors(id) on delete set null,
  title text not null,
  status text default 'pitched' check (status in ('pitched','negotiating','contracted','in_production','delivered','paid','cancelled')),
  value numeric(10,2),
  currency text default 'CHF',
  platform text check (platform in ('youtube','instagram','tiktok','twitter','podcast','newsletter','other')),
  content_type text,
  deliverable_due_at timestamptz,
  payment_due_at timestamptz,
  contracted_at timestamptz,
  paid_at timestamptz,
  brief_text text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table deals enable row level security;
create policy "Users manage own deals" on deals for all using (auth.uid() = user_id);

-- Content calendar items
create table content_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  deal_id uuid references deals(id) on delete set null,
  title text not null,
  platform text check (platform in ('youtube','instagram','tiktok','twitter','podcast','newsletter','other')),
  content_type text,
  status text default 'idea' check (status in ('idea','scripting','filming','editing','scheduled','published')),
  publish_date date,
  notes text,
  created_at timestamptz default now()
);

alter table content_items enable row level security;
create policy "Users manage own content" on content_items for all using (auth.uid() = user_id);

-- Analytics snapshots
create table metrics_snapshots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  platform text not null,
  followers int,
  avg_views int,
  avg_likes int,
  avg_comments int,
  engagement_rate numeric(5,4),
  snapshot_date date default current_date,
  created_at timestamptz default now()
);

alter table metrics_snapshots enable row level security;
create policy "Users manage own metrics" on metrics_snapshots for all using (auth.uid() = user_id);

-- Trigger: update deals.updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger deals_updated_at before update on deals
  for each row execute function update_updated_at();

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
