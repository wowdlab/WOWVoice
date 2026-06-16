// ============================================================
// WOWVote 설정 템플릿
// ============================================================
// 사용법: 이 파일을 복사해서 "config.js"로 이름을 바꾸고 본인 값 입력
//   cp js/config.example.js js/config.js
//
// ⚠️ config.js는 .gitignore에 포함되어 git에 올라가지 않습니다.
// ⚠️ 아래 anon 키는 "공개돼도 안전한" 키입니다 (RLS로 보호).
//    service_role 키는 절대 여기에 넣지 마세요.
// ============================================================

window.WOWVOTE_CONFIG = {
  // Supabase 프로젝트 URL
  // 위치: Supabase 콘솔 > Settings > API > Project URL
  SUPABASE_URL: "https://xxxxxxxxxxxx.supabase.co",

  // Supabase anon public 키
  // 위치: Supabase 콘솔 > Settings > API > Project API keys > anon public
  SUPABASE_ANON_KEY: "eyJhbGciOi...",

  // 기본 세션 코드 (변경 불필요)
  // B/C에서 다중 세션으로 확장할 때 URL ?code= 파라미터로 분기됩니다.
  DEFAULT_SESSION_CODE: "default",

  // 관리자 비밀번호 — admin.html 접속 시 사용
  // ⚠️ config.js는 .gitignore에 포함되어 git에 올라가지 않습니다.
  ADMIN_PASSWORD: "여기에-비밀번호-입력",
};
