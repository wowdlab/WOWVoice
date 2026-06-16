// ============================================================
// likes.js — 좋아요(추천) 기능
// ============================================================
// 좋아요는 익명이지만 "한 브라우저당 한 질문에 1회"만 허용합니다.
// 이를 위해 브라우저마다 고유한 fingerprint(UUID)를 localStorage에
// 만들어 두고, likes 테이블의 UNIQUE(question_id, voter_fingerprint)
// 제약으로 중복을 막습니다.
// ============================================================

const FINGERPRINT_KEY = "wowvote_fingerprint";
const LIKED_KEY = "wowvote_liked"; // 이 브라우저가 좋아요한 질문 id 목록(UI 표시용)

// ------------------------------------------------------------
// 브라우저 고유 fingerprint 가져오기 (없으면 생성)
// ------------------------------------------------------------
function getFingerprint() {
  let fp = localStorage.getItem(FINGERPRINT_KEY);
  if (!fp) {
    // crypto.randomUUID는 모든 최신 브라우저에서 지원
    fp = crypto.randomUUID();
    localStorage.setItem(FINGERPRINT_KEY, fp);
  }
  return fp;
}

// ------------------------------------------------------------
// 이 브라우저가 좋아요한 질문 id 집합 (UI에서 버튼 상태 표시용)
// ------------------------------------------------------------
function getLikedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markLiked(questionId) {
  const set = getLikedSet();
  set.add(questionId);
  localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
}

function hasLiked(questionId) {
  return getLikedSet().has(questionId);
}

// ------------------------------------------------------------
// 좋아요 누르기
// ------------------------------------------------------------
// 1) likes 테이블에 (question_id, fingerprint) INSERT
//    - 이미 눌렀으면 UNIQUE 제약 위반(코드 23505) → 조용히 무시
// 2) increment_likes RPC로 questions.likes_count를 원자적으로 +1
// 반환: true(성공적으로 새로 좋아요) / false(이미 눌렀거나 실패)
async function addLike(questionId) {
  const fingerprint = getFingerprint();

  try {
    const { error } = await sb
      .from("voice_likes")
      .insert({ question_id: questionId, voter_fingerprint: fingerprint });

    if (error) {
      // 23505 = unique_violation → 이미 좋아요한 상태
      if (error.code === "23505") {
        markLiked(questionId); // 로컬 표시도 맞춰둠
        return false;
      }
      throw error;
    }

    // 카운트 원자적 증가 (race condition 방지, schema의 함수 사용)
    const { error: rpcError } = await sb.rpc("increment_likes", {
      q_id: questionId,
    });
    if (rpcError) throw rpcError;

    markLiked(questionId);
    return true;
  } catch (err) {
    console.error("좋아요 처리 실패:", err);
    alert("좋아요 처리 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    return false;
  }
}
