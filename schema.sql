-- Create a table for public profiles (if it doesn't exist)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  age integer check (age >= 5 and age <= 120),
  preferred_language text,
  education_level text,
  literacy_level integer,
  assessment_completed boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles add column if not exists literacy_level integer;
alter table public.profiles add column if not exists assessment_completed boolean not null default false;
alter table public.profiles add column if not exists streak integer not null default 0;
alter table public.profiles add column if not exists last_active_date date;
alter table public.profiles add column if not exists streak_dates jsonb;

-- Set up Row Level Security
alter table public.profiles enable row level security;

-- Create policies (dropping them first if they already exist to avoid errors)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can delete their own profile." on public.profiles;
create policy "Users can delete their own profile." on public.profiles
  for delete using (auth.uid() = id);

-- Trigger function to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, age, preferred_language, education_level, literacy_level, assessment_completed, streak, last_active_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'age')::integer, null),
    coalesce(new.raw_user_meta_data->>'preferred_language', ''),
    coalesce(new.raw_user_meta_data->>'education_level', ''),
    null,
    false,
    0,
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run handle_new_user on insert to auth.users (dropping it first to avoid duplicates)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Recommendations for Literacy Level Tracking:
-- Execute the following SQL statement in the Supabase SQL Editor to track diagnosed literacy levels:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS literacy_level integer;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assessment_completed boolean NOT NULL DEFAULT false;

-- Dynamic Daily Quests Tracking Columns:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_xp integer NOT NULL DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_time_spent integer NOT NULL DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_lessons integer NOT NULL DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_quests jsonb;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_quest_date date;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_correct_answers integer NOT NULL DEFAULT 0;

