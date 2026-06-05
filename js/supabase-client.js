// ============================================================
// supabase-client.js — Supabase 초기화 + 공통 상태
// ============================================================
// 이 파일은 앱 전체에서 공유하는 Supabase 클라이언트(sb)와
// 현재 세션 정보(currentSession)를 만듭니다.
//
// CLAUDE.md 확장성 원칙: A에서도 항상 session_id를 필터로 사용.
// 'default' 세션의 id를 앱 시작 시 한 번 조회해서 캐시해두고,
// 이후 모든 질문 작성·조회에 이 id를 씁니다.
// ============================================================

// config.js가 먼저 로드되어 window.WOWVOTE_CONFIG가 있어야 합니다.
const CONFIG = window.WOWVOTE_CONFIG;

// 설정이 없으면 친절한 한국어 안내 (워크숍 참가자가 자주 겪는 실수)
if (!CONFIG || !CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes("xxxxx")) {
  alert(
    "⚠️ Supabase 설정이 비어 있어요.\n\n" +
      "js/config.example.js를 복사해 js/config.js를 만들고,\n" +
      "본인 Supabase URL과 anon 키를 입력해주세요."
  );
  throw new Error("WOWVOTE_CONFIG 미설정 — js/config.js를 확인하세요.");
}

// 전역 Supabase 클라이언트 (CDN의 supabase 전역 객체 사용)
const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// 현재 세션 정보 — getDefaultSession()이 채웁니다.
let currentSession = null;

// ------------------------------------------------------------
// 기본 세션(default)의 id를 한 번 조회해서 캐시
// ------------------------------------------------------------
// 모든 질문은 session_id가 필요한데, A에서는 'default' 세션 하나만
// 씁니다. 매번 조회하지 않도록 앱 시작 시 한 번만 가져옵니다.
async function loadDefaultSession() {
  try {
    const { data, error } = await sb
      .from("sessions")
      .select("id, code, title, is_active")
      .eq("code", CONFIG.DEFAULT_SESSION_CODE)
      .single();

    if (error) throw error;

    currentSession = data;
    return data;
  } catch (err) {
    console.error("기본 세션 조회 실패:", err);
    alert(
      "기본 세션을 찾지 못했어요.\n\n" +
        "supabase-schema.sql을 실행해 'default' 세션이 만들어졌는지 확인해주세요."
    );
    throw err;
  }
}
