# Current Status

이 파일은 WOWVoice 작업 진행 상태를 기록합니다. Claude Code 세션이 끊겨도 이 파일 하나만 읽으면 바로 이어 작업할 수 있도록 매 Phase 끝날 때마다 업데이트합니다.

---

## 📋 프로젝트 정보

- **프로젝트명**: WOWVoice
- **도메인**: voice.wowdlab.com (배포 예정)
- **작업 시작일**: 2026-06-05
- **GitHub 레포**: (작업 시작 시 채워넣기, 예: github.com/WOWD-LAB/wowvote)
- **현재 시나리오**: A (슬라이도 핵심만)
- **다음 목표**: B (시민 행사용 실전) — 별도 작업 시점에 시작

---

## ✅ 완료된 작업

### 사전 결정 (Phase 1 시작 전 완료)
- [x] 서비스명: **WOWVoice**
- [x] 도메인: **voice.wowdlab.com**
- [x] 핵심 가치: "QR 한 번이면 끝나는 익명 Q&A. 좋은 질문이 자연스럽게 위로."
- [x] 데이터 모델: sessions 테이블 처음부터 포함 (B/C 확장 대비)
- [x] 작성자 익명성: 선택 익명 (이름 입력 옵션)
- [x] 호스트 인증: A에서는 없음, B에서 추가
- [x] README 톤: 학습용 + 자산 운영용 이중 톤
- [x] 4종 문서 작성 완료 (PRD / CLAUDE / README / current_status)

### 작업 시작 시 결정 (2026-06-05, Claude Code 세션)
- [x] 기본 세션 코드: **`default`**
- [x] `/present` 자동 갱신: **5초 polling** (Realtime은 C에서)
- [x] 키 주입 방식: **`js/config.js` 패턴** (빌드 없는 정적 사이트라 `.env` 직접 못 읽음 → anon 키를 config.js에 직접. `.env.example`은 안내용으로 유지)

### Phase 2~6 — 프론트엔드 코드 작성 완료 (⚠️ 통합 테스트는 Phase 1 후)
- [x] `.gitignore`에 `js/config.js` 추가
- [x] `js/config.example.js` (키 템플릿)
- [x] `css/main.css` (WOWD.LAB 디자인 시스템 + 발표자 뷰 스타일)
- [x] `js/supabase-client.js` (클라이언트 초기화 + default 세션 캐시)
- [x] `index.html` (헤더 + 작성 폼 + 목록 골격)
- [x] `js/questions.js` (작성 INSERT / 조회 SELECT·정렬 / 렌더 / XSS escape / timeAgo / 정렬 토글)
- [x] `js/likes.js` (fingerprint + likes INSERT + increment_likes RPC, 중복 방지)
- [x] `present.html` + `js/present.js` (5초 polling 발표자 뷰)
- [x] `supabase-schema.sql` (3테이블 + 인덱스 + default 세션 + increment_likes 함수 + RLS 6정책)
- [x] 전체 JS `node --check` 문법 통과
- ⚠️ **실제 동작 테스트 안 됨** — Supabase 키가 없어 INSERT/SELECT/좋아요 검증 불가. Phase 1 완료 후 한 번에 검증 예정.

---

## 🔄 진행 중 작업

**Phase 1 — Supabase 셋업 (테디가 콘솔에서 직접 진행 대기 중)**
- 코드는 다 준비됨. 테디가 Supabase 프로젝트 만들고 `supabase-schema.sql` 실행 → anon 키를 `js/config.js`에 입력하면 바로 동작.

---

## 🎯 다음 단계

### Phase 1. Supabase 셋업 + 스키마 실행 (테디 직접)

**할 일:**
1. [supabase.com](https://supabase.com) 새 프로젝트 생성 (Region: Northeast Asia (Seoul))
2. 콘솔 좌측 **SQL Editor** → `supabase-schema.sql` 내용 통째로 붙여넣고 **Run**
3. **Settings > API**에서 **Project URL**과 **anon public 키** 복사
4. `cp js/config.example.js js/config.js` 후 복사한 값 입력
5. `npx serve .` 또는 VS Code Live Server로 `index.html` 열기

**완료 기준:**
- 질문 작성 → 목록에 보임 + Supabase Table Editor에 데이터 보임
- 좋아요 클릭 → 카운트 증가 + 상위로 이동
- `/present.html` 큰 화면에 좋아요순 표시 + 5초마다 갱신

**예상 소요 시간:** 15~20분 (콘솔 셋업) + 검증

### 그 다음 (Phase 1 검증 후)
- QR 코드 안내 방식 확정 (A는 외부 생성기, B에서 내장)
- Vercel 배포 + `voice.wowdlab.com` 연결
- README의 셋업 단계를 `.env` → `config.js` 패턴에 맞춰 정리

---

## ⏸️ 미결정 이슈

### 작업 중 결정해야 할 것들

- [ ] **QR 코드 생성 위치**
  - 외부 사이트(qr-code-generator.com 등) 사용 안내?
  - 앱 내장? (`/qr` 페이지 또는 `/present`에 QR 표시)
  - **추천**: A는 외부 사이트, B에서 내장
  
- [ ] **default 세션 코드 이름**
  - 현재 안: "default"
  - 다른 안: "WOWVoice", "main", "v1"
  - **추천**: "default" (가장 명확)

- [ ] **`/present` 페이지 자동 갱신 방식**
  - 5초마다 fetch (단순)
  - Supabase Realtime (실시간)
  - **추천**: A는 5초 fetch (단순), C에서 Realtime

- [ ] **모바일 키보드 올라올 때 UX**
  - textarea 자동 포커스?
  - "질문하기" 버튼 위치 고정?
  - Phase 6에서 모바일 테스트하며 결정

- [ ] **로딩 상태 표시 방식**
  - 스피너?
  - "전송 중..." 텍스트?
  - **추천**: 버튼 비활성화 + 텍스트 변경

---

## 📚 핵심 참고 정보

### 키 설정 (Phase 1에서 `js/config.js`에 채워넣기)
```js
// js/config.example.js 를 js/config.js 로 복사 후 입력
window.WOWVOTE_CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co", // Settings > API > Project URL
  SUPABASE_ANON_KEY: "eyJ...",              // Settings > API > anon public
  DEFAULT_SESSION_CODE: "default",
};
```

⚠️ `js/config.js`는 `.gitignore`에 포함 (git에 안 올라감)
⚠️ **service_role 키는 절대 넣지 말 것** (anon 키만 사용)

### Supabase 정보
- 프로젝트 URL: (Phase 1에서 채워넣기)
- 핵심 테이블: `sessions`, `questions`, `likes`
- 기본 세션 코드: `default`

### 기술 스택
- 프론트엔드: Vanilla HTML/CSS/JS (빌드 없음)
- 백엔드: Supabase
- 호스팅: Vercel
- 라이브러리: @supabase/supabase-js (CDN)

### 브랜드 컬러
- Primary: #50676A (청록)
- Accent: #F29B2F (주황)
- Dark: #231F20 (본문)
- 배경: #FAFAF8
- 폰트: Pretendard Variable (CDN)

---

## 🧭 작업 패턴

### 한 Phase 끝낼 때마다
```
Phase X 완료.
current_status.md 업데이트하고
다음 Phase로 가자.
```

### 새 대화 세션 시작 시
```
이 폴더의 4개 문서를 읽고
전체 맥락을 파악한 다음 어디서부터 이어가면 되는지 알려줘.

읽을 파일:
- CLAUDE.md (협업 규칙)
- PRD.md (앱 설계)
- README.md (앱 소개)
- current_status.md (현재 상태)
```

### Supabase 막힐 때
```
Supabase에서 [상황]인데 어떻게 해야 해?
화면 어디를 클릭해야 하는지
초보자가 알 수 있도록 아주 자세히 단계별로 설명해줘.
```

### 에러 났을 때
```
이 에러가 났어. 원인 분석하고 해결해줘.
[에러 메시지 전체 복사]
```

---

## 🚀 B/C로 갈 때 참고 사항

이번 A 작업이 끝나면 B/C로 진화할 때 참고할 메모.

### A → B 전환 시 추가할 것
- [ ] `/admin` 페이지 (호스트용)
- [ ] 호스트 인증 (Supabase Auth 또는 환경변수 비밀번호)
- [ ] `sessions` INSERT 정책 (호스트만 가능하게)
- [ ] 세션 코드로 행사 분리 (`/[code]` URL 구조)
- [ ] 질문 모더레이션 UI
- [ ] 답변 완료 표시 기능
- [ ] CSV 내보내기

### B → C 전환 시 추가할 것
- [ ] 폴(Poll) 테이블 추가
- [ ] 워드클라우드 (질문 키워드 추출 + 시각화)
- [ ] 다중 세션 대시보드
- [ ] Supabase Realtime 적용
- [ ] 진행자별 계정 관리

### 마이그레이션 부담 예상
- A → B: **낮음** (이미 스키마는 B 대비, 코드만 추가)
- B → C: **중간** (폴 테이블 추가, Realtime 도입)

---

## 📝 작업 로그

| 날짜 | Phase | 작업 내용 | 비고 |
|---|---|---|---|
| 2026-06-05 | Phase 0 | 4종 문서 작성 완료 | claude.ai에서 진행 |
| 2026-06-05 | Phase 2~6 | 프론트엔드 전체 코드 작성 완료 | Claude Code. 통합 테스트는 Phase 1 후 |
| | Phase 1 | (대기) 테디가 Supabase 셋업 + config.js 입력 | 콘솔 직접 작업 |

---

**마지막 업데이트**: 2026-06-05 (4종 문서 작성 완료, Claude Code로 Phase 1 시작 대기)
