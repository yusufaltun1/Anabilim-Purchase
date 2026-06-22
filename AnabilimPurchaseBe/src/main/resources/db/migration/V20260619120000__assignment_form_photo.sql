ALTER TABLE assignments
    ADD COLUMN IF NOT EXISTS form_photo_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS form_photo_content_type VARCHAR(128),
    ADD COLUMN IF NOT EXISTS form_photo_stored_path VARCHAR(512);
