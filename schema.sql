-- D1 schema template — idempotent.
-- Replace with your domain tables. Apply with:
--   wrangler d1 execute <db-name> --file=./schema.sql --remote
--   wrangler d1 execute <db-name> --file=./schema.sql --local

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_email);
