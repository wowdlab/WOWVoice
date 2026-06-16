# Supabase 셋업 가이드 (Phase 1)

> Supabase를 한 번도 안 써봤다고 가정한 **클릭 위치까지 짚어주는** 단계별 안내입니다.
> 워크숍 참가자도 이 문서 하나만 보고 따라 할 수 있어요. 천천히 따라오세요.

**예상 소요 시간:** 약 15~20분

---

## 1단계 · 회원가입 & 프로젝트 만들기

1. 브라우저에서 **supabase.com** 접속 → 우측 상단 **`Start your project`** (초록 버튼) 클릭
2. **`Sign in with GitHub`** 추천 (깃허브 계정으로 바로 로그인)
3. 로그인되면 대시보드가 나와요. **`New project`** 버튼 클릭
   - 처음이면 먼저 **Organization(조직)** 을 만들라고 할 수 있어요 → 이름 아무거나(예: `wowdlab`), Plan은 **Free** 선택
4. 프로젝트 정보 입력 화면:
   - **Name**: `wowvote`
   - **Database Password**: 자동 생성된 거 그대로 두고 옆 **Copy** 눌러서 **어딘가 메모** (다시 못 봐요. 안 써도 당장은 괜찮지만 습관)
   - **Region**: 드롭다운에서 **`Northeast Asia (Seoul)`** 선택 ⭐ (한국 사용자 속도)
   - **`Create new project`** 클릭
5. **2~3분 대기** (DB 만드는 중 — "Setting up project..." 표시). 커피 한 모금 ☕

---

## 2단계 · 스키마 실행 (테이블 만들기)

1. 프로젝트가 준비되면 **왼쪽 세로 메뉴**를 봅니다. 아이콘들이 줄지어 있어요.
2. **`SQL Editor`** 클릭 (아이콘이 **`</>`** 또는 데이터베이스 모양, 보통 위쪽에 있어요)
3. 가운데 **`+ New query`** (또는 빈 편집창)이 보입니다. 거기에:
   - 우리 프로젝트의 **`supabase-schema.sql`** 파일을 VS Code에서 열고 → **전체 선택(Cmd+A) → 복사(Cmd+C)**
   - Supabase 편집창에 **붙여넣기(Cmd+V)**
4. 오른쪽 아래 **`Run`** 버튼 클릭 (또는 **Cmd+Enter**)
5. 아래에 **`Success. No rows returned`** 비슷한 초록 메시지가 뜨면 성공 ✅

> ⚠️ 빨간 에러가 뜨면 메시지 **전체를 그대로 복사해서 Claude에게 붙여넣어 주세요.** 바로 원인 잡아줍니다.

---

## 3단계 · 제대로 됐는지 확인 (1분)

같은 **SQL Editor** 에서 새 쿼리에 이거 한 줄 넣고 **Run**:

```sql
SELECT * FROM sessions;
```

→ 아래에 **1줄**이 나오고 `code` 칸에 **`default`**, `title` 에 **`WOWVoice 기본 세션`** 이 보이면 완벽해요.

추가로 정책이 다 들어갔는지 보려면:

```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

→ 정책 **6개**가 보이면 OK.

---

## 4단계 · 키 2개 복사하기

1. 왼쪽 세로 메뉴 맨 아래 **`Settings`** (⚙️ 톱니바퀴) 클릭
2. 설정 하위 메뉴에서 **`API`** 클릭
3. 이 화면에서 **두 가지** 를 복사합니다:
   - **`Project URL`** (맨 위, `https://....supabase.co` 형태) → 옆 **Copy**
   - **`Project API keys`** 섹션의 **`anon` `public`** 키 → 옆 **Copy**
   - ❌ **`service_role`** 키는 **절대 복사·사용 금지** (빨간 경고 표시 있을 거예요)

---

## 5단계 · config.js에 키 넣기

터미널에서:

```bash
cp js/config.example.js js/config.js
```

그다음 **`js/config.js`** 파일을 열어서 복사한 값을 채워주세요:

```js
window.WOWVOTE_CONFIG = {
  SUPABASE_URL: "https://여기에-본인-URL.supabase.co",
  SUPABASE_ANON_KEY: "여기에-anon-public-키",
  DEFAULT_SESSION_CODE: "default",
};
```

> ⚠️ `js/config.js` 는 `.gitignore` 에 포함되어 git에 올라가지 않습니다.
> ⚠️ `anon public` 키만 사용하세요. `service_role` 키는 절대 넣지 마세요.

---

## 6단계 · 실행 & 동작 확인

정적 사이트라 빌드 없이 바로 실행됩니다.

```bash
npx serve .
```

또는 VS Code의 **Live Server** 확장으로 `index.html` 우클릭 → **Open with Live Server**.

**확인 항목:**
- 질문 작성 → 목록에 보임 + Supabase **Table Editor** 에 데이터 보임
- 좋아요 클릭 → 카운트 증가 + 상위로 이동
- `present.html` 큰 화면에 좋아요순 표시 + 5초마다 자동 갱신

🎉 여기까지 되면 WOWVoice가 본인 환경에서 동작합니다.

---

## 막혔을 때

에러가 나면 메시지 전체를 복사해서 Claude Code에게:

```
이 에러가 났어. 원인 분석하고 해결해줘.
[에러 메시지 전체 복사 붙여넣기]
```

자주 겪는 문제는 README의 **🐛 트러블슈팅** 섹션도 참고하세요.
