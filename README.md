# 부평고 예약콕 · 학교 시설 예약 시스템

선생님 전용 학교 시설(강당·체육관·특별실 등) 예약 시스템입니다. 별도 로그인 없이 이름만
입력하면 예약할 수 있는 **교사용 페이지**와, 비밀번호로 보호되는 **관리자 페이지**로
구성되어 있습니다.

## 목차
- [구조 요약](#구조-요약)
- [기술 스택](#기술-스택)
- [교사용 기능](#교사용-기능)
- [관리자용 기능](#관리자용-기능)
- [인증 구조](#인증-구조)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [폴더 구조](#폴더-구조)
- [처음 설정하기](#처음-설정하기)
- [스크립트](#스크립트)
- [운영 중 자주 하는 작업](#운영-중-자주-하는-작업)
- [참고](#참고)

## 구조 요약

```
선생님용 (로그인 없음)          관리자용 (비밀번호 로그인)
─────────────────────          ─────────────────────
/                홈             /admin/login      로그인
/facilities      시설 목록       /admin            대시보드
/facilities/[id] 시설 상세+예약   /admin/reservations 예약 관리
/reservations    내 예약 확인     /admin/facilities   시설 관리
/notices         공지사항        /admin/notices      공지 관리
                                /admin/settings     교시/운영 설정
```

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Proxy) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| 데이터베이스 | [Supabase](https://supabase.com) (Postgres) — `@supabase/supabase-js`로 서버에서만 접근 |
| 날짜 처리 | [date-fns](https://date-fns.org) |
| 배포 대상 | Vercel (또는 Node 서버 어디든) |

브라우저는 Supabase에 직접 접근하지 않습니다. 모든 읽기/쓰기는 Server
Component와 Server Action(`"use server"`)을 통해 서버에서만 실행되며, 클라이언트로는
필요한 데이터만 렌더링된 형태로 전달됩니다.

## 교사용 기능

로그인 없이 이름 입력만으로 이용합니다.

- **홈 (`/`)**: 시설 바로가기, 최근 공지 요약
- **시설 목록 (`/facilities`)**: 카테고리별 시설 목록, 노출 설정된(`is_active`) 시설만 표시
- **시설 상세 + 예약 (`/facilities/[id]`)**
  - **요일 × 교시** 형태의 주간 시간표 그리드(`weekly-timetable.tsx`) 제공
  - 주(週) 단위로 이전/다음 이동 가능
  - 빈 칸을 클릭하면 예약 모달(`reservation-modal.tsx`)이 열리고 이름/부서/목적/연락처를
    입력해 예약을 확정
  - 이미 예약된 칸은 예약자 이름과 함께 비활성 표시
  - 같은 시설·같은 날짜·같은 교시는 **DB 유니크 인덱스**로 동시 예약을 방지(선착순 1건)
  - 관리자가 주말 운영을 꺼두면(`weekend_enabled=false`) 토·일 칸은 예약 불가로 표시
- **내 예약 확인 (`/reservations`)**: 이름으로 본인 예약 조회, 예약 시 입력한 이름을
  다시 입력해야 취소 가능(간단한 본인 확인, `cancel-reservation-inline.tsx`)
- **공지사항 (`/notices`, `/notices/[id]`)**: 상단 고정(`is_pinned`) 공지 우선 노출

## 관리자용 기능

`/admin/login`에서 단일 비밀번호로 로그인합니다(선생님 개별 계정 없음).

- **대시보드 (`/admin`)**: 오늘/이번 주 예약 현황 요약
- **예약 관리 (`/admin/reservations`)**: 시설·상태·기간으로 예약 조회 및 강제 취소
- **시설 관리 (`/admin/facilities`)**: 시설 추가/수정/삭제(CRUD) — 이름, 카테고리,
  위치, 수용 인원, 설명, 아이콘(이모지), 색상, 노출 순서, 노출 여부(`is_active`)
- **공지사항 관리 (`/admin/notices`)**: 공지 작성/수정/삭제, 상단 고정 여부 설정
- **운영 설정 (`/admin/settings`)**
  - 교시(시간표) 추가/수정/삭제 — 교시명, 시작/종료 시각, 정렬 순서
  - 주말(토·일) 예약 허용 여부 토글

관리자 페이지의 모든 변경 로직은 `src/app/actions/admin-actions.ts`의 Server
Action으로 처리되며, 교사용 예약/취소는 `src/app/actions/reservation-actions.ts`에서
처리됩니다.

## 인증 구조

- 관리자 계정은 `ADMIN_PASSWORD` 환경변수 하나로 관리되는 단일 계정입니다.
  비밀번호 비교는 타이밍 공격을 막기 위해 `timingSafeEqualString`로 비교합니다
  (`src/lib/admin-auth.ts`).
- 로그인에 성공하면 서버 비밀키 `ADMIN_SESSION_SECRET`으로 서명한 HMAC-SHA256
  세션 토큰이 쿠키(`admin_session`)로 발급됩니다. 이 토큰은 비밀번호와 무관하게
  항상 동일한 값이며, 비밀키 없이는 위조할 수 없습니다.
- `src/proxy.ts`(Next.js 16의 신규 Proxy, 과거의 middleware에 해당)가 `/admin/:path*`
  요청마다 쿠키를 검증하고, 유효하지 않으면 `/admin/login`으로 리다이렉트합니다.
- Edge/Node 두 런타임 모두에서 동작해야 하므로 `node:crypto` 대신 표준 Web Crypto
  (`SubtleCrypto`) API만 사용합니다.
- Supabase는 RLS(Row Level Security)가 모든 테이블에 활성화되어 있고 `anon` 정책이
  없으므로, 클라이언트가 Supabase에 직접 접근해도 아무 권한이 없습니다. 서버는
  `service_role` 키로만 접근합니다.

## 데이터베이스 스키마

`supabase/schema.sql`에 정의되어 있으며, Supabase SQL Editor에서 그대로 실행하면
테이블 생성부터 예시 데이터 삽입까지 한 번에 끝납니다.

| 테이블 | 설명 |
|---|---|
| `facilities` | 시설 정보(이름, 카테고리, 위치, 수용인원, 아이콘, 색상, 노출 순서/여부) |
| `time_slots` | 교시/시간대(라벨, 시작·종료 시각, 정렬 순서, 활성 여부) — 관리자가 자유롭게 편집 |
| `reservations` | 예약(시설/교시/날짜/예약자/부서/목적/연락처/상태) |
| `notices` | 공지사항(제목, 내용, 상단 고정 여부) |
| `app_settings` | key-value 운영 설정(`weekend_enabled`, `site_name` 등) |

특이사항:
- `reservations`에는 `(facility_id, reservation_date, time_slot_id)` 조합에 대해
  `status = 'confirmed'`인 행만 대상으로 하는 **부분 유니크 인덱스**가 걸려 있어,
  같은 칸에 대한 중복 확정 예약을 DB 레벨에서 원천 차단합니다.
- 예약 취소는 행을 삭제하지 않고 `status`를 `cancelled`로 바꾸고
  `cancelled_at`을 기록하는 방식(soft delete)입니다.
- 모든 테이블에 `enable row level security`가 적용되어 있고 별도 정책(policy)이
  없으므로, `service_role` 키를 사용하는 서버만 접근할 수 있습니다.

## 폴더 구조

```
src/
├─ app/
│  ├─ (site)/                    # 교사용 페이지 그룹
│  │  ├─ page.tsx                # 홈
│  │  ├─ facilities/             # 시설 목록/상세+예약
│  │  ├─ reservations/           # 내 예약 확인
│  │  └─ notices/                # 공지사항
│  ├─ admin/
│  │  ├─ login/                  # 관리자 로그인 (proxy에서 예외 처리)
│  │  └─ (dashboard)/            # 로그인 필요 영역
│  │     ├─ page.tsx             # 대시보드
│  │     ├─ reservations/        # 예약 관리
│  │     ├─ facilities/          # 시설 CRUD
│  │     ├─ notices/             # 공지 CRUD
│  │     └─ settings/            # 교시/주말 운영 설정
│  ├─ actions/
│  │  ├─ reservation-actions.ts  # 교사용 예약 생성/취소 Server Action
│  │  └─ admin-actions.ts        # 관리자 CRUD Server Action
│  └─ layout.tsx, error.tsx, globals.css
├─ components/
│  ├─ weekly-timetable.tsx       # 요일×교시 주간 시간표 그리드
│  ├─ reservation-modal.tsx      # 예약 입력 모달
│  ├─ cancel-reservation-inline.tsx
│  └─ admin/                     # 관리자 폼 컴포넌트(시설/공지/교시)
├─ lib/
│  ├─ data/                      # 테이블별 조회 함수 (facilities, notices, reservations, settings, time-slots)
│  ├─ admin-auth.ts              # 비밀번호 검증 + 세션 토큰 서명/검증
│  ├─ supabase-server.ts         # 서버 전용 Supabase 클라이언트(service_role)
│  ├─ dates.ts, constants.ts, types.ts, action-state.ts
└─ proxy.ts                      # /admin/* 접근 보호 (Next.js 16 Proxy)

supabase/
└─ schema.sql                    # 테이블 생성 + RLS + 예시 데이터
```

## 처음 설정하기

### 1. Supabase 프로젝트 준비
1. https://supabase.com 에서 새 프로젝트를 만듭니다.
2. Supabase 대시보드 → **SQL Editor** 에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을
   그대로 붙여넣고 실행합니다. (시설/교시 예시 데이터가 함께 들어갑니다. 실제 시설명으로
   나중에 관리자 페이지에서 수정하면 됩니다.)
3. **Project Settings → API** 에서 `Project URL`과 `service_role` 키를 확인합니다.
   - 이 `service_role` 키는 절대 클라이언트/공개 저장소에 노출되면 안 됩니다.

### 2. 환경변수 설정
`.env.example`을 참고해 `.env.local`을 만듭니다.

```bash
cp .env.example .env.local
```

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=원하는-관리자-비밀번호
ADMIN_SESSION_SECRET=openssl rand -hex 32 로 생성한 임의의 긴 문자열
```

| 변수 | 필수 | 설명 |
|---|---|---|
| `SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | 서버 전용 관리자 키. 절대 공개 금지 |
| `ADMIN_PASSWORD` | ✅ | 관리자 로그인 비밀번호 |
| `ADMIN_SESSION_SECRET` | ✅ | 세션 쿠키 서명용 랜덤 문자열 (`openssl rand -hex 32`) |

### 3. 로컬 실행
```bash
npm install
npm run dev
```
http://localhost:3000 에서 교사용 페이지, http://localhost:3000/admin/login 에서 관리자
페이지에 접속합니다.

### 4. 배포 (Vercel)
1. 이 저장소를 GitHub 등에 올리고 Vercel에서 Import 합니다.
2. Vercel 프로젝트 **Settings → Environment Variables** 에 위 4개 환경변수를 동일하게 등록합니다.
3. Deploy 하면 끝입니다. 이후 관리자 페이지에서 시설·교시·공지사항을 실제 학교 상황에
   맞게 채워 넣으면 바로 사용할 수 있습니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |

## 운영 중 자주 하는 작업
- **시설 추가/수정**: `/admin/facilities` → 이름, 카테고리, 위치, 수용인원, 아이콘(이모지),
  색상, 노출 여부 설정.
- **교시(시간표) 변경**: `/admin/settings` → 교시명·시작/종료 시간 추가·수정·삭제.
  변경 즉시 모든 시설의 주간 시간표에 반영됩니다.
- **주말 예약 허용 여부**: `/admin/settings`의 토글 버튼으로 전환합니다.
- **예약 강제 취소**: `/admin/reservations`에서 시설/상태/기간으로 조회 후 취소.
- **공지사항 작성**: `/admin/notices` → 새 공지 작성, 상단 고정 여부 선택 가능.

## 참고
- 데이터 삭제(시설·교시 삭제)는 되돌릴 수 없으므로, 실제 운영 중인 시설은 삭제 대신
  "비공개(is_active=false)" 처리를 권장합니다.
- 선생님 로그인이 없는 구조이므로, 예약자 성함 오탈자로 인한 혼선을 막기 위해
  전교 공지 시 "예약 시 이름을 정확히 입력해 주세요" 안내를 함께 하는 것을 권장합니다.
- `ADMIN_SESSION_SECRET`을 변경하면 기존에 발급된 관리자 세션 쿠키는 모두 무효화됩니다
  (재로그인 필요).
