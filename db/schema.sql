-- Daily market reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  text TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_daily_reports_updated_at ON daily_reports;
CREATE TRIGGER update_daily_reports_updated_at 
  BEFORE UPDATE ON daily_reports 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();