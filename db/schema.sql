
-- Generic log events --
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'log',
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Page statistics table
CREATE TABLE IF NOT EXISTS page_stats (
  path TEXT PRIMARY KEY,
  page_views INTEGER DEFAULT 0,
  page_likes INTEGER DEFAULT 0,
  comments JSONB NOT NULL DEFAULT '[]',
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily WallStreetBets Comments ---
CREATE TABLE IF NOT EXISTS daily_wsb_comments (
  id TEXT PRIMARY KEY,
  market_date DATE NOT NULL,
  author TEXT NOT NULL DEFAULT 'anonymous',
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  flair TEXT,
  body TEXT NOT NULL,
  parent_id TEXT REFERENCES daily_wsb_comments(id) ON DELETE CASCADE,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily market reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id SERIAL PRIMARY KEY,
  market_date DATE NOT NULL,
  summary TEXT NOT NULL,
  initial TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--- Indexing ---
CREATE INDEX IF NOT EXISTS idx_page_stats_page_views ON page_stats(page_views);
CREATE INDEX IF NOT EXISTS idx_page_stats_updated_at ON page_stats(updated_at);
CREATE INDEX IF NOT EXISTS idx_daily_reports_market_date_created ON daily_reports(market_date, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wsb_comments_parent_id ON daily_wsb_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_wsb_comments_timestamp ON daily_wsb_comments(timestamp);
CREATE INDEX IF NOT EXISTS idx_wsb_comments_market_date ON daily_wsb_comments(market_date);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);

--- Triggers ---
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

---  Setup Triggers ---
DROP TRIGGER IF EXISTS update_daily_reports_updated_at ON daily_reports;
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_stats_updated_at ON page_stats;
CREATE TRIGGER update_page_stats_updated_at BEFORE UPDATE ON page_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
