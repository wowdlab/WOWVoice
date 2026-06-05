# PRD — WOWVote

> **QR 한 번이면 끝나는 익명 Q&A. 좋은 질문이 자연스럽게 위로.**

---

## 1. 서비스 비전

### 무엇인가
**WOWVote**는 세미나·포럼·심포지엄·시민 워크숍 진행자가 청중에게서 실시간으로 질문을 받고, 청중이 좋은 질문에 추천(좋아요)을 눌러서 자연스럽게 우선순위가 정해지는 익명 Q&A 도구다.

### 왜 만드는가
- 시민 워크숍·기업 세미나에서 유료 도구(Slido, Mentimeter)에 비용을 쓰는 진행자가 많다
- 진행자가 직접 운영하는 무료·오픈소스 대안이 부족하다
- WOWD.LAB이 "AI로 직접 만들 수 있다"는 메시지를 실증할 자산이 필요하다

### 누구를 위한 것인가
**핵심 사용자: 시민 워크숍·세미나·포럼 진행자**
- 강사, 교수, 시민단체 운영자, 기업 교육 담당자
- 청중과 실시간으로 소통하고 싶지만 유료 도구는 부담
- 본인 도메인·브랜드로 운영하고 싶음

**보조 사용자: 청중**
- 익명으로 질문하고 싶음
- 좋은 질문에 공감 표시하고 싶음

### 도메인
**`vote.wowdlab.com`** — WOWD.LAB의 공식 자산으로 운영

### 차별화 포인트
1. **무료 + 오픈소스** — 유료 도구 대체
2. **질문 추천(Upvote) 시스템** — Slido의 핵심 기능 그대로
3. **한국어 UX** — 해외 도구 대비 자연스러움
4. **본인 Supabase로 운영 가능** — 데이터 주권 보유
5. **AI로 만든 도구** — WOWD.LAB의 교육·콘텐츠 자산

---

## 2. 확장 로드맵 — A → B → C

| 시나리오 | 목표 | 시점 | 핵심 기능 추가 |
|---|---|---|---|
| **A. 슬라이도 핵심만** | QR + 익명 질문 + 추천 | **오늘** | 작성, 조회, 추천, 정렬 |
| **B. 시민 행사용 실전** | 진행자가 진짜 쓸 수 있는 수준 | 1~2개월 | 세션 분리, 답변 완료, 모더레이션, CSV |
| **C. 슬라이도 킬러** | 유료 도구 대체 | 3~6개월 | 폴, 워드클라우드, 대시보드, 다중 세션 |

### 핵심 설계 원칙
오늘은 A만 구현하지만, **데이터 모델·아키텍처는 처음부터 B/C 확장 가능하게** 설계한다. 나중에 마이그레이션 없이 코드만 추가하면 B/C로 진화할 수 있다.

---

## 3. A 시나리오 — 오늘 만들 것

### 3.1 핵심 기능

| 기능 | 우선순위 | 설명 |
|---|---|---|
| QR 코드 접속 | 필수 | 진행자가 QR 만들면 청중이 스캔으로 접속 |
| 익명 질문 작성 | 필수 | 이름 입력 옵션 (선택 익명) |
| 질문 목록 조회 | 필수 | 모든 청중·진행자가 같은 목록을 봄 |
| 질문 추천(좋아요) | 필수 ⭐ | 한 사람당 1회 |
| 좋아요 순 정렬 | 필수 | 기본 정렬: 좋아요 ↓, 동률이면 최신 ↓ |
| 최신순 정렬 | 선택 | 정렬 토글 버튼 |
| 발표자 뷰 | 선택 | 진행자가 큰 화면으로 띄울 때 깔끔한 뷰 |

### 3.2 화면 구조

```
/                          → 청중용 메인 (질문 작성 + 목록)
/present                   → 발표자 뷰 (큰 화면용, 작성 폼 없음)
```

**오늘은 위 2개 화면만**. B에서 `/admin`, `/session/[code]` 등 추가.

### 3.3 사용자 흐름 (A)

```
[진행자]
1. vote.wowdlab.com 접속
2. QR 코드 생성 (URL을 QR로 변환)
3. 청중에게 QR 또는 URL 공유
4. (옵션) /present 화면을 빔프로젝터로 띄우기

[청중]
1. QR 스캔 또는 URL 접속
2. 질문 입력 + (선택) 이름 입력
3. "질문하기" 클릭 → 목록에 추가됨
4. 다른 사람 질문에 좋아요 클릭
5. 좋아요 많은 질문이 위로 올라감

[진행자가 질문 진행]
1. 목록 상위 질문부터 읽고 답변
2. 답변한 질문은 일단 그대로 둠 (B에서 "답변 완료" 기능 추가)
```

### 3.4 익명성 처리

- **이름 입력란**: 비워둘 수 있음
- 비워두면 화면에 **"익명"**으로 표시
- 적으면 그 이름으로 표시 (예: "김OO 시민")
- 좋아요는 익명 (누가 눌렀는지 기록 안 함, 단 중복 방지는 brower fingerprint 활용)

---

## 4. 데이터 모델 — B/C 확장 대비 설계

### 4.1 테이블 구조

```sql
-- ================================================
-- 1. sessions 테이블 — 행사 단위 관리 (B/C 대비)
-- ================================================
-- A에서는 'default' 세션 하나만 사용
-- B에서 진행자가 행사마다 새 세션 생성 가능

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,           -- 예: "WOWD2026", "DAEGU0518"
  title TEXT NOT NULL,                  -- 행사 이름
  host_name TEXT,                       -- 진행자 이름 (선택)
  is_active BOOLEAN DEFAULT true,       -- 비활성화 시 질문 받지 않음
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A 시작 시 기본 세션 1개 삽입
INSERT INTO sessions (code, title) 
VALUES ('default', '기본 세션');

-- ================================================
-- 2. questions 테이블 — 질문 저장
-- ================================================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) DEFAULT (
    SELECT id FROM sessions WHERE code = 'default'
  ),
  content TEXT NOT NULL,                -- 질문 내용
  author_name TEXT,                     -- 작성자 이름 (NULL 가능, 익명)
  likes_count INTEGER DEFAULT 0,        -- 좋아요 수
  is_answered BOOLEAN DEFAULT false,    -- B에서 사용
  is_hidden BOOLEAN DEFAULT false,      -- B 모더레이션용
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (조회 성능)
CREATE INDEX idx_questions_session_created 
  ON questions(session_id, created_at DESC);
CREATE INDEX idx_questions_likes 
  ON questions(session_id, likes_count DESC);

-- ================================================
-- 3. likes 테이블 — 중복 좋아요 방지
-- ================================================

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,      -- 브라우저 핑거프린트
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, voter_fingerprint)
);
```

### 4.2 A에서 사용 vs B/C에서 추가 사용

| 컬럼 | A | B | C |
|---|---|---|---|
| `sessions.code` | "default" 고정 | 행사마다 생성 | 다중 세션 |
| `questions.session_id` | "default" 자동 | 행사별 분리 | 다중 세션 |
| `questions.author_name` | 사용 | 사용 | 사용 |
| `questions.likes_count` | 사용 | 사용 | 사용 |
| `questions.is_answered` | 컬럼만 존재 | **사용 시작** | 사용 |
| `questions.is_hidden` | 컬럼만 존재 | **사용 시작 (모더레이션)** | 사용 |
| `likes` 테이블 | 사용 | 사용 | 사용 |

**핵심**: A에서 안 쓰는 컬럼·테이블도 미리 만들어둠 → B/C로 갈 때 마이그레이션 불필요

---

## 5. 기술 스택

### 프론트엔드
- **HTML/CSS/JS** (Vanilla, 빌드 불필요)
- **Pretendard Variable** (CDN)
- **WOWD.LAB 컬러**: Primary `#50676A`, Accent `#F29B2F`

### 백엔드
- **Supabase** (PostgreSQL + Auth + Realtime)
- **`@supabase/supabase-js`** (CDN)

### 호스팅
- **Vercel** (정적 사이트로 배포)
- 도메인: `vote.wowdlab.com`

### 보안 키
- **anon public 키**만 클라이언트에서 사용
- `service_role` 키는 절대 클라이언트 노출 금지

### 부가 라이브러리
- **QR 코드 생성**: `qrcode-generator` 또는 `qrcode.js` (CDN)
- **시간 표시**: 자체 `timeAgo` 함수 (3분 전, 1시간 전 등)

---

## 6. 보안 정책

### Row Level Security (RLS)

**A 시나리오 — 단순화**
- RLS **켜기** (실제 운영이니까)
- 정책:
  - `questions`: 모두 INSERT/SELECT 가능, UPDATE는 `likes_count`만, DELETE 불가
  - `likes`: 모두 INSERT/SELECT 가능, UPDATE/DELETE 불가
  - `sessions`: 모두 SELECT 가능, INSERT/UPDATE/DELETE 불가 (A는 default만 사용)

**B/C에서 추가**
- 호스트 인증 후 `sessions` INSERT 가능
- 호스트만 `is_hidden`, `is_answered` 변경 가능

### XSS 방지
- 모든 사용자 입력은 `textContent` 또는 escape 함수로 렌더링
- `innerHTML` 직접 삽입 금지

### 중복 좋아요 방지
- 브라우저 핑거프린트 (간단한 방식): `localStorage`에 UUID 생성·저장
- 한 핑거프린트당 한 질문에 1회만 좋아요
- **완벽한 방지는 아님** (다른 브라우저, 시크릿 모드 등) → C에서 IP·세션 결합

---

## 7. 개발 Phase — 오늘 진행 (A 시나리오)

### Phase 1. Supabase 셋업 + 스키마 생성
- Supabase 프로젝트 생성
- 위 SQL 실행 (3개 테이블 + default 세션)
- RLS 정책 설정
- anon 키 확인
- **완료 기준**: SQL Editor에서 `SELECT * FROM sessions` 결과 1행 나옴

### Phase 2. 환경 변수 + 기본 골격
- `.env` 파일 생성 (URL + anon key)
- `index.html` 기본 구조 (헤더, 입력 폼, 목록 영역)
- Supabase 클라이언트 초기화 코드
- **완료 기준**: 페이지 열면 빈 화면이지만 콘솔에 에러 없음

### Phase 3. 질문 작성 기능
- 입력 폼 (textarea + 이름 input + 버튼)
- INSERT 함수 구현
- 작성 후 입력값 초기화
- **완료 기준**: 질문 작성 → Supabase Table Editor에서 데이터 보임

### Phase 4. 질문 목록 조회
- SELECT 함수 (좋아요 순 정렬)
- 목록 렌더링 (시간, 작성자, 내용)
- XSS 방지 적용
- **완료 기준**: 작성한 질문이 목록에 보임

### Phase 5. 좋아요 기능
- 좋아요 버튼 UI
- 브라우저 핑거프린트 생성 (localStorage)
- INSERT into likes (중복 시 에러 무시)
- `questions.likes_count` UPDATE
- 목록 자동 재정렬
- **완료 기준**: 좋아요 누른 질문이 상위로 올라감

### Phase 6. 발표자 뷰 + 마무리
- `/present` 페이지 (입력 폼 없는 큰 화면)
- 모바일 반응형 점검
- WOWD.LAB 브랜딩 적용
- README 업데이트
- **완료 기준**: 모바일·데스크탑·빔프로젝터 모두 정상 표시

---

## 8. 화면 디자인 가이드

### 청중 화면 (`/`)

```
┌─────────────────────────────────────┐
│ WOWVote                             │
│ 질문을 자유롭게 남겨주세요          │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 질문을 입력하세요...            │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ 이름 (선택): [          ]           │
│              [질문하기 →]            │
├─────────────────────────────────────┤
│ 받은 질문 (12)         [좋아요순 ▼] │
├─────────────────────────────────────┤
│ ❤️ 5  💬 강의 자료 공유되나요?      │
│       김OO · 3분 전                 │
├─────────────────────────────────────┤
│ ❤️ 3  💬 AI 시대 강사의 미래는...   │
│       익명 · 5분 전                 │
└─────────────────────────────────────┘
```

### 발표자 화면 (`/present`)

```
┌─────────────────────────────────────┐
│           WOWVote · 받은 질문        │
│                                     │
│  ❤️ 5  강의 자료 공유되나요?         │
│         김OO · 3분 전               │
│                                     │
│  ❤️ 3  AI 시대 강사의 미래는...      │
│         익명 · 5분 전               │
│                                     │
│           vote.wowdlab.com          │
└─────────────────────────────────────┘
```

### 디자인 원칙
- **여백 충분히** — Pretendard 폰트 가독성 살리기
- **한 화면에 핵심만** — 다른 정보로 산만하지 않게
- **모바일 우선** — 청중은 95% 모바일
- **WOWD.LAB 브랜드 컬러** — 본문 어두운 청록, 강조 주황

---

## 9. B/C 확장 시 추가될 것들 (참고용)

### B 시나리오 추가
- `/admin` 호스트 페이지 (비밀번호 인증)
- 세션 생성·관리
- 질문 모더레이션 (숨김/표시)
- 답변 완료 표시
- CSV 내보내기
- 진행자별 핑거프린트 → IP 결합

### C 시나리오 추가
- `/admin/dashboard` 종합 대시보드
- 폴(Poll) 기능 (예/아니오, 객관식)
- 워드클라우드 (질문 키워드 추출)
- 다중 세션 동시 운영
- Supabase Realtime 적용 (실시간 자동 갱신)
- 발표자별 계정 관리 (Supabase Auth)

---

## 10. 결정 보류 사항 (Phase 1 시작 전 확인)

- [x] **서비스명**: WOWVote
- [x] **도메인**: vote.wowdlab.com
- [x] **작성자 익명성**: 선택 익명 (이름 입력 옵션)
- [x] **호스트 인증**: A에서는 없음, B에서 추가
- [x] **데이터 모델**: sessions 처음부터 포함
- [ ] **QR 코드 생성 위치**: 진행자가 따로 만드는가, 앱 내장하는가
  - 추천: A에서는 외부 QR 생성기 사용 안내, B에서 앱 내장
- [ ] **운영 시 사용할 default 세션 코드**: "default" / "WOWVote" / 다른 것?

---

## 부록: 핵심 SQL 한눈에

```sql
-- ============================================
-- WOWVote 초기 스키마 (A 시나리오용)
-- B/C 대비 확장 가능 구조
-- ============================================

-- 1. sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  host_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  content TEXT NOT NULL,
  author_name TEXT,
  likes_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_session_likes 
  ON questions(session_id, likes_count DESC, created_at DESC);

-- 3. likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, voter_fingerprint)
);

-- 4. 기본 세션 1개 삽입
INSERT INTO sessions (code, title, host_name) 
VALUES ('default', 'WOWVote 기본 세션', 'WOWD.LAB');

-- 5. RLS 활성화
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 6. 정책 (A 시나리오 — 단순)
-- 모두 SELECT 가능
CREATE POLICY "select_all_sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "select_all_questions" ON questions FOR SELECT USING (true);
CREATE POLICY "select_all_likes" ON likes FOR SELECT USING (true);

-- 질문 INSERT 가능
CREATE POLICY "insert_questions" ON questions 
  FOR INSERT WITH CHECK (true);

-- 좋아요 INSERT 가능
CREATE POLICY "insert_likes" ON likes 
  FOR INSERT WITH CHECK (true);

-- 질문 UPDATE: likes_count만 변경 가능
CREATE POLICY "update_question_likes" ON questions 
  FOR UPDATE USING (true);
```
