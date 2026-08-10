# 부평고 예약콕 · 학교 시설 예약 시스템

선생님 전용 학교 시설(강당·체육관·특별실 등) 예약 시스템입니다. 별도 로그인 없이 이름만
입력하면 예약할 수 있는 **교사용 페이지**와, 비밀번호로 보호되는 **관리자 페이지**로
구성되어 있습니다.

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

### 예약 방식
- 시설별로 **요일 × 교시(시간표)** 형태의 주간 그리드를 제공합니다.
- 선생님은 원하는 시설 → 주(週) 이동 → 빈 칸 클릭 → 이름/목적 입력 → 예약 확정, 순서로
  이용합니다. 같은 시설·같은 날짜·같은 교시는 선착순 1건만 예약할 수 있습니다(DB 유니크 제약).
- 본인 예약 취소는 예약 시 입력한 성함을 다시 입력해야 가능합니다(간단한 본인 확인).

### 관리자 페이지
- `ADMIN_PASSWORD` 하나로 로그인하는 단일 관리자 계정 구조입니다(선생님 개별 계정 없음).
- 로그인에 성공하면 서버 비밀키(`ADMIN_SESSION_SECRET`)로 서명된 세션 쿠키가 발급되고,
  `src/proxy.ts`(Next.js Proxy, 구 middleware)가 `/admin/*` 접근을 검사합니다.
- 시설 추가/수정/삭제, 예약 강제 취소, 공지사항 작성, 교시(시간표)·주말 운영 여부 설정이 가능합니다.

## 기술 스택
- Next.js 16 (App Router, Server Actions) + TypeScript + Tailwind CSS v4
- Supabase(Postgres) — 모든 DB 접근은 서버(Service Role Key)에서만 이루어지며, 브라우저는
  DB에 직접 접근하지 않습니다(RLS 활성화, anon 정책 없음).

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
