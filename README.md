# WOWVoice

> **QR 한 번이면 끝나는 익명 Q&A. 좋은 질문이 자연스럽게 위로.**

세미나·포럼·심포지엄·시민 워크숍을 위한 오픈소스 실시간 Q&A 도구. WOWD.LAB이 만들었습니다.

[![Built with](https://img.shields.io/badge/Built%20with-Claude%20Code-F29B2F)]()
[![Database](https://img.shields.io/badge/Database-Supabase-50676A)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

---

## ✨ 주요 기능

- 🎯 **QR 한 번으로 참여** — 청중이 QR 스캔하면 즉시 질문 가능
- 🎭 **선택 익명** — 이름 안 적어도 OK, 적어도 OK
- ❤️ **질문 추천(좋아요)** — 좋은 질문이 자연스럽게 상위로 정렬
- 📺 **발표자 뷰 + QR 내장** — 빔프로젝터에 QR 코드 함께 표시
- 🛠 **관리자 페이지** — 질문 숨김·답변완료 처리, 세션 생성, CSV 다운로드
- 🔗 **세션 분리** — URL `?code=DAEGU0518`으로 행사별 독립 운영
- 💎 **무료 + 오픈소스** — Slido·Mentimeter의 핵심 기능을 무료로

---

## 🎬 이 레포는 두 가지 용도로 쓸 수 있어요

### 🎓 용도 1. WOWD.LAB 워크숍 학습 자료
대구TP 도시지능본부 바이브코딩 워크숍에서 **"DB 셋업 실습"** 을 위한 학습 자료로 사용됩니다. 이 레포를 Clone해서 본인의 Supabase에 연결하면서 데이터베이스 작업의 핵심을 배울 수 있어요.

[👉 학습 가이드 보기](#-학습-가이드-워크숍-참가자용)

### 🚀 용도 2. WOWVoice — WOWD.LAB의 자산 서비스
공식 운영 URL: **[voice.wowdlab.com](https://voice.wowdlab.com)** _(준비 중)_

본인의 워크숍·세미나에서 무료로 쓸 수 있는 Slido 대체재로 운영됩니다. 본인 도메인에 직접 배포해서 쓸 수도 있어요.

[👉 운영 가이드 보기](#-운영-가이드-진행자-호스트용)

---

## 🛠 빠른 시작 (5분 셋업)

### 1. Clone

```bash
git clone https://github.com/WOWD-LAB/wowvoice.git
cd wowvoice
```

### 2. Supabase 프로젝트 만들기
1. [supabase.com](https://supabase.com) 가입 (GitHub 연동 추천)
2. New Project 클릭
3. Region: **Northeast Asia (Seoul)** 선택
4. 2~3분 대기

### 3. DB 스키마 생성
`supabase-schema.sql` 파일의 내용을 Supabase SQL Editor에 붙여넣고 실행.

```sql
-- 이 파일에 있는 내용 그대로 복사
-- voice_sessions / voice_questions / voice_likes 테이블 + RLS 정책 + 기본 세션 1개
```

### 4. API 키 가져오기
Supabase 프로젝트 → Settings → API에서:
- **Project URL** 복사
- **anon public 키** 복사
- ⚠️ service_role 키는 **절대 사용 금지**

### 5. config.js 만들기

```bash
cp js/config.example.js js/config.js
```

`js/config.js` 파일을 열어서 본인 정보 입력:

```js
window.WOWVOTE_CONFIG = {
  SUPABASE_URL: "https://xxxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGc...",
  DEFAULT_SESSION_CODE: "default",
  ADMIN_PASSWORD: "원하는-비밀번호",
};
```

⚠️ `js/config.js`는 `.gitignore`에 포함되어 git에 절대 올라가지 않습니다.

### 6. 실행
정적 사이트라 별도 빌드 없이 실행됩니다.

```bash
npx serve .
```

또는 VS Code의 **Live Server** 확장으로 `index.html` 우클릭 → **Open with Live Server**.

### 7. 동작 확인
- 메인 화면(`/`)에서 질문 작성 → 목록에 보이면 OK
- 좋아요 클릭 → 카운트 증가 + 상위로 이동
- `/present.html` → 발표자 뷰 + 우하단에 QR 코드 표시
- `/admin.html` → 비밀번호 로그인 → 질문 관리 + CSV 다운로드

🎉 **여기까지 되면 WOWVoice가 본인 환경에서 동작합니다.**

---

## 📁 폴더 구조

```
wowvoice/
├── index.html              # 청중용 메인 페이지
├── present.html            # 발표자용 큰 화면 (QR 내장)
├── admin.html              # 관리자 페이지 (비밀번호 보호)
├── css/
│   └── main.css            # WOWD.LAB 디자인 시스템
├── js/
│   ├── config.example.js   # 설정 템플릿 (git 포함)
│   ├── config.js           # 실제 설정·키 (gitignore)
│   ├── supabase-client.js  # Supabase 초기화 + 세션 로드
│   ├── questions.js        # 질문 작성·조회
│   ├── likes.js            # 좋아요 기능
│   ├── present.js          # 발표자 뷰 + QR 코드
│   └── admin.js            # 관리자 패널 로직
├── supabase-schema.sql     # DB 스키마 (그대로 실행)
├── .env.example            # 환경변수 안내 (참고용)
├── .gitignore              # config.js 등 제외
├── PRD.md                  # 제품 요구사항 (전체 설계)
├── CLAUDE.md               # Claude Code 협업 규칙
├── current_status.md       # 진행 상태
└── README.md               # 이 파일
```

---

## 🎓 학습 가이드 (워크숍 참가자용)

WOWVoice는 **DB 셋업 실습**에 이상적인 교재예요. 다음을 직접 경험하게 됩니다:

### DB의 3가지 핵심 동작
- **INSERT** — 질문 작성
- **SELECT** — 질문 목록 조회 (정렬, 필터링 포함)
- **UPDATE** — 좋아요 증가, 질문 상태 변경

### 개념 이해
- **테이블 설계** — `voice_sessions / voice_questions / voice_likes` 3개 테이블 관계
- **외래 키 (Foreign Key)** — `voice_questions.session_id`가 어떻게 작동하는지
- **인덱스** — 왜 만드는지, 어디에 만드는지
- **RLS (Row Level Security)** — Supabase의 권한 제어

### 학습 단계 추천

#### Step 1. 무작정 따라하기 (30분)
위 "빠른 시작" 가이드 그대로 따라서 동작하게 만들기. **이해는 안 돼도 일단 동작시키기**.

#### Step 2. 데이터 흐름 이해 (15분)
- 질문 작성 → Supabase Table Editor에서 어떻게 보이는지 확인
- 좋아요 클릭 → `voice_likes` 테이블에 행이 추가되는 것 확인
- `voice_questions.likes_count`가 어떻게 업데이트되는지 확인

#### Step 3. 코드 한 번 읽기 (20분)
`js/questions.js`에서:
- INSERT 부분 찾아보기
- SELECT 부분 찾아보기
- 정렬은 어디서 하는지 (DB? 클라이언트?)

#### Step 4. 변형해보기 (도전!)
Claude Code에게 이런 요청:
- "좋아요 취소 기능 추가해줘"
- "댓글 기능 추가해줘 (질문에 답글 달기)"
- "내 본인 프로젝트에 같은 구조로 적용하는 방법 알려줘"

---

## 🚀 운영 가이드 (진행자·호스트용)

### 행사 준비

1. **세션 만들기** — `admin.html`에서 행사 코드 생성 (예: `DAEGU0518`)
2. **청중 URL 확인** — `https://voice.wowdlab.com/?code=DAEGU0518`
3. **QR 코드** — `present.html` 하단에 자동 표시됨 (별도 생성 불필요)

### 행사 진행

1. 노트북에서 `present.html`을 빔프로젝터로 띄우기
   - QR 코드가 화면 우하단에 자동 표시됨
2. 청중이 QR 스캔 → 질문 작성·좋아요
3. 좋아요 상위 질문부터 답변 (5초마다 자동 갱신)

### 행사 후

- `admin.html` → CSV 다운로드 → 모든 질문 엑셀로 저장

### Vercel 배포

1. 본인 GitHub에 이 레포 Fork
2. [vercel.com](https://vercel.com) → New Project → Fork한 레포 선택
3. Deploy 클릭 (환경변수 불필요, `config.js`로 관리)
4. 커스텀 도메인 연결 (선택)

---

## 🎯 확장 로드맵 (A → B → C)

### ✅ A (현재) — 슬라이도 핵심
- QR + 익명 질문 + 추천 + 정렬
- 발표자 뷰 + QR 내장
- 관리자 페이지 (질문 관리, 세션 분리, CSV)

### 🔜 B — 시민 행사용 실전
- 호스트 인증 (Supabase Auth)
- 세션별 독립 도메인
- 모더레이션 고도화
- 답변 완료 공개 표시

### 🚀 C — 슬라이도 킬러
- 폴(Poll) 기능 (예/아니오, 객관식)
- 워드클라우드 (질문 키워드 시각화)
- 다중 세션 동시 운영 대시보드
- Supabase Realtime (실시간 자동 갱신)

[전체 로드맵은 PRD.md 참고](./PRD.md)

---

## 🐛 트러블슈팅

| 증상 | 해결 |
|---|---|
| "WOWVOTE_CONFIG 미설정" | `js/config.js`를 만들었는지 확인. `config.example.js` 복사 후 키 입력 |
| "세션을 찾지 못했어요" | `supabase-schema.sql` 실행 후 `SELECT * FROM voice_sessions;` 로 확인 |
| 빨간 RLS 에러 | 스키마 전체를 SQL Editor에서 다시 Run |
| 좋아요가 안 눌려요 | 같은 질문은 브라우저당 1회만 가능 (의도된 동작). 시크릿 모드로 테스트 |
| admin에서 세션 생성 실패 | Supabase SQL Editor에서 `insert_sessions` 정책 추가 확인 |

```
에러가 나면 메시지 전체를 Claude Code에 붙여넣기:
"이 에러가 났어. 원인 분석하고 해결해줘."
```

---

## 📜 라이선스

MIT License. 자유롭게 사용·수정·재배포 가능.

---

## 👥 만든 사람

**테디 (Teddy, 송일)** — WOWD.LAB 대표
- 한양대학교 겸임교수
- 디자인씽킹 × AI 교육 14년
- 이메일: teddy@wowdlab.com

**WOWD.LAB (와우디랩)**
디자인씽킹 × AI로 일하는 방식을 변화시키는 교육 훈련 전문 기업.
슬로건: **"AI를 제대로 쓰려면 디자인씽킹부터."**

🌐 [wowdlab.com](https://wowdlab.com)

---

## 🙏 감사

- **Anthropic Claude** — 이 도구의 모든 코드를 함께 만든 파트너
- **Supabase** — 무료로 강력한 백엔드를 제공
- **대구TP 도시지능본부** — 바이브코딩 워크숍에서 첫 실증을 함께한 파트너
