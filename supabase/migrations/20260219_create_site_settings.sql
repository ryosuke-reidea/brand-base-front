-- LP表示用の統計数値を管理するテーブル
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: 誰でも読めるが、更新は認証ユーザーのみ
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select_all" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings_update_auth" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "site_settings_insert_auth" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "site_settings_delete_auth" ON site_settings
  FOR DELETE USING (auth.role() = 'authenticated');

-- 初期値を挿入（LP上のヒーロー統計）
INSERT INTO site_settings (key, value, label) VALUES
  ('total_sales', '0', '累計売上（円）'),
  ('total_creators', '0', 'クリエイター数'),
  ('total_products', '0', 'プロジェクト数'),
  ('avg_funding_percent', '0', '平均達成率（%）')
ON CONFLICT (key) DO NOTHING;
