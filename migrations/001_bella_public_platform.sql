CREATE TABLE IF NOT EXISTS bella_ingestion_events (
  event_id text PRIMARY KEY,
  contract_version smallint NOT NULL,
  event_type text NOT NULL,
  key_id text NOT NULL,
  nonce_hash text NOT NULL,
  payload_hash text NOT NULL,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key_id, nonce_hash)
);

CREATE INDEX IF NOT EXISTS bella_ingestion_received_idx
  ON bella_ingestion_events (received_at DESC);

CREATE TABLE IF NOT EXISTS bella_heartbeat_history (
  event_id text PRIMARY KEY REFERENCES bella_ingestion_events(event_id) ON DELETE CASCADE,
  operational_state text NOT NULL CHECK (operational_state IN ('online', 'away', 'offline', 'maintenance')),
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  version text,
  observed_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS bella_heartbeat_observed_idx
  ON bella_heartbeat_history (observed_at DESC);

CREATE TABLE IF NOT EXISTS bella_public_services (
  service_key text PRIMARY KEY,
  label text NOT NULL,
  state text NOT NULL CHECK (state IN ('operational', 'degraded', 'partial_outage', 'offline', 'maintenance', 'unknown')),
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  observed_at timestamptz NOT NULL,
  source_event_id text NOT NULL REFERENCES bella_ingestion_events(event_id)
);

CREATE TABLE IF NOT EXISTS bella_service_history (
  source_event_id text NOT NULL REFERENCES bella_ingestion_events(event_id) ON DELETE CASCADE,
  service_key text NOT NULL,
  state text NOT NULL CHECK (state IN ('operational', 'degraded', 'partial_outage', 'offline', 'maintenance', 'unknown')),
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  observed_at timestamptz NOT NULL,
  PRIMARY KEY (source_event_id, service_key)
);

CREATE INDEX IF NOT EXISTS bella_service_history_observed_idx
  ON bella_service_history (service_key, observed_at DESC);

CREATE TABLE IF NOT EXISTS bella_metric_points (
  source_event_id text NOT NULL REFERENCES bella_ingestion_events(event_id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  value numeric(24, 4) NOT NULL CHECK (value >= 0),
  unit text NOT NULL CHECK (unit IN ('count', 'seconds')),
  mode text NOT NULL CHECK (mode IN ('delta', 'snapshot')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  received_at timestamptz NOT NULL,
  PRIMARY KEY (source_event_id, metric_key),
  CHECK (period_start <= period_end)
);

CREATE INDEX IF NOT EXISTS bella_metric_period_idx
  ON bella_metric_points (metric_key, period_end DESC);

CREATE TABLE IF NOT EXISTS bella_public_activities (
  activity_id text PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  occurred_at timestamptz NOT NULL,
  origin text NOT NULL,
  version text,
  href text,
  source_event_id text NOT NULL REFERENCES bella_ingestion_events(event_id)
);

CREATE INDEX IF NOT EXISTS bella_public_activities_time_idx
  ON bella_public_activities (occurred_at DESC);

CREATE INDEX IF NOT EXISTS bella_public_activities_category_idx
  ON bella_public_activities (category, occurred_at DESC);

CREATE TABLE IF NOT EXISTS bella_public_incidents (
  incident_id text PRIMARY KEY,
  service_key text,
  title text NOT NULL,
  summary text NOT NULL,
  state text NOT NULL CHECK (state IN ('investigating', 'identified', 'monitoring', 'resolved', 'maintenance')),
  impact text NOT NULL CHECK (impact IN ('none', 'minor', 'major', 'critical')),
  started_at timestamptz NOT NULL,
  resolved_at timestamptz,
  updated_at timestamptz NOT NULL,
  source_event_id text NOT NULL REFERENCES bella_ingestion_events(event_id)
);

CREATE INDEX IF NOT EXISTS bella_public_incidents_time_idx
  ON bella_public_incidents (updated_at DESC);

CREATE TABLE IF NOT EXISTS bella_editorial_items (
  item_id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('release', 'roadmap', 'milestone', 'achievement', 'daily_summary', 'moderation_report')),
  status text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  details jsonb NOT NULL DEFAULT '[]'::jsonb,
  version text,
  category text,
  published_at timestamptz,
  target_date timestamptz,
  updated_at timestamptz NOT NULL,
  source_event_id text NOT NULL REFERENCES bella_ingestion_events(event_id)
);

CREATE INDEX IF NOT EXISTS bella_editorial_kind_time_idx
  ON bella_editorial_items (kind, published_at DESC NULLS LAST, target_date DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS bella_public_commands (
  command_name text PRIMARY KEY,
  description text NOT NULL,
  category text NOT NULL,
  examples jsonb NOT NULL DEFAULT '[]'::jsonb,
  permissions text NOT NULL,
  availability text NOT NULL,
  restrictions text,
  updated_at timestamptz NOT NULL,
  source_event_id text NOT NULL REFERENCES bella_ingestion_events(event_id)
);

CREATE INDEX IF NOT EXISTS bella_public_commands_category_idx
  ON bella_public_commands (category, command_name);

CREATE TABLE IF NOT EXISTS bella_community_snapshots (
  source_event_id text PRIMARY KEY REFERENCES bella_ingestion_events(event_id) ON DELETE CASCADE,
  community_key text NOT NULL,
  members bigint CHECK (members IS NULL OR members >= 0),
  interactions bigint CHECK (interactions IS NULL OR interactions >= 0),
  events bigint CHECK (events IS NULL OR events >= 0),
  observed_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS bella_community_observed_idx
  ON bella_community_snapshots (community_key, observed_at DESC);

CREATE TABLE IF NOT EXISTS bella_ingestion_rate_limits (
  key_id text NOT NULL,
  minute_bucket timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count >= 0),
  PRIMARY KEY (key_id, minute_bucket)
);

CREATE INDEX IF NOT EXISTS bella_rate_limits_cleanup_idx
  ON bella_ingestion_rate_limits (minute_bucket);

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
