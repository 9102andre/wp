-- ============================================================
--  Hospital Management System – Full Schema Migration
--  Run this in the Supabase SQL editor
-- ============================================================

-- ── 1. PATIENTS ──────────────────────────────────────────────
create table if not exists patients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  age           int,
  gender        text,
  phone         text,
  email         text,
  address       text,
  emergency_contact text,
  created_at    timestamptz default now()
);

alter table patients enable row level security;
create policy "public read patients"  on patients for select using (true);
create policy "public insert patients" on patients for insert with check (true);
create policy "public update patients" on patients for update using (true);

-- ── 2. ENCOUNTERS (symptoms + AI result) ─────────────────────
create table if not exists encounters (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid references patients(id) on delete cascade,
  department    text,
  symptoms      text,
  duration      text,
  severity      int default 5,
  history       text,
  allergies     text,
  image_urls    text[],
  ai_severity   text,             -- High | Moderate | Mild
  ai_recommendation text,
  ai_confidence numeric(4,2),
  ai_diagnosis_text text,
  created_at    timestamptz default now()
);

alter table encounters enable row level security;
create policy "public read encounters"  on encounters for select using (true);
create policy "public insert encounters" on encounters for insert with check (true);
create policy "public update encounters" on encounters for update using (true);

-- ── 3. APPOINTMENTS ──────────────────────────────────────────
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid references patients(id) on delete cascade,
  encounter_id  uuid references encounters(id) on delete set null,
  department    text,
  doctor_name   text,
  appt_date     date,
  appt_time     time,
  status        text default 'Scheduled',  -- Scheduled | Completed | Cancelled
  notes         text,
  created_at    timestamptz default now()
);

alter table appointments enable row level security;
create policy "public read appointments"  on appointments for select using (true);
create policy "public insert appointments" on appointments for insert with check (true);
create policy "public update appointments" on appointments for update using (true);

-- ── 4. PRESCRIPTIONS ─────────────────────────────────────────
create table if not exists prescriptions (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid references patients(id) on delete cascade,
  encounter_id  uuid references encounters(id) on delete set null,
  doctor_name   text,
  diagnosis_text text,
  medicines     jsonb,  -- [{name, dose, duration, instructions}]
  status        text default 'Pending',  -- Pending | Dispensed
  dispensed_at  timestamptz,
  created_at    timestamptz default now()
);

alter table prescriptions enable row level security;
create policy "public read prescriptions"  on prescriptions for select using (true);
create policy "public insert prescriptions" on prescriptions for insert with check (true);
create policy "public update prescriptions" on prescriptions for update using (true);

-- ── 5. LAB ORDERS ────────────────────────────────────────────
create table if not exists lab_orders (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid references patients(id) on delete cascade,
  encounter_id  uuid references encounters(id) on delete set null,
  doctor_name   text,
  tests         text[],                -- ['CBC', 'Urine', 'CT Scan', ...]
  urgency       text default 'Normal', -- Normal | Urgent
  status        text default 'Pending',  -- Pending | In Progress | Completed
  notes         text,
  created_at    timestamptz default now()
);

alter table lab_orders enable row level security;
create policy "public read lab_orders"  on lab_orders for select using (true);
create policy "public insert lab_orders" on lab_orders for insert with check (true);
create policy "public update lab_orders" on lab_orders for update using (true);

-- ── 6. LAB RESULTS ───────────────────────────────────────────
create table if not exists lab_results (
  id            uuid primary key default gen_random_uuid(),
  lab_order_id  uuid references lab_orders(id) on delete cascade,
  patient_id    uuid references patients(id) on delete cascade,
  technician    text,
  results       jsonb,  -- {test_name: {value, unit, status, reference_range}, ...}
  report_url    text,
  notes         text,
  completed_at  timestamptz default now()
);

alter table lab_results enable row level security;
create policy "public read lab_results"  on lab_results for select using (true);
create policy "public insert lab_results" on lab_results for insert with check (true);
create policy "public update lab_results" on lab_results for update using (true);

-- ── 7. ROOM ALLOCATIONS ──────────────────────────────────────
create table if not exists room_allocations (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid references patients(id) on delete cascade,
  room_number   text,
  ward          text,
  admitted_at   timestamptz default now(),
  discharged_at timestamptz,
  status        text default 'Admitted',  -- Admitted | Discharged
  notes         text
);

alter table room_allocations enable row level security;
create policy "public read room_allocations"  on room_allocations for select using (true);
create policy "public insert room_allocations" on room_allocations for insert with check (true);
create policy "public update room_allocations" on room_allocations for update using (true);

-- ── 8. BILLING ───────────────────────────────────────────────
create table if not exists billing (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid references patients(id) on delete cascade,
  total_amount     numeric(10,2) default 0,
  paid_amount      numeric(10,2) default 0,
  payment_status   text default 'Pending',  -- Pending | Partial | Cleared
  insurance_provider text,
  insurance_id     text,
  items            jsonb,  -- [{description, amount}]
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table billing enable row level security;
create policy "public read billing"  on billing for select using (true);
create policy "public insert billing" on billing for insert with check (true);
create policy "public update billing" on billing for update using (true);

-- ── 9. EMERGENCY ALERTS ──────────────────────────────────────
create table if not exists emergency_alerts (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid references patients(id) on delete set null,
  patient_name  text,
  department    text,
  severity      text,
  description   text,
  resolved      boolean default false,
  created_at    timestamptz default now()
);

alter table emergency_alerts enable row level security;
create policy "public read emergency_alerts"  on emergency_alerts for select using (true);
create policy "public insert emergency_alerts" on emergency_alerts for insert with check (true);
create policy "public update emergency_alerts" on emergency_alerts for update using (true);

-- ── 10. NOTICES ──────────────────────────────────────────────
create table if not exists notices (
  id            uuid primary key default gen_random_uuid(),
  role          text,   -- doctor | receptionist | pharmacist | lab | all
  title         text,
  body          text,
  priority      text default 'Normal', -- Normal | High | Urgent
  created_at    timestamptz default now()
);

alter table notices enable row level security;
create policy "public read notices"  on notices for select using (true);
create policy "public insert notices" on notices for insert with check (true);

-- ── SEED DATA ────────────────────────────────────────────────
insert into notices (role, title, body, priority) values
  ('all',         'Staff Meeting',          'All staff meeting on Friday at 9 AM in Conference Hall B.', 'Normal'),
  ('doctor',      'ICU Capacity Alert',     'ICU bed capacity is currently at 80%. Please review discharge plans.', 'High'),
  ('doctor',      'New Clinical Guidelines','Updated flu-like illness protocols available on the intranet.', 'Normal'),
  ('doctor',      'OPD Extended Hours',     'OPD timings extended till 9 PM this week due to patient load.', 'Normal'),
  ('receptionist','Insurance Update',       'New empaneled insurance providers list has been updated. Check with admin.', 'Normal'),
  ('receptionist','Emergency Protocol',     'Emergency bay capacity updated. Coordinate with ICU before overflow.', 'High'),
  ('pharmacist',  'Drug Shortage',          'Amoxicillin 500mg is in short supply. Use alternatives as per formulary.', 'Urgent'),
  ('pharmacist',  'Cold Chain',             'Ensure insulin and vaccines are stored correctly. Audit on Monday.', 'High'),
  ('lab',         'QC Reminder',            'Daily quality control checks for automated analyzers due by 8 AM.', 'Normal'),
  ('lab',         'New Test Protocol',      'Updated protocol for Thyroid Profile tests – see lab manual v3.2.', 'Normal')
on conflict do nothing;

-- ── SAMPLE PATIENTS (for demo) ────────────────────────────────
insert into patients (id, name, age, gender, phone, email, address, emergency_contact) values
  ('a0000000-0000-0000-0000-000000000001', 'John Doe',       34, 'Male',   '9876543210', 'john@example.com',  '12 MG Road, Bangalore', '9876543211'),
  ('a0000000-0000-0000-0000-000000000002', 'Anita Sharma',   28, 'Female', '9988776655', 'anita@example.com', '5 Park Street, Mumbai',  '9988776656'),
  ('a0000000-0000-0000-0000-000000000003', 'Rahul Kumar',    42, 'Male',   '9123456789', 'rahul@example.com', '8 Lake View, Chennai',   '9123456780')
on conflict do nothing;

-- ── SAMPLE ENCOUNTERS ─────────────────────────────────────────
insert into encounters (patient_id, department, symptoms, duration, severity, ai_severity, ai_recommendation, ai_confidence) values
  ('a0000000-0000-0000-0000-000000000001', 'ENT',         'Ear pain and reduced hearing for past week', '7 days',  6, 'Moderate', 'Consult ENT specialist within 48 hours.', 0.88),
  ('a0000000-0000-0000-0000-000000000002', 'Cardiology',  'Chest pain and breathlessness on exertion',  '3 days',  9, 'High',     'Visit emergency immediately. ECG recommended.', 0.95),
  ('a0000000-0000-0000-0000-000000000003', 'Dermatology', 'Skin rash on arms, mild itching',            '2 weeks', 3, 'Mild',     'Topical antihistamine may help. Follow up in 5 days.', 0.82)
on conflict do nothing;

-- ── SAMPLE APPOINTMENTS ──────────────────────────────────────
insert into appointments (patient_id, department, doctor_name, appt_date, appt_time, status) values
  ('a0000000-0000-0000-0000-000000000001', 'ENT',         'Dr. Mehra (ENT)',           current_date, '09:30', 'Scheduled'),
  ('a0000000-0000-0000-0000-000000000002', 'Cardiology',  'Dr. Rao (Cardio)',           current_date, '10:15', 'Scheduled'),
  ('a0000000-0000-0000-0000-000000000003', 'Dermatology', 'Dr. Kapoor (Derm)',          current_date, '11:00', 'Scheduled')
on conflict do nothing;

-- ── SAMPLE LAB ORDERS ────────────────────────────────────────
insert into lab_orders (patient_id, doctor_name, tests, urgency, status) values
  ('a0000000-0000-0000-0000-000000000001', 'Dr. Mehra (ENT)',   ARRAY['CBC', 'Urine Analysis'], 'Normal', 'Pending'),
  ('a0000000-0000-0000-0000-000000000002', 'Dr. Rao (Cardio)',  ARRAY['ECG', 'Lipid Profile', 'Blood Glucose'], 'Urgent', 'Pending'),
  ('a0000000-0000-0000-0000-000000000003', 'Dr. Kapoor (Derm)', ARRAY['CBC', 'LFT'], 'Normal', 'In Progress')
on conflict do nothing;

-- ── SAMPLE PRESCRIPTIONS ─────────────────────────────────────
insert into prescriptions (patient_id, doctor_name, diagnosis_text, medicines, status) values
  ('a0000000-0000-0000-0000-000000000001', 'Dr. Mehra (ENT)', 'Otitis Media',
   '[{"name":"Amoxicillin 500mg","dose":"1-0-1","duration":"5 days","instructions":"After food"},{"name":"Ibuprofen 400mg","dose":"1-1-1","duration":"3 days","instructions":"With meals"}]',
   'Pending'),
  ('a0000000-0000-0000-0000-000000000003', 'Dr. Kapoor (Derm)', 'Allergic Dermatitis',
   '[{"name":"Cetirizine 10mg","dose":"0-0-1","duration":"7 days","instructions":"At bedtime"},{"name":"Calamine Lotion","dose":"Apply twice daily","duration":"14 days","instructions":"External use only"}]',
   'Pending')
on conflict do nothing;

-- ── SAMPLE BILLING ───────────────────────────────────────────
insert into billing (patient_id, total_amount, paid_amount, payment_status, items) values
  ('a0000000-0000-0000-0000-000000000001', 2500, 1000, 'Partial',
   '[{"description":"Consultation","amount":500},{"description":"Lab Tests","amount":1200},{"description":"Medicines","amount":800}]'),
  ('a0000000-0000-0000-0000-000000000002', 5800, 5800, 'Cleared',
   '[{"description":"Consultation","amount":800},{"description":"ECG","amount":500},{"description":"Cardiology Workup","amount":4500}]'),
  ('a0000000-0000-0000-0000-000000000003', 1200, 0, 'Pending',
   '[{"description":"Consultation","amount":500},{"description":"Lab Tests","amount":700}]')
on conflict do nothing;

-- ── SAMPLE ROOM ALLOCATIONS ──────────────────────────────────
insert into room_allocations (patient_id, room_number, ward, status) values
  ('a0000000-0000-0000-0000-000000000001', '205', 'ENT Ward',      'Admitted'),
  ('a0000000-0000-0000-0000-000000000002', '310', 'Cardiac ICU',   'Admitted')
on conflict do nothing;
