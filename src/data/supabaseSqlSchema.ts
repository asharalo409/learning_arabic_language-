export const SUPABASE_SQL_SCHEMA = `-- =====================================================================
-- AI ARABIC ACADEMY — SUPABASE DATABASE, AUTH TRIGGER & RLS SCHEMA
-- Founder: Taseen Billah (Al-Quran & Islamic Studies, Islamic University, Kushtia)
-- Admin Email: taseenbillah407@gmail.com
-- =====================================================================

-- 1. Student Profiles & Synced Progress Table
create table if not exists public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default 'শিক্ষার্থী',
  role text not null default 'student' check (role in ('student', 'admin')),
  preferred_track text not null default 'Combined',
  daily_target_minutes integer not null default 20,
  xp integer not null default 120,
  streak_days integer not null default 1,
  total_minutes_learned integer not null default 0,
  lessons_completed_count integer not null default 0,
  progress_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_profiles_xp_idx
  on public.student_profiles (xp desc);

-- 2. Auto-create profile when a student signs up via Gmail + Password
create or replace function public.handle_new_student_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
  display_name text;
begin
  if lower(coalesce(new.email, '')) = 'taseenbillah407@gmail.com' then
    assigned_role := 'admin';
  else
    assigned_role := 'student';
  end if;

  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(new.email, 'Student'), '@', 1)
  );

  insert into public.student_profiles (id, email, full_name, role)
  values (new.id, lower(new.email), display_name, assigned_role)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.student_profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_student_user();

-- 3. Auto-update updated_at timestamp
create or replace function public.touch_student_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_student_profiles_updated_at on public.student_profiles;
create trigger trg_student_profiles_updated_at
  before update on public.student_profiles
  for each row execute procedure public.touch_student_profile_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.student_profiles enable row level security;

-- Everyone (including visitors viewing leaderboard) can read leaderboard & profile summaries
drop policy if exists "Leaderboard public read" on public.student_profiles;
create policy "Leaderboard public read"
  on public.student_profiles
  for select
  using (true);

-- Authenticated user can insert their own row if needed
drop policy if exists "Users insert own profile" on public.student_profiles;
create policy "Users insert own profile"
  on public.student_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Authenticated user can update their own progress (role protected)
drop policy if exists "Users update own profile" on public.student_profiles;
create policy "Users update own profile"
  on public.student_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (
      role = (select p.role from public.student_profiles p where p.id = auth.uid())
      or lower(auth.jwt() ->> 'email') = 'taseenbillah407@gmail.com'
    )
  );

-- Admin (taseenbillah407@gmail.com) has full management access
drop policy if exists "Admin manages all profiles" on public.student_profiles;
create policy "Admin manages all profiles"
  on public.student_profiles
  for all
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'taseenbillah407@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'taseenbillah407@gmail.com');

-- 5. Optional Custom Curriculum Table managed by Admin
create table if not exists public.academy_custom_content (
  id text primary key,
  content_type text not null check (content_type in ('chapter', 'lesson', 'vocab', 'question')),
  payload jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.academy_custom_content enable row level security;

drop policy if exists "Anyone reads custom content" on public.academy_custom_content;
create policy "Anyone reads custom content"
  on public.academy_custom_content
  for select
  using (true);

drop policy if exists "Admin writes custom content" on public.academy_custom_content;
create policy "Admin writes custom content"
  on public.academy_custom_content
  for all
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'taseenbillah407@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'taseenbillah407@gmail.com');
`;
