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
  for update using (auth.uid() = id or auth.jwt() ->> 'email' = 'admin@gmail.com');

drop policy if exists "Users can delete their own profile." on public.profiles;
create policy "Users can delete their own profile." on public.profiles
  for delete using (auth.uid() = id or auth.jwt() ->> 'email' = 'admin@gmail.com');

-- Trigger function to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, age, preferred_language, learning_language, education_level, experience_level, literacy_level, assessment_completed, streak, last_active_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'age')::integer, null),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'English'),
    coalesce(new.raw_user_meta_data->>'learning_language', 'English'),
    coalesce(new.raw_user_meta_data->>'education_level', ''),
    coalesce(new.raw_user_meta_data->>'experience_level', 'I am completely new to this language'),
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

-- Execute the following SQL statements in the Supabase SQL Editor to support the shop, notification, and profile progression systems:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_language text DEFAULT 'English';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_lessons text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS literacy_level integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assessment_completed boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_time_spent integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_lessons integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_quests jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_quest_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_correct_answers integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_start date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_emoji text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shop_data jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_data jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS word_of_day_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS word_of_day_index integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_level text DEFAULT 'I am completely new to this language';

-- Create the word of the day table
CREATE TABLE IF NOT EXISTS public.word_of_day (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  language text NOT NULL,
  word text NOT NULL,
  meaning text NOT NULL,
  meaning_hi text,
  meaning_kn text,
  meaning_ta text,
  meaning_te text,
  example text NOT NULL,
  UNIQUE (language, word)
);

ALTER TABLE public.word_of_day ADD COLUMN IF NOT EXISTS meaning_hi text;
ALTER TABLE public.word_of_day ADD COLUMN IF NOT EXISTS meaning_kn text;
ALTER TABLE public.word_of_day ADD COLUMN IF NOT EXISTS meaning_ta text;
ALTER TABLE public.word_of_day ADD COLUMN IF NOT EXISTS meaning_te text;

-- Enable RLS and insert policies
ALTER TABLE public.word_of_day ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view word of the day" ON public.word_of_day;
CREATE POLICY "Anyone can view word of the day" ON public.word_of_day
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert word of the day" ON public.word_of_day;
CREATE POLICY "Anyone can insert word of the day" ON public.word_of_day
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update word of the day" ON public.word_of_day;
CREATE POLICY "Anyone can update word of the day" ON public.word_of_day
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete word of the day" ON public.word_of_day;
CREATE POLICY "Anyone can delete word of the day" ON public.word_of_day
  FOR DELETE USING (true);

-- Create the user feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id text PRIMARY KEY,
  user_id text,
  user_name text,
  user_email text,
  category text,
  rating integer,
  subject text,
  message text,
  status text NOT NULL DEFAULT 'New',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and insert policies
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.user_feedback;
CREATE POLICY "Anyone can insert feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view feedback" ON public.user_feedback;
CREATE POLICY "Anyone can view feedback" ON public.user_feedback
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update feedback" ON public.user_feedback;
CREATE POLICY "Anyone can update feedback" ON public.user_feedback
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete feedback" ON public.user_feedback;
CREATE POLICY "Anyone can delete feedback" ON public.user_feedback
  FOR DELETE USING (true);
