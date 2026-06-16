// ============================================================
// admin.js — 관리자 패널 로직
// ============================================================
// 기능: 로그인 검증, 세션 관리, 질문 관리(숨김·답변완료), CSV 다운로드
// 보안: 비밀번호는 config.js의 ADMIN_PASSWORD와 대조 (프론트엔드 인증)
//       B에서 Supabase Auth 기반 인증으로 강화 예정
// ============================================================

let selectedSession = null;
let allQuestions = [];

// ------------------------------------------------------------
// 로그인 검증
// ------------------------------------------------------------
function checkLogin() {
  const password = document.getElementById("passwordInput").value.trim();

  if (!CONFIG.ADMIN_PASSWORD) {
    alert("config.js에 ADMIN_PASSWORD가 설정되지 않았어요.");
    return;
  }
  if (password !== CONFIG.ADMIN_PASSWORD) {
    alert("비밀번호가 틀렸어요.");
    return;
  }

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  loadSessions();
}

function logout() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("passwordInput").value = "";
  selectedSession = null;
  allQuestions = [];
}

// ------------------------------------------------------------
// 세션 목록 불러오기
// ------------------------------------------------------------
async function loadSessions() {
  try {
    const { data, error } = await sb
      .from("voice_sessions")
      .select("id, code, title, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const select = document.getElementById("sessionSelect");
    select.innerHTML =
      '<option value="">-- 세션 선택 --</option>' +
      data
        .map(
          (s) =>
            `<option value="${s.id}" data-code="${escapeHtml(s.code)}">${escapeHtml(s.title)} (${escapeHtml(s.code)})</option>`
        )
        .join("");

    // 세션이 하나뿐이면 자동 선택
    if (data.length === 1) {
      select.value = data[0].id;
      onSessionChange();
    }
  } catch (err) {
    alert("세션 로드 실패: " + err.message);
  }
}

// ------------------------------------------------------------
// 세션 선택 변경 → 해당 세션 질문 로드
// ------------------------------------------------------------
async function onSessionChange() {
  const select = document.getElementById("sessionSelect");
  if (!select.value) return;

  const option = select.options[select.selectedIndex];
  selectedSession = { id: select.value, code: option.dataset.code };

  // 청중 접속 URL 계산
  const base =
    window.location.origin +
    window.location.pathname.replace(/admin\.html$/, "");
  const audienceUrl =
    selectedSession.code !== CONFIG.DEFAULT_SESSION_CODE
      ? `${base}?code=${encodeURIComponent(selectedSession.code)}`
      : base;

  const urlEl = document.getElementById("audienceUrl");
  urlEl.textContent = audienceUrl;
  urlEl.href = audienceUrl;

  document.getElementById("sessionActions").style.display = "block";
  await loadQuestions();
}

// ------------------------------------------------------------
// 질문 목록 불러오기 (숨김 포함 전체)
// ------------------------------------------------------------
async function loadQuestions() {
  const listEl = document.getElementById("adminQuestionList");
  listEl.innerHTML = '<li class="loading">불러오는 중...</li>';

  try {
    const { data, error } = await sb
      .from("voice_questions")
      .select("id, content, author_name, likes_count, is_answered, is_hidden, created_at")
      .eq("session_id", selectedSession.id)
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    allQuestions = data;
    const hiddenCount = data.filter((q) => q.is_hidden).length;
    document.getElementById("questionCountLabel").textContent =
      `전체 ${data.length}개 · 숨김 ${hiddenCount}개`;

    renderAdminQuestions(data);
  } catch (err) {
    listEl.innerHTML = '<li class="empty">질문 로드 실패: ' + err.message + "</li>";
  }
}

// ------------------------------------------------------------
// 질문 카드 렌더링
// ------------------------------------------------------------
function renderAdminQuestions(questions) {
  const listEl = document.getElementById("adminQuestionList");

  if (!questions.length) {
    listEl.innerHTML = '<li class="empty">아직 질문이 없어요.</li>';
    return;
  }

  listEl.innerHTML = questions
    .map(
      (q) => `
    <li class="admin-card ${q.is_hidden ? "hidden-q" : ""}" data-id="${q.id}">
      <div class="admin-card-body">
        <div class="admin-content">${escapeHtml(q.content)}</div>
        <div class="admin-meta">
          <span>${q.author_name ? escapeHtml(q.author_name) : "익명"}</span>
          <span>❤ ${q.likes_count}</span>
          <span>${formatDate(q.created_at)}</span>
          ${q.is_answered ? '<span class="badge badge-answered">답변완료</span>' : ""}
          ${q.is_hidden ? '<span class="badge badge-hidden">숨김</span>' : ""}
        </div>
      </div>
      <div class="admin-card-actions">
        <button
          class="btn-sm ${q.is_answered ? "btn-answered" : ""}"
          onclick="toggleAnswered('${q.id}', ${q.is_answered})"
        >${q.is_answered ? "✓ 답변완료" : "답변 완료로"}</button>
        <button
          class="btn-sm ${q.is_hidden ? "btn-hidden" : ""}"
          onclick="toggleHidden('${q.id}', ${q.is_hidden})"
        >${q.is_hidden ? "🔒 숨김 해제" : "숨기기"}</button>
      </div>
    </li>`
    )
    .join("");
}

// ------------------------------------------------------------
// 답변 완료 토글
// ------------------------------------------------------------
async function toggleAnswered(questionId, current) {
  const { error } = await sb
    .from("voice_questions")
    .update({ is_answered: !current })
    .eq("id", questionId);

  if (error) { alert("업데이트 실패: " + error.message); return; }
  await loadQuestions();
}

// ------------------------------------------------------------
// 숨김 토글
// ------------------------------------------------------------
async function toggleHidden(questionId, current) {
  const { error } = await sb
    .from("voice_questions")
    .update({ is_hidden: !current })
    .eq("id", questionId);

  if (error) { alert("업데이트 실패: " + error.message); return; }
  await loadQuestions();
}

// ------------------------------------------------------------
// 새 세션 만들기
// ------------------------------------------------------------
async function createSession() {
  const code = document.getElementById("newCode").value.trim().toUpperCase();
  const title = document.getElementById("newTitle").value.trim();

  if (!code || !title) { alert("코드와 이름을 모두 입력해주세요."); return; }
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    alert("코드는 영문 대문자·숫자·-·_만 사용하세요.\n예: DAEGU0518, SEOUL_2026");
    return;
  }

  const { error } = await sb
    .from("voice_sessions")
    .insert({ code, title });

  if (error) {
    if (error.code === "23505") alert(`'${code}' 코드는 이미 존재해요.`);
    else alert("세션 생성 실패: " + error.message);
    return;
  }

  document.getElementById("newCode").value = "";
  document.getElementById("newTitle").value = "";
  document.getElementById("createForm").style.display = "none";
  alert(`'${code}' 세션이 만들어졌어요!`);
  await loadSessions();
}

// ------------------------------------------------------------
// CSV 다운로드
// ------------------------------------------------------------
function downloadCSV() {
  if (!allQuestions.length) { alert("다운로드할 질문이 없어요."); return; }

  const header = ["번호", "질문", "작성자", "좋아요", "답변완료", "숨김", "작성시간"];
  const rows = allQuestions.map((q, i) => [
    i + 1,
    `"${(q.content || "").replace(/"/g, '""')}"`,
    q.author_name || "익명",
    q.likes_count,
    q.is_answered ? "Y" : "N",
    q.is_hidden ? "Y" : "N",
    formatDate(q.created_at),
  ]);

  const csv = "﻿" + [header, ...rows].map((r) => r.join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wowvoice_${selectedSession.code}_questions.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ------------------------------------------------------------
// 청중 URL 복사
// ------------------------------------------------------------
function copyUrl() {
  const url = document.getElementById("audienceUrl").textContent;
  navigator.clipboard.writeText(url).then(() => alert("URL이 복사됐어요!"));
}

// ------------------------------------------------------------
// 새 세션 폼 토글
// ------------------------------------------------------------
function toggleCreateForm() {
  const form = document.getElementById("createForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

// ------------------------------------------------------------
// 유틸
// ------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ------------------------------------------------------------
// 초기화
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (!window.WOWVOTE_CONFIG) {
    alert("config.js가 없어요.\nconfig.example.js를 복사해서 ADMIN_PASSWORD를 추가해주세요.");
    return;
  }
  document.getElementById("passwordInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkLogin();
  });
});
