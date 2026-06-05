# WOWVote

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
- 📺 **발표자 뷰** — 빔프로젝터에 띄우기 좋은 큰 화면 모드
- 💎 **무료 + 오픈소스** — Slido·Mentimeter의 핵심 기능을 무료로

---

## 🎬 이 레포는 두 가지 용도로 쓸 수 있어요

### 🎓 용도 1. WOWD.LAB 워크숍 학습 자료
대구TP 도시지능본부 바이브코딩 워크숍에서 **"DB 셋업 실습"** 을 위한 학습 자료로 사용됩니다. 이 레포를 Clone해서 본인의 Supabase에 연결하면서 데이터베이스 작업의 핵심을 배울 수 있어요.

[👉 학습 가이드 보기](#-학습-가이드-워크숍-참가자용)

### 🚀 용도 2. WOWVote — WOWD.LAB의 자산 서비스
공식 운영 URL: **[vote.wowdlab.com](https://vote.wowdlab.com)** _(준비 중)_

본인의 워크숍·세미나에서 무료로 쓸 수 있는 Slido 대체재로 운영됩니다. 본인 도메인에 직접 배포해서 쓸 수도 있어요.

[👉 운영 가이드 보기](#-운영-가이드-진행자-호스트용)

---

## 🛠 빠른 시작 (5분 셋업)

### 1. Clone

```bash
git clone https://github.com/WOWD-LAB/wowvote.git
cd wowvote
```

### 2. Supabase 프로젝트 만들기
1. [supabase.com](https://supabase.com) 가입 (GitHub 연동 추천)
2. New Project 클릭
3. Region: **Northeast Asia (Seoul)** 선택
4. 비밀번호 메모 (다시 못 봄)
5. 2~3분 대기

### 3. DB 스키마 생성
`supabase-schema.sql` 파일의 내용을 Supabase SQL Editor에 붙여넣고 실행.

```sql
-- 이 파일에 있는 내용 그대로 복사
-- sessions / questions / likes 테이블 + RLS 정책 + 기본 세션 1개
```

### 4. API 키 가져오기
Supabase 프로젝트 → Settings → API에서:
- **Project URL** 복사
- **anon public 키** 복사
- ⚠️ service_role 키는 **절대 사용 금지**

### 5. .env 파일 만들기
`.env.example`을 복사해서 `.env`로 이름 바꾸고 본인 정보 입력:

```bash
cp .env.example .env
```

`.env` 파일 안에:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

⚠️ `.env`는 절대 git에 올리지 마세요. (`.gitignore`에 이미 포함됨)

### 6. 실행
정적 사이트라 별도 빌드 없이 실행됩니다.

**VS Code의 Live Server 확장 사용**:
1. `index.html` 우클릭
2. "Open with Live Server"
3. 브라우저가 자동으로 열림

또는 터미널에서:
```bash
npx serve .
```

### 7. 동작 확인
- 메인 화면(`/`)에서 질문 작성 → 목록에 보이면 OK
- 좋아요 클릭 → 카운트 증가 + 상위로 이동
- Supabase Table Editor에서 데이터 확인

🎉 **여기까지 되면 WOWVote가 본인 환경에서 동작합니다.**

---

## 📁 폴더 구조

```
wowvote/
├── index.html              # 청중용 메인 페이지
├── present.html            # 발표자용 큰 화면
├── css/
│   └── main.css            # WOWD.LAB 디자인 시스템
├── js/
│   ├── supabase-client.js  # Supabase 초기화
│   ├── questions.js        # 질문 작성·조회
│   └── likes.js            # 좋아요 기능
├── supabase-schema.sql     # DB 스키마 (그대로 실행)
├── .env.example            # 환경변수 템플릿
├── .gitignore              # .env 등 제외
├── PRD.md                  # 제품 요구사항 (전체 설계)
├── CLAUDE.md               # Claude Code 협업 규칙
├── current_status.md       # 진행 상태
└── README.md               # 이 파일
```

---

## 🎓 학습 가이드 (워크숍 참가자용)

WOWVote는 **DB 셋업 실습**에 이상적인 교재예요. 다음을 직접 경험하게 됩니다:

### DB의 3가지 핵심 동작
- **INSERT** — 질문 작성
- **SELECT** — 질문 목록 조회 (정렬, 필터링 포함)
- **UPDATE** — 좋아요 증가

### 개념 이해
- **테이블 설계** — `sessions / questions / likes` 3개 테이블 관계
- **외래 키 (Foreign Key)** — `questions.session_id`가 어떻게 작동하는지
- **인덱스** — 왜 만드는지, 어디에 만드는지
- **RLS (Row Level Security)** — Supabase의 권한 제어

### 학습 단계 추천

#### Step 1. 무작정 따라하기 (30분)
위 "빠른 시작" 가이드 그대로 따라서 동작하게 만들기. **이해는 안 돼도 일단 동작시키기**.

#### Step 2. 데이터 흐름 이해 (15분)
- 질문 작성 → Supabase Table Editor에서 어떻게 보이는지 확인
- 좋아요 클릭 → `likes` 테이블에 행이 추가되는 것 확인
- `questions.likes_count`가 어떻게 업데이트되는지 확인

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

본인의 세미나·워크숍에서 WOWVote를 운영하려면:

### 옵션 A. 본인 도메인에 배포 (추천)

#### A-1. Vercel에 배포
1. 본인 GitHub에 이 레포 Fork
2. [vercel.com](https://vercel.com) 가입
3. New Project → Fork한 레포 선택
4. **Environment Variables**에 `.env` 내용 그대로 입력
5. Deploy 클릭 → 1분 후 URL 받음

#### A-2. 커스텀 도메인 연결
- Vercel Settings → Domains → 본인 도메인 추가
- DNS 설정 (CNAME으로 vercel-dns 연결)

### 옵션 B. 한 번만 쓰고 싶을 때

#### B-1. 로컬에서 실행 + 같은 와이파이로 공유
- VS Code Live Server 실행
- 본인 IP 확인: `ipconfig` (Windows) 또는 `ifconfig` (Mac)
- 청중에게 `http://192.168.x.x:5500` 같은 URL 공유

### 행사 진행 흐름

1. **사전 준비**
   - WOWVote 접속 URL을 QR 코드로 변환 (qr-code-generator.com 등)
   - QR 이미지를 슬라이드에 삽입

2. **행사 시작**
   - "WOWVote에서 질문 받습니다" 안내
   - QR 코드 슬라이드 띄우기
   - 노트북에서 `/present` 페이지 빔프로젝터로 띄우기

3. **진행 중**
   - 청중이 질문 작성·좋아요 클릭
   - 좋아요 상위 질문부터 답변
   - `/present` 페이지는 자동으로 정렬됨

4. **행사 후**
   - Supabase Table Editor에서 모든 질문 확인
   - 추가 답변·후속 자료 작성

---

## 🎯 확장 로드맵 (A → B → C)

### ✅ A (현재) — 슬라이도 핵심만
- QR + 익명 질문 + 추천 + 정렬
- 단일 세션

### 🔜 B — 시민 행사용 실전
- 호스트 인증 (비밀번호 또는 Supabase Auth)
- 행사마다 별도 세션 생성
- 모더레이션 (부적절 질문 숨김)
- 답변 완료 표시
- CSV 내보내기

### 🚀 C — 슬라이도 킬러
- 폴(Poll) 기능 (예/아니오, 객관식)
- 워드클라우드 (질문 키워드 시각화)
- 다중 세션 동시 운영
- 발표자 대시보드
- Supabase Realtime (실시간 자동 갱신)

[전체 로드맵은 PRD.md 참고](./PRD.md)

---

## 🐛 트러블슈팅

### Supabase 연결이 안 돼요
- `.env` 파일 위치 확인 (프로젝트 루트)
- `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 오타 확인
- Supabase 프로젝트가 활성 상태인지 확인 (가끔 비활성됨)

### "RLS 정책 위반" 에러가 나요
- `supabase-schema.sql`의 정책 부분을 모두 실행했는지 확인
- SQL Editor에서: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
- 정책이 안 보이면 다시 생성

### 질문이 안 보여요
- 브라우저 콘솔(F12) 확인 — 에러 메시지가 있을 것
- Supabase Table Editor에서 데이터가 실제 있는지 확인
- `sessions` 테이블에 default 세션이 있는지 확인

### 좋아요가 작동 안 해요
- 한 브라우저에서 같은 질문에 좋아요는 1회만 가능 (의도된 동작)
- 다른 브라우저나 시크릿 모드로 테스트

### Claude Code에 물어보기 (만능 해결법)
```
이 에러가 났어. 원인 분석하고 해결해줘.
[에러 메시지 전체 복사 붙여넣기]
```

---

## 🤝 기여하기

WOWVote는 오픈소스입니다. 기여 환영해요.

### 학습자라면
- 본인이 만든 변형 버전을 fork에 올리고 PR
- README의 트러블슈팅 섹션에 본인이 겪은 문제 추가

### 개발자라면
- B/C 단계 기능 PR
- 코드 리뷰 참여
- 버그 리포트

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
미션: 고객 중심의 일하는 방식으로 더 나은 성과를 만들도록 돕는다.  
슬로건: **"AI를 제대로 쓰려면 디자인씽킹부터."**

🌐 [wowdlab.com](https://wowdlab.com)

---

## 🙏 감사

- **Anthropic Claude** — 이 도구의 모든 코드를 함께 만든 파트너
- **Supabase** — 무료로 강력한 백엔드를 제공
- **대구TP 도시지능본부** — 바이브코딩 워크숍에서 첫 실증을 함께한 파트너
