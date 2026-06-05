# 🎓 WOWVote 워크숍 실습 가이드

> Clone부터 동작 확인까지, **초보자가 혼자서도 따라 할 수 있게** 만든 실습 안내서입니다.
> 막히면 언제든 Claude Code에게 에러를 그대로 붙여넣으세요.

**오늘 배우는 것:** DB의 핵심 동작(INSERT / SELECT / UPDATE), 테이블 설계, RLS, 그리고 "AI로 직접 도구를 만든다"는 경험.

---

## 0. 시작 전 준비물 (실습 전에 미리!)

아래 4가지는 **실습 시작 전에 미리 깔고 가입**해 두세요. 현장에서 설치하면 시간이 많이 듭니다.

- [ ] **GitHub 계정** — github.com 가입
- [ ] **VS Code** — code.visualstudio.com 설치
- [ ] **Node.js** — nodejs.org에서 LTS 버전 설치 (`npx` 명령에 필요)
- [ ] **Supabase 계정** — supabase.com 가입 (GitHub로 로그인 추천)

> ✅ 확인: 터미널에 `node -v` 쳤을 때 버전 숫자가 나오면 준비 완료.

---

## 1. 실습 진행 순서 (한눈에)

```
1) git clone  →  코드 내려받기
2) Supabase 셋업  →  내 DB 만들기 (SUPABASE_SETUP.md)
3) config.js 만들기  →  내 키 연결하기
4) 실행  →  npx serve .
5) 동작 확인  →  질문 / 좋아요 / 발표자 뷰
```

핵심 개념 한 줄: **코드는 모두 공통, DB와 키는 "1인 1개"**.
옆 사람과 질문이 안 섞이는 게 정상이에요. (각자 자기 Supabase를 쓰니까)

---

## 2. 단계별 실습

### Step 1. 코드 내려받기

```bash
git clone https://github.com/WOWD-LAB/wowvote.git
cd wowvote
```

VS Code로 이 폴더를 열어두세요. (`File > Open Folder`)

### Step 2. 내 Supabase 만들기

👉 **`SUPABASE_SETUP.md` 파일을 열어서 1~4단계를 따라 하세요.**

요약하면:
1. supabase.com에서 새 프로젝트 (Region: **Seoul**)
2. **SQL Editor**에 `supabase-schema.sql` 통째로 붙여넣고 **Run**
3. `SELECT * FROM sessions;`로 `default` 1줄 확인
4. **Settings > API**에서 **Project URL**과 **anon public 키** 복사

### Step 3. 내 키 연결하기 (config.js)

```bash
cp js/config.example.js js/config.js
```

그다음 `js/config.js`를 열어 복사한 값을 채웁니다:

```js
window.WOWVOTE_CONFIG = {
  SUPABASE_URL: "https://여기-본인-URL.supabase.co",
  SUPABASE_ANON_KEY: "여기-anon-public-키",
  DEFAULT_SESSION_CODE: "default",
};
```

### Step 4. 실행하기

```bash
npx serve .
```

터미널에 뜬 주소(예: `http://localhost:3000`)를 브라우저에서 엽니다.
(또는 VS Code에서 `index.html` 우클릭 → **Open with Live Server**)

### Step 5. 동작 확인 ✅

- [ ] 질문 작성 → 목록에 보임
- [ ] Supabase **Table Editor > questions**에 내 질문 데이터가 보임
- [ ] 좋아요 클릭 → 숫자 증가 + 위로 이동
- [ ] `http://localhost:3000/present.html` → 큰 화면 발표자 뷰, 5초마다 갱신

🎉 **여기까지 되면 성공입니다!**

---

## 3. ⚠️ 자주 막히는 곳 (꼭 읽기)

| 증상 | 원인 / 해결 |
|---|---|
| **"WOWVOTE_CONFIG 미설정" 알림** | `config.js`를 안 만들었거나 키가 비어 있음. Step 3 다시 |
| **그냥 더블클릭했더니 안 돼요** | `index.html`을 `file://`로 열면 안 됨. **반드시 `npx serve` / Live Server** |
| **"기본 세션을 찾지 못했어요"** | 스키마 실행이 안 됨. `supabase-schema.sql`을 SQL Editor에서 Run했는지 확인 |
| **빨간 RLS / 정책 에러** | 스키마의 정책 부분이 빠짐. 스키마 전체를 다시 Run |
| **키 어디 있어요?** | Supabase **Settings > API**. `anon public`만 사용, `service_role`은 **절대 금지** |
| **며칠 뒤 갑자기 안 돼요** | 무료 프로젝트는 미사용 시 일시정지됨. 콘솔에서 **Restore**로 깨우기 |

> 💡 **만능 해결법** — 에러가 나면 메시지 **전체를 복사**해서 Claude Code에 이렇게:
> ```
> 이 에러가 났어. 원인 분석하고 해결해줘.
> [에러 메시지 전체 붙여넣기]
> ```

---

## 4. 코드 읽어보기 (15분, 이해 단계)

동작시켰다면 이제 코드가 어떻게 도는지 봅니다.

- `js/questions.js` — **INSERT**(질문 작성), **SELECT**(목록 조회·정렬)가 어디 있는지 찾아보기
- `js/likes.js` — 좋아요 중복을 어떻게 막는지 (`fingerprint` + UNIQUE 제약)
- `supabase-schema.sql` — 테이블 3개의 관계, 인덱스, RLS 정책

스스로 질문해보기:
- 정렬은 **DB에서** 할까, **브라우저에서** 할까? (힌트: `.order(...)`)
- 좋아요 숫자는 왜 `increment_likes` 함수로 올릴까? (힌트: 동시에 여러 명이 누르면?)

---

## 5. 변형 도전 (실습의 진짜 재미 🔥)

Claude Code에게 이렇게 지시해보세요. **하나씩** 시도하는 걸 추천:

```
좋아요 취소 기능을 추가해줘. 한 번 더 누르면 취소되게.
```
```
질문에 답글(댓글) 다는 기능을 추가해줘. 데이터 모델 변경부터 단계별로.
```
```
질문 검색창을 추가해줘. 입력하면 실시간으로 필터링되게.
```
```
내 본인 프로젝트에 같은 구조(질문+좋아요)를 적용하는 방법을 알려줘.
```

> 변형할 때도 원칙은 같아요: **DB(스키마) → 코드 → 테스트** 순서.

---

## 6. 더 나아가기 (집에서)

- **배포해서 진짜 쓰기**: README의 "운영 가이드" → Vercel 배포 + QR 코드
- **B 시나리오 도전**: 호스트 페이지, 행사별 세션 분리, 모더레이션
  ```
  B 시나리오(/admin 호스트 페이지 + 세션 분리) 계획부터 세워줘.
  ```

---

## 7. Claude Code 세션을 새로 열 때

대화가 끊겨도 이 프롬프트 하나면 맥락이 복원됩니다:

```
이 폴더의 문서를 읽고 전체 맥락을 파악한 다음
어디서부터 이어가면 되는지 알려줘.
읽을 파일: CLAUDE.md, PRD.md, README.md, current_status.md, SUPABASE_SETUP.md
```

---

**즐겁게 실습하세요! 막히는 건 당연한 거예요. 에러는 친구입니다. 🙌**
— WOWD.LAB
