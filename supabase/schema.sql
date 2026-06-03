-- Hidden Gems New Version - Supabase Schema
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  vip_status text not null default 'inactive' check (vip_status in ('inactive', 'active', 'expired')),
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text,
  price numeric(10,2) not null default 3.00,
  stripe_price_id text,
  thumbnail_url text,
  access_type text not null default 'paid' check (access_type in ('paid', 'vip', 'free')),
  published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.video_access_links (
  video_id uuid primary key references public.videos(id) on delete cascade,
  external_video_link text not null,
  updated_at timestamptz default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  payment_status text not null default 'pending',
  stripe_session_id text unique,
  purchased_at timestamptz default now(),
  unique(user_id, video_id)
);

create table if not exists public.vip_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'active',
  stripe_subscription_id text,
  started_at timestamptz default now(),
  renews_at timestamptz,
  expires_at timestamptz
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, vip_status)
  values (new.id, new.email, 'user', 'inactive')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.videos enable row level security;
alter table public.video_access_links enable row level security;
alter table public.purchases enable row level security;
alter table public.vip_subscriptions enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own non-admin profile" on public.profiles
  for update using (auth.uid() = id and role = 'user')
  with check (auth.uid() = id and role = 'user');

create policy "Admins can read profiles" on public.profiles
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Public can read published videos" on public.videos
  for select using (published = true);

create policy "Admins can manage videos" on public.videos
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Public can read categories" on public.categories
  for select using (true);

create policy "Admins can manage categories" on public.categories
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage protected links" on public.video_access_links
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can read own purchases" on public.purchases
  for select using (auth.uid() = user_id);

create policy "Users can read own VIP subscriptions" on public.vip_subscriptions
  for select using (auth.uid() = user_id);

-- Purchases, VIP writes, and protected link delivery should be done server-side
-- through the Supabase service role key inside Vercel API routes / Stripe webhooks.

insert into public.categories (name, description)
values
  ('Featured', 'Featured video drops'),
  ('Premium', 'Premium paid access videos'),
  ('VIP', 'VIP-only content')
on conflict (name) do nothing;
