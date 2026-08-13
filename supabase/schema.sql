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
  requires_approval boolean not null default false,
  created_at timestamptz not null default now()
);

-- 기존에 생성된 테이블에도 반영 (이미 실행한 적이 있다면 이 줄만 추가로 실행해도 됩니다)
alter table facilities add column if not exists requires_approval boolean not null default false;

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
  -- pending: 승인이 필요한 시설(facilities.requires_approval)에 신청한 뒤 담당 선생님의 승인을 기다리는 상태
  status text not null default 'confirmed' check (status in ('confirmed','pending','cancelled')),
  reject_reason text,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

-- 기존에 생성된 테이블에도 반영 (이미 실행한 적이 있다면 이 블록만 추가로 실행해도 됩니다)
alter table reservations add column if not exists reject_reason text;
alter table reservations drop constraint if exists reservations_status_check;
alter table reservations add constraint reservations_status_check
  check (status in ('confirmed','pending','cancelled'));

-- 같은 시설·같은 날짜·같은 교시는 확정 예약 또는 승인 대기 예약이 1건만 존재
drop index if exists reservations_unique_slot;
create unique index if not exists reservations_unique_slot
  on reservations (facility_id, reservation_date, time_slot_id)
  where status in ('confirmed','pending');

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

-- ============================================================
-- 시설별 담당 선생님 로그인 + 승인형 시설(열린수업공간/도서관/녹사자마루/학운위실) 확장
-- ============================================================

-- 예약 상태에 'blocked'(담당 선생님이 특정 슬롯을 사용 제한으로 막음) 추가
alter table reservations drop constraint if exists reservations_status_check;
alter table reservations add constraint reservations_status_check
  check (status in ('confirmed','pending','cancelled','blocked'));

-- 승인형 시설 신청 시 담당 선생님에게 남기는 요청사항 메모
alter table reservations add column if not exists request_note text;

-- 같은 슬롯에 pending 신청은 여러 건 허용(선점 방식 폐지), confirmed/blocked는 여전히 1건만 허용
drop index if exists reservations_unique_slot;
create unique index if not exists reservations_unique_slot
  on reservations (facility_id, reservation_date, time_slot_id)
  where status in ('confirmed','blocked');

-- 시설별 전용 교시(NULL = 총관리자가 관리하는 공용 교시표)
alter table time_slots add column if not exists facility_id uuid references facilities(id) on delete cascade;
create index if not exists time_slots_facility_idx on time_slots (facility_id);

-- 시설마다 같은 라벨("1교시" 등)을 따로 가질 수 있도록 전역 unique(label)를 (facility_id,label)로 교체
alter table time_slots drop constraint if exists time_slots_label_key;
create unique index if not exists time_slots_facility_label_idx on time_slots (facility_id, label);

-- 시설별 담당 선생님 로그인 (시설 1곳당 로그인 1개)
create table if not exists facility_admins (
  facility_id uuid primary key references facilities(id) on delete cascade,
  password_hash text not null,
  updated_at timestamptz not null default now()
);
alter table facility_admins enable row level security;

-- 도서관 시설 추가 (열린수업공간과 같은 승인형 시설)
insert into facilities (name, category, location, capacity, description, icon, color, sort_order, requires_approval)
select '도서관', '특별실', '본관', null, null, '📚', '#0d9488', 10, true
where not exists (select 1 from facilities where name = '도서관');

-- 기존 시설을 승인형 시설로 전환
update facilities set requires_approval = true where name in ('녹사자마루', '학운위실');

-- 승인형 시설(4곳)에 공용 교시표를 복제해 전용 교시표의 시작점으로 사용
insert into time_slots (label, start_time, end_time, sort_order, is_active, facility_id)
select g.label, g.start_time, g.end_time, g.sort_order, g.is_active, f.id
from time_slots g
cross join facilities f
where g.facility_id is null
  and f.name in ('열린수업공간', '도서관', '녹사자마루', '학운위실')
  and not exists (
    select 1 from time_slots t2 where t2.facility_id = f.id and t2.label = g.label
  );

-- ============================================================
-- 예약 취소 비밀번호(PIN) + 시설별 담당 선생님 공지 메모
-- ============================================================

-- 예약 취소 시 예약자 이름 재입력 대신 사용하는 4자리 비밀번호(해시 저장)
alter table reservations add column if not exists cancel_pin_hash text;

-- 담당 선생님이 시설 예약 페이지 상단에 남기는 공지 메모
alter table facilities add column if not exists teacher_notice text;
