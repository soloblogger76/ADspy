CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER REFERENCES teams(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ads_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER REFERENCES teams(id),
  fb_ad_id TEXT NOT NULL,
  page_name TEXT,
  page_id TEXT,
  ad_creative_body TEXT,
  ad_creative_link_title TEXT,
  ad_creative_link_caption TEXT,
  ad_snapshot_url TEXT,
  ad_creation_time TEXT,
  ad_delivery_start_time TEXT,
  ad_delivery_stop_time TEXT,
  ad_reached_countries TEXT,
  publisher_platforms TEXT,
  niche TEXT,
  domain TEXT,
  funnel_type TEXT,
  platform_type TEXT,
  ad_format TEXT,
  winning_score INTEGER,
  winning_label TEXT,
  age_category TEXT,
  days_running INTEGER,
  est_daily_spend_min REAL,
  est_daily_spend_max REAL,
  est_revenue_min REAL,
  est_revenue_max REAL,
  confidence TEXT,
  search_query TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER REFERENCES teams(id),
  added_by INTEGER REFERENCES users(id),
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  niche TEXT,
  notes TEXT,
  last_checked DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competitor_ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor_id INTEGER REFERENCES competitors(id),
  fb_ad_id TEXT NOT NULL,
  ad_data_json TEXT NOT NULL,
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_new INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER REFERENCES teams(id),
  created_by INTEGER REFERENCES users(id),
  alert_type TEXT NOT NULL,
  keyword TEXT,
  country TEXT,
  niche TEXT,
  email_to TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  last_triggered DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS swipe_file (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER REFERENCES teams(id),
  user_id INTEGER REFERENCES users(id),
  fb_ad_id TEXT NOT NULL,
  ad_data_json TEXT NOT NULL,
  collection_name TEXT DEFAULT 'My Swipe File',
  notes TEXT,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER REFERENCES teams(id),
  fb_ad_id TEXT NOT NULL,
  analysis_json TEXT,
  generated_copy_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
