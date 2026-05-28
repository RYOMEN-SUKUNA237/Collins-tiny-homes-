-- ============================================================
-- COLLINS TINY HOMES — IN-APP SUPPORT MESSAGING MIGRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  subject TEXT NOT NULL DEFAULT 'General support',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'admin', 'system')),
  sender_name TEXT,
  body TEXT NOT NULL,
  read_by_admin BOOLEAN NOT NULL DEFAULT false,
  read_by_visitor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_conversations_session_id ON support_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);
CREATE INDEX IF NOT EXISTS idx_support_conversations_last_message_at ON support_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation_id_created_at ON support_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_support_messages_unread_admin ON support_messages(conversation_id) WHERE sender_type = 'visitor' AND read_by_admin = false;
CREATE INDEX IF NOT EXISTS idx_support_messages_unread_visitor ON support_messages(conversation_id) WHERE sender_type = 'admin' AND read_by_visitor = false;

ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read support conversations" ON support_conversations;
DROP POLICY IF EXISTS "Public insert support conversations" ON support_conversations;
DROP POLICY IF EXISTS "Public update support conversations" ON support_conversations;
DROP POLICY IF EXISTS "Public delete support conversations" ON support_conversations;
DROP POLICY IF EXISTS "Public read support messages" ON support_messages;
DROP POLICY IF EXISTS "Public insert support messages" ON support_messages;
DROP POLICY IF EXISTS "Public update support messages" ON support_messages;
DROP POLICY IF EXISTS "Public delete support messages" ON support_messages;

-- The app routes use the Supabase service-role key server-side. These policies keep
-- the tables compatible with the project's current public-access Supabase pattern.
CREATE POLICY "Public read support conversations" ON support_conversations FOR SELECT USING (true);
CREATE POLICY "Public insert support conversations" ON support_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update support conversations" ON support_conversations FOR UPDATE USING (true);
CREATE POLICY "Public delete support conversations" ON support_conversations FOR DELETE USING (true);
CREATE POLICY "Public read support messages" ON support_messages FOR SELECT USING (true);
CREATE POLICY "Public insert support messages" ON support_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update support messages" ON support_messages FOR UPDATE USING (true);
CREATE POLICY "Public delete support messages" ON support_messages FOR DELETE USING (true);
