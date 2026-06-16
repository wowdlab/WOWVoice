// ============================================================
// present.js — 발표자 뷰 (큰 화면용)
// ============================================================
// 입력 폼 없이 좋아요순 질문만 큰 글씨로 보여줍니다.
// A 시나리오: 5초마다 다시 조회(polling)해서 자동 갱신.
// (C에서 Supabase Realtime으로 교체 예정)
// ============================================================

const POLL_INTERVAL_MS = 5000;
const MAX_QUESTIONS = 12;

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function timeAgo(isoString) {
  const sec = Math.floor((new Date() - new Date(isoString)) / 1000);
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  return day === 1 ? "어제" : `${day}일 전`;
}

// ------------------------------------------------------------
// QR 코드 생성 — 청중이 접속할 URL을 QR로 표시
// ------------------------------------------------------------
// present.html에서 진행자가 청중에게 보여주는 용도.
// present 페이지 URL이 아닌 index(청중 입력) 페이지 URL을 QR로 만듦.
function renderQRCode() {
  const code = currentSession.code;
  const base = window.location.origin +
    window.location.pathname.replace(/present\.html$/, "");
  const audienceUrl = code !== CONFIG.DEFAULT_SESSION_CODE
    ? `${base}?code=${encodeURIComponent(code)}`
    : base;

  // 푸터 URL 텍스트 업데이트
  document.getElementById("footerUrl").textContent = audienceUrl;

  // QR 코드 생성 (qrcode-generator 라이브러리)
  try {
    const qr = qrcode(0, "M");
    qr.addData(audienceUrl);
    qr.make();
    document.getElementById("qrCode").innerHTML = qr.createSvgTag(4, 0);
  } catch (e) {
    console.warn("QR 코드 생성 실패:", e);
  }
}

// ------------------------------------------------------------
// 좋아요순 상위 질문 조회 후 렌더
// ------------------------------------------------------------
async function refreshPresent() {
  const listEl = document.getElementById("presentList");

  try {
    const { data, error } = await sb
      .from("voice_questions")
      .select("id, content, author_name, likes_count, created_at")
      .eq("session_id", currentSession.id)
      .eq("is_hidden", false)
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(MAX_QUESTIONS);

    if (error) throw error;

    if (!data || data.length === 0) {
      listEl.innerHTML =
        '<li class="empty-state" style="color:rgba(255,255,255,0.7)">아직 질문이 없어요. QR을 스캔해 질문을 남겨주세요.</li>';
      return;
    }

    listEl.innerHTML = data
      .map((q) => {
        const name = q.author_name ? escapeHtml(q.author_name) : "익명";
        return `
        <li class="present-card">
          <div class="like-big">
            <span class="num">${q.likes_count}</span>
            <span>❤</span>
          </div>
          <div>
            <div class="content">${escapeHtml(q.content)}</div>
            <div class="meta">${name} · ${timeAgo(q.created_at)}</div>
          </div>
        </li>`;
      })
      .join("");
  } catch (err) {
    console.error("발표자 뷰 갱신 실패:", err);
  }
}

// ------------------------------------------------------------
// 부트스트랩: 세션 로드 → QR 생성 → 첫 렌더 → 5초마다 polling
// ------------------------------------------------------------
async function initPresent() {
  try {
    await loadDefaultSession();
    renderQRCode();
    await refreshPresent();
    setInterval(refreshPresent, POLL_INTERVAL_MS);
  } catch (err) {
    console.error("발표자 뷰 초기화 실패:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPresent);
} else {
  initPresent();
}
