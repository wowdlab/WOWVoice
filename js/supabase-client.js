// ============================================================
// supabase-client.js — Supabase 초기화 + 공통 상태
// ============================================================
// 이 파일은 앱 전체에서 공유하는 Supabase 클라이언트(sb)와
// 현재 세션 정보(currentSession)를 만듭니다.
//
// 세션 분리 원칙: URL ?code= 파라미터 우선, 없으면 config 기본값.
// index.html?code=DAEGU0518 → 해당 세션 로드.
// B/C에서 다중 행사를 운영할 때 코드 수정 없이 URL만 바꾸면 됨.
// ============================================================

const CONFIG = window.WOWVOTE_CONFIG;

if (!CONFIG || !CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes("xxxxx")) {
  alert(
    "⚠️ Supabase 설정이 비어 있어요.\n\n" +
      "js/config.example.js를 복사해 js/config.js를 만들고,\n" +
      "본인 Supabase URL과 anon 키를 입력해주세요."
  );
  throw new Error("WOWVOTE_CONFIG 미설정 — js/config.js를 확인하세요.");
}

const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

let currentSession = null;

// ------------------------------------------------------------
// 세션 로드 — URL ?code= 파라미터 우선, 없으면 config 기본값
// ------------------------------------------------------------
async function loadDefaultSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = urlParams.get("code") || CONFIG.DEFAULT_SESSION_CODE;

  try {
    const { data, error } = await sb
      .from("voice_sessions")
      .select("id, code, title, is_active")
      .eq("code", sessionCode)
      .single();

    if (error) throw error;

    currentSession = data;
    return data;
  } catch (err) {
    console.error("세션 조회 실패:", err);
    alert(
      `세션 '${sessionCode}'을 찾지 못했어요.\n\n` +
        "supabase-schema.sql을 실행해 세션이 만들어졌는지 확인해주세요."
    );
    throw err;
  }
}
