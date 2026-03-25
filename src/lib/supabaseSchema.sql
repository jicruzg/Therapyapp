-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- LIMPIEZA (por si hay tablas de intentos anteriores)
-- =====================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.notifications cascade;
drop table if exists public.mood_entries cascade;
drop table if exists public.assigned_tests cascade;
drop table if exists public.sessions cascade;
drop table if exists public.availability cascade;
drop table if exists public.patients cascade;
drop table if exists public.profiles cascade;

-- =====================
-- PROFILES
-- =====================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('therapist', 'patient')) not null,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- =====================
-- PATIENTS
-- =====================
create table public.patients (
  id uuid default uuid_generate_v4() primary key,
  therapist_id uuid references public.profiles(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  birth_date date,
  diagnosis text,
  notes text,
  status text check (status in ('active','inactive','pending')) default 'pending',
  invitation_token uuid default uuid_generate_v4(),
  invited_at timestamptz,
  created_at timestamptz default now()
);
alter table public.patients enable row level security;
create policy "Therapist manages their patients" on public.patients for all using (therapist_id = auth.uid());
create policy "Patient can view own record" on public.patients for select using (profile_id = auth.uid());

-- Policy on profiles that needs patients to exist first
create policy "Therapist can view patient profiles" on public.profiles for select using (
  exists (select 1 from public.patients p where p.profile_id = profiles.id and p.therapist_id = auth.uid())
);

-- =====================
-- AVAILABILITY
-- =====================
create table public.availability (
  id uuid default uuid_generate_v4() primary key,
  therapist_id uuid references public.profiles(id) on delete cascade not null,
  day_of_week integer check (day_of_week between 0 and 6) not null,
  start_time time not null,
  end_time time not null,
  unique(therapist_id, day_of_week, start_time)
);
alter table public.availability enable row level security;
create policy "Therapist manages availability" on public.availability for all using (therapist_id = auth.uid());
create policy "Anyone can view availability" on public.availability for select using (true);

-- =====================
-- SESSIONS
-- =====================
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  therapist_id uuid references public.profiles(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  duration_minutes integer default 60,
  status text check (status in ('scheduled','completed','cancelled')) default 'scheduled',
  notes text,
  created_at timestamptz default now()
);
alter table public.sessions enable row level security;
create policy "Therapist manages sessions" on public.sessions for all using (therapist_id = auth.uid());
create policy "Patient can view own sessions" on public.sessions for select using (
  exists (select 1 from public.patients p where p.id = sessions.patient_id and p.profile_id = auth.uid())
);
create policy "Patient can insert sessions" on public.sessions for insert with check (
  exists (select 1 from public.patients p where p.id = sessions.patient_id and p.profile_id = auth.uid())
);

-- =====================
-- ASSIGNED TESTS
-- =====================
create table public.assigned_tests (
  id uuid default uuid_generate_v4() primary key,
  therapist_id uuid references public.profiles(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  test_code text not null,
  status text check (status in ('pending','completed')) default 'pending',
  assigned_at timestamptz default now(),
  completed_at timestamptz,
  answers jsonb,
  score jsonb
);
alter table public.assigned_tests enable row level security;
create policy "Therapist manages assigned tests" on public.assigned_tests for all using (therapist_id = auth.uid());
create policy "Patient can view own tests" on public.assigned_tests for select using (
  exists (select 1 from public.patients p where p.id = assigned_tests.patient_id and p.profile_id = auth.uid())
);
create policy "Patient can update own tests" on public.assigned_tests for update using (
  exists (select 1 from public.patients p where p.id = assigned_tests.patient_id and p.profile_id = auth.uid())
);

-- =====================
-- MOOD ENTRIES
-- =====================
create table public.mood_entries (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  date date not null,
  mood integer check (mood between 1 and 10) not null,
  note text,
  created_at timestamptz default now(),
  unique(patient_id, date)
);
alter table public.mood_entries enable row level security;
create policy "Patient manages own mood" on public.mood_entries for all using (
  exists (select 1 from public.patients p where p.id = mood_entries.patient_id and p.profile_id = auth.uid())
);
create policy "Therapist can view patient mood" on public.mood_entries for select using (
  exists (select 1 from public.patients p where p.id = mood_entries.patient_id and p.therapist_id = auth.uid())
);

-- =====================
-- NOTIFICATIONS
-- =====================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text check (type in ('test','appointment','general')) not null,
  read boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Patient manages own notifications" on public.notifications for all using (
  exists (select 1 from public.patients p where p.id = notifications.patient_id and p.profile_id = auth.uid())
);
create policy "Therapist can insert notifications" on public.notifications for insert with check (
  exists (select 1 from public.patients p where p.id = notifications.patient_id and p.therapist_id = auth.uid())
);

-- =====================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'patient')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
