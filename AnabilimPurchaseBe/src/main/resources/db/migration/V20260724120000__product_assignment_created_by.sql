ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
