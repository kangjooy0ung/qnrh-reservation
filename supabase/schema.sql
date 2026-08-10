-- ============================================================
-- 학교 시설 예약 시스템 스키마
-- Supabase SQL Editor 에서 그대로 실행하세요.
-- ============================================================

create extension if not exists "pgcrypto";

-- 시설 (강당, 체육관, 시청각실 등)
create table if not exists facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default '기타',
  location text,
  capacity int,
  description text,
  icon text not null default '🏫',
  color text not null default '#2563eb',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 교시/시간대 (1교시, 방과후 등 관리자가 편집 가능)
create table if not exists time_slots (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  start_time time not null,
  end_time time not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- 예약
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  time_slot_id uuid not null references time_slots(id) on delete restrict,
  reservation_date date not null,
  teacher_name text not null,
  department text,
  purpose text,
  contact text,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

-- 같은 시설·같은 날짜·같은 교시는 확정 예약이 1건만 존재
create unique index if not exists reservations_unique_slot
  on reservations (facility_id, reservation_date, time_slot_id)
  where status = 'confirmed';

create index if not exists reservations_date_idx on reservations (reservation_date);
create index if not exists reservations_teacher_idx on reservations (teacher_name);

-- 공지사항
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- 운영 설정 (key-value)
create table if not exists app_settings (
  key text primary key,
  value text not null
);

insert into app_settings (key, value) values
  ('weekend_enabled', 'false'),
  ('site_name', '인비고 자리ON 학교 시설 예약')
on conflict (key) do nothing;

-- 기본 교시 데이터 (필요에 맞게 관리자 페이지에서 수정 가능)
insert into time_slots (label, start_time, end_time, sort_order) values
  ('1교시', '09:00', '09:50', 1),
  ('2교시', '10:00', '10:50', 2),
  ('3교시', '11:00', '11:50', 3),
  ('4교시', '12:00', '12:50', 4),
  ('점심시간', '12:50', '13:40', 5),
  ('5교시', '13:40', '14:30', 6),
  ('6교시', '14:40', '15:30', 7),
  ('7교시', '15:40', '16:30', 8),
  ('방과후', '16:40', '18:00', 9)
on conflict (label) do nothing;

-- 기본 시설 예시 데이터 (원하는 대로 관리자 페이지에서 수정/삭제 가능)
insert into facilities (name, category, location, capacity, description, icon, color, sort_order) values
  ('대강당', '강당', '본관 4층', 300, '입학식, 졸업식 등 대규모 행사용 강당', '🎭', '#7c3aed', 1),
  ('체육관', '체육시설', '별관 1층', 200, '체육 수업 및 행사용 실내 체육관', '🏀', '#ea580c', 2),
  ('시청각실', '특별실', '본관 3층', 60, '빔프로젝터, 음향시설 구비된 시청각 교육실', '🎬', '#0d9488', 3),
  ('컴퓨터실', '특별실', '본관 2층', 36, 'PC 36대, 정보 수업 및 온라인 시험용', '💻', '#2563eb', 4),
  ('운동장', '체육시설', '옥외', 500, '전교생 야외 활동 및 체육대회용', '⚽', '#16a34a', 5),
  ('회의실', '사무공간', '본관 1층', 20, '교직원 회의 및 협의회용 소회의실', '🗂️', '#475569', 6)
on conflict do nothing;

-- RLS 활성화: 클라이언트(anon)는 아무 권한도 갖지 않으며
-- 모든 데이터 접근은 서버(Service Role Key)를 통해서만 이루어집니다.
alter table facilities enable row level security;
alter table time_slots enable row level security;
alter table reservations enable row level security;
alter table notices enable row level security;
alter table app_settings enable row level security;
