-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    contact TEXT,
    monthly_target INTEGER DEFAULT 0,
    joined_at TEXT DEFAULT (CURRENT_DATE::TEXT),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tithes Table
CREATE TABLE IF NOT EXISTS tithes (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Simplified for easy hand-off)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tithes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read" ON members FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON members FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON members FOR DELETE USING (true);

CREATE POLICY "Allow all read" ON tithes FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON tithes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON tithes FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON tithes FOR DELETE USING (true);
