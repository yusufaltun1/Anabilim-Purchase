-- Hedef depo ve self_managed alanlarını ekle
ALTER TABLE asset_transfers
    ADD COLUMN IF NOT EXISTS target_warehouse_id BIGINT,
    ADD COLUMN IF NOT EXISTS self_managed BOOLEAN NOT NULL DEFAULT FALSE;

-- Hedef depo foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_asset_transfers_target_warehouse'
          AND table_name = 'asset_transfers'
    ) THEN
        ALTER TABLE asset_transfers
            ADD CONSTRAINT fk_asset_transfers_target_warehouse
            FOREIGN KEY (target_warehouse_id) REFERENCES warehouses(id);
    END IF;
END $$;

-- Hedef depo index
CREATE INDEX IF NOT EXISTS idx_asset_transfers_target_warehouse
    ON asset_transfers(target_warehouse_id);

-- Eski target_school_id kolonunu opsiyonel hale getir (yeni kayıtlarda boş bırakılabilir)
ALTER TABLE asset_transfers
    ALTER COLUMN target_school_id DROP NOT NULL;

