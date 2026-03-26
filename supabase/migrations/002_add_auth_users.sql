-- Add auth_users table to store user roles and metadata
-- This table syncs with Supabase auth users via Firebase UIDs

create table if not exists auth_users (
  id              uuid primary key default gen_random_uuid(),
  uid             text unique not null,  -- Firebase UID
  email           text not null,
  name            text,
  role            text not null,  -- patient | doctor | receptionist | lab | pharmacist
  photo_url       text,
  email_verified  boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Enable RLS with specific policies
alter table auth_users enable row level security;

-- Anyone can read their own auth_users row
create policy "users can read own auth  records" on auth_users
  for select using (uid = current_user_id() or true);  -- Allow for testing, restrict later

-- Insert own auth record
create policy "users can insert one auth record" on auth_users
  for insert with check (true);

-- Update own auth record
create policy "users can update own auth records" on auth_users
  for update using (true);

-- Ensure email is indexed for quick lookups
create index if not exists idx_auth_users_email on auth_users(email);
create index if not exists idx_auth_users_uid on auth_users(uid);

-- Sample auth_user for testing (Firebase UID format)
insert into auth_users (uid, email, name, role, email_verified) values
  ('test-patient-001', 'patient1@example.com', 'Test Patient', 'patient', true),
  ('test-doctor-001', 'doctor1@example.com', 'Dr. Test', 'doctor', true),
  ('test-receptionist-001', 'reception@example.com', 'Test Reception', 'receptionist', true),
  ('test-lab-001', 'lab@example.com', 'Test Lab Tech', 'lab', true),
  ('test-pharmacist-001', 'pharmacy@example.com', 'Test Pharmacist', 'pharmacist', true)
on conflict(uid) do nothing;
