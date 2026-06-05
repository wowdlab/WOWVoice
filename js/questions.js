// ============================================================
// questions.js — 질문 작성·조회·렌더링 + 앱 부트스트랩
// ============================================================
// 이 파일이 청중 메인 페이지(index.html)의 "메인"입니다.
//   - 폼 제출 → 질문 INSERT
//   - 목록 SELECT(정렬) → 화면 렌더
//   - 좋아요 버튼 클릭 → likes.js의 addLike 호출
// ============================================================

// 정렬 모드: 'likes'(좋아요순, 기본) | 'recent'(최신순)
let sortMode = "likes";

// ------------------------------------------------------------
// XSS 방지: 사용자 입력을 HTML에 넣기 전에 특수문자를 escape
// ------------------------------------------------------------
// 원칙적으로 textContent가 가장 안전하지만, 카드 템플릿을 한 번에
// 그리기 위해 escape 후 innerHTML을 씁니다. (CLAUDE.md 보안 원칙)
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ------------------------------------------------------------
// 상대 시간 표시: "방금 전", "3분 전", "2시간 전", "어제" ...
// ------------------------------------------------------------
function timeAgo(isoString) {
  const now = new Date();
  const then = new Date(isoString);
  const sec = Math.floor((now - then) / 1000);

  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return "어제";
  if (day < 7) return `${day}일 전`;
  // 일주일 넘으면 날짜로 (예: 6월 5일)
  return `${then.getMonth() + 1}월 ${then.getDate()}일`;
}

// ------------------------------------------------------------
// 질문 작성 (INSERT)
// ------------------------------------------------------------
async function submitQuestion(event) {
  event.preventDefault();

  const contentInput = document.getElementById("contentInput");
  const nameInput = document.getElementById("nameInput");
  const submitBtn = document.getElementById("submitBtn");

  const content = contentInput.value.trim();
  // 이름이 비어 있으면 NULL로 저장 → 화면에 '익명' 표시
  const authorName = nameInput.value.trim() || null;

  if (!content) return;

  // 전송 중 버튼 비활성화 (중복 제출 방지)
  submitBtn.disabled = true;
  submitBtn.textContent = "전송 중...";

  try {
    const { error } = await sb.from("questions").insert({
      session_id: currentSession.id, // 항상 현재 세션으로 (A는 default)
      content: content,
      author_name: authorName,
    });

    if (error) throw error;

    // 입력값 초기화 후 목록 새로고침
    contentInput.value = "";
    nameInput.value = "";
    await loadQuestions();
  } catch (err) {
    console.error("질문 작성 실패:", err);
    alert("질문 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "질문하기 →";
  }
}

// ------------------------------------------------------------
// 질문 목록 조회 (SELECT) — 정렬은 DB에서 처리
// ------------------------------------------------------------
async function loadQuestions() {
  const listEl = document.getElementById("questionList");

  try {
    let query = sb
      .from("questions")
      .select("id, content, author_name, likes_count, created_at")
      .eq("session_id", currentSession.id) // 항상 세션 필터 (확장성 원칙)
      .eq("is_hidden", false); // B 모더레이션 대비 — 숨김 질문 제외

    // 정렬: 좋아요순이면 likes_count DESC + 동률은 최신, 최신순이면 created_at DESC
    if (sortMode === "likes") {
      query = query
        .order("likes_count", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    renderQuestions(data);
  } catch (err) {
    console.error("질문 목록 조회 실패:", err);
    listEl.innerHTML =
      '<li class="empty-state">질문을 불러오지 못했어요. 새로고침 해주세요.</li>';
  }
}

// ------------------------------------------------------------
// 목록 렌더링
// ------------------------------------------------------------
function renderQuestions(questions) {
  const listEl = document.getElementById("questionList");
  const countLabel = document.getElementById("countLabel");

  countLabel.textContent = `받은 질문 (${questions.length})`;

  if (questions.length === 0) {
    listEl.innerHTML =
      '<li class="empty-state">아직 질문이 없어요. 첫 질문을 남겨보세요!</li>';
    return;
  }

  // 각 질문을 카드로 — 사용자 입력은 모두 escapeHtml 처리
  listEl.innerHTML = questions
    .map((q) => {
      const liked = hasLiked(q.id);
      const name = q.author_name ? escapeHtml(q.author_name) : "익명";
      return `
      <li class="question-card">
        <div class="like-col">
          <button
            class="like-btn ${liked ? "liked" : ""}"
            data-id="${q.id}"
            aria-label="좋아요"
            ${liked ? "disabled" : ""}
          >❤</button>
          <span class="like-count">${q.likes_count}</span>
        </div>
        <div class="body">
          <div class="content">${escapeHtml(q.content)}</div>
          <div class="meta">${name} · ${timeAgo(q.created_at)}</div>
        </div>
      </li>`;
    })
    .join("");

  // 좋아요 버튼 이벤트 바인딩 (이벤트 위임 대신 개별 바인딩 — 단순)
  listEl.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleLikeClick(btn.dataset.id));
  });
}

// ------------------------------------------------------------
// 좋아요 클릭 처리 → 성공 시 목록 새로고침(재정렬)
// ------------------------------------------------------------
async function handleLikeClick(questionId) {
  const ok = await addLike(questionId); // likes.js
  if (ok) await loadQuestions();
}

// ------------------------------------------------------------
// 정렬 토글
// ------------------------------------------------------------
function toggleSort() {
  sortMode = sortMode === "likes" ? "recent" : "likes";
  const btn = document.getElementById("sortToggle");
  btn.textContent = sortMode === "likes" ? "좋아요순 ▼" : "최신순 ▼";
  loadQuestions();
}

// ------------------------------------------------------------
// 앱 부트스트랩 — DOM 준비 후 세션 로드 → 첫 목록 조회 → 이벤트 연결
// ------------------------------------------------------------
async function initApp() {
  try {
    await loadDefaultSession(); // supabase-client.js

    document.getElementById("askForm").addEventListener("submit", submitQuestion);
    document.getElementById("sortToggle").addEventListener("click", toggleSort);

    await loadQuestions();
  } catch (err) {
    // loadDefaultSession 내부에서 이미 안내 alert를 띄움
    console.error("앱 초기화 실패:", err);
  }
}

// defer 스크립트라 DOM은 이미 준비됨 — 안전하게 DOMContentLoaded로 감쌈
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
