-- Kategori envanter alanları; hiyerarşi kaldırılıyor
UPDATE categories SET parent_id = NULL WHERE parent_id IS NOT NULL;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS product_type VARCHAR(50);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS min_stock_notify_at INTEGER;

UPDATE categories SET product_type = 'CONSUMABLE' WHERE product_type IS NULL;
