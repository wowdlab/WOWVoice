-- ============================================================
-- WOWVote 초기 스키마 (A 시나리오용)
-- ============================================================
-- 사용법: 이 파일 내용을 Supabase 콘솔 > SQL Editor에 통째로
--        붙여넣고 "Run" 한 번 누르면 끝납니다.
--
-- 설계 원칙: A에서는 'default' 세션 하나만 쓰지만,
--          B/C(다중 세션·모더레이션)로 갈 때 마이그레이션이
--          필요 없도록 컬럼·테이블을 미리 다 만들어 둡니다.
-- ============================================================


-- ------------------------------------------------------------
-- 1) sessions — 행사 단위 관리 (A는 'default' 1개만 사용)
-- ------------------------------------------------------------
CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT UNIQUE NOT NULL,         -- 행사 식별 코드 (예: 'default', 'DAEGU0518')
  title      TEXT NOT NULL,                -- 행사 이름
  host_name  TEXT,                         -- 진행자 이름 (선택)
  is_active  BOOLEAN DEFAULT true,         -- false면 질문 받지 않음 (B에서 사용)
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 2) questions — 질문 저장
-- ------------------------------------------------------------
-- is_answered / is_hidden은 A에서는 안 쓰지만(컬럼만 존재),
-- B의 "답변 완료"·"모더레이션"에서 바로 쓰려고 미리 만들어 둡니다.
CREATE TABLE questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,               -- 질문 내용
  author_name TEXT,                        -- 작성자 이름 (NULL이면 화면에 '익명' 표시)
  likes_count INTEGER DEFAULT 0,           -- 좋아요 수 (likes 테이블과 동기화)
  is_answered BOOLEAN DEFAULT false,       -- B에서 사용
  is_hidden   BOOLEAN DEFAULT false,       -- B 모더레이션용
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 조회 성능: 세션별 + 좋아요순 + 최신순 정렬을 한 인덱스로 커버
CREATE INDEX idx_questions_session_likes
  ON questions(session_id, likes_count DESC, created_at DESC);


-- ------------------------------------------------------------
-- 3) likes — 중복 좋아요 방지
-- ------------------------------------------------------------
-- voter_fingerprint: 브라우저 localStorage에 저장한 UUID.
-- (question_id, voter_fingerprint) 조합을 UNIQUE로 묶어서
-- 한 브라우저가 같은 질문에 두 번 좋아요 못 누르게 막습니다.
CREATE TABLE likes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id       UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, voter_fingerprint)
);


-- ------------------------------------------------------------
-- 4) 기본 세션 1개 삽입 (A 시나리오 진입점)
-- ------------------------------------------------------------
INSERT INTO sessions (code, title, host_name)
VALUES ('default', 'WOWVote 기본 세션', 'WOWD.LAB');


-- ------------------------------------------------------------
-- 5) 좋아요 카운트 자동 증가 함수 (원자적 처리)
-- ------------------------------------------------------------
-- 클라이언트가 "현재값 읽고 +1 해서 쓰는" 방식은 동시 좋아요 때
-- 카운트가 틀어질 수 있습니다(race condition). DB 안에서 한 번에
-- 증가시키는 함수를 만들어 클라이언트는 RPC로 호출만 합니다.
CREATE OR REPLACE FUNCTION increment_likes(q_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE questions
  SET likes_count = likes_count + 1
  WHERE id = q_id;
$$;


-- ------------------------------------------------------------
-- 6) RLS (Row Level Security) 활성화
-- ------------------------------------------------------------
-- 실제 운영 서비스이므로 모든 테이블에 RLS를 켜둡니다.
ALTER TABLE sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes     ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- 7) 정책 (A 시나리오 — 단순)
-- ------------------------------------------------------------
-- 누구나 읽기 가능
CREATE POLICY "select_all_sessions"  ON sessions  FOR SELECT USING (true);
CREATE POLICY "select_all_questions" ON questions FOR SELECT USING (true);
CREATE POLICY "select_all_likes"     ON likes     FOR SELECT USING (true);

-- 질문 작성 가능 (익명 청중)
CREATE POLICY "insert_questions" ON questions FOR INSERT WITH CHECK (true);

-- 좋아요 작성 가능 (익명 청중)
CREATE POLICY "insert_likes" ON likes FOR INSERT WITH CHECK (true);

-- 질문 UPDATE 허용 (A에서는 likes_count 증가에만 사용)
-- ⚠️ B에서 호스트 인증 도입 시, 이 정책을 좁혀서
--    is_hidden/is_answered는 호스트만 바꾸도록 분리할 예정.
CREATE POLICY "update_question_likes" ON questions FOR UPDATE USING (true);

-- ============================================================
-- 완료! 확인용 쿼리:
--   SELECT * FROM sessions;                       -- 1행(default) 나오면 OK
--   SELECT * FROM pg_policies WHERE schemaname='public';  -- 정책 6개
-- ============================================================
