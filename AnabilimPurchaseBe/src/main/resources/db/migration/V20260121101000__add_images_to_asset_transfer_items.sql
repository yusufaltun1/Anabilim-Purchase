-- Transfer ve teslim alma aşamalarında resim tutmak için kolonlar
ALTER TABLE asset_transfer_items
    ADD COLUMN IF NOT EXISTS transfer_images_base64 TEXT,
    ADD COLUMN IF NOT EXISTS receive_images_base64 TEXT;

