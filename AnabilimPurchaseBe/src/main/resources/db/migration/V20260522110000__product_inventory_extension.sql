-- Ürün / envanter genişletmesi (nullable kolonlar)

CREATE TABLE IF NOT EXISTS device_models (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200),
    brand VARCHAR(200),
    category_id BIGINT REFERENCES categories(id),
    enable_ip BOOLEAN DEFAULT FALSE,
    enable_mac BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_conditions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200),
    allows_assignment BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS requestable BOOLEAN DEFAULT FALSE;

ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS parent_id BIGINT;

ALTER TABLE products ADD COLUMN IF NOT EXISTS device_model_id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_request_id BIGINT;

ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS asset_label VARCHAR(100);
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS domain_name VARCHAR(255);
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS mac_address VARCHAR(50);
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS device_model_id BIGINT;
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS asset_condition_id BIGINT;
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS default_parent_location_id BIGINT;
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS default_child_location_id BIGINT;
