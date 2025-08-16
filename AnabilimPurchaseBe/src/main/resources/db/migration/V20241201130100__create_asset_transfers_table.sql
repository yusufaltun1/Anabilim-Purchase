-- Create asset_transfers table
CREATE TABLE asset_transfers (
    id BIGSERIAL PRIMARY KEY,
    transfer_code VARCHAR(50) UNIQUE NOT NULL,
    source_warehouse_id BIGINT NOT NULL,
    target_school_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    transfer_date TIMESTAMP,
    actual_transfer_date TIMESTAMP,
    notes TEXT,
    requested_by_user_id BIGINT,
    approved_by_user_id BIGINT,
    delivered_by_user_id BIGINT,
    received_by_user_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_asset_transfers_source_warehouse FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_asset_transfers_target_school FOREIGN KEY (target_school_id) REFERENCES schools(id),
    CONSTRAINT fk_asset_transfers_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_asset_transfers_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_asset_transfers_delivered_by FOREIGN KEY (delivered_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_asset_transfers_received_by FOREIGN KEY (received_by_user_id) REFERENCES users(id)
);

-- Create asset_transfer_items table
CREATE TABLE asset_transfer_items (
    id BIGSERIAL PRIMARY KEY,
    asset_transfer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    requested_quantity INTEGER NOT NULL,
    transferred_quantity INTEGER,
    notes TEXT,
    serial_numbers TEXT,
    condition_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_asset_transfer_items_transfer FOREIGN KEY (asset_transfer_id) REFERENCES asset_transfers(id) ON DELETE CASCADE,
    CONSTRAINT fk_asset_transfer_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Add indexes
CREATE INDEX idx_asset_transfers_code ON asset_transfers(transfer_code);
CREATE INDEX idx_asset_transfers_status ON asset_transfers(status);
CREATE INDEX idx_asset_transfers_warehouse ON asset_transfers(source_warehouse_id);
CREATE INDEX idx_asset_transfers_school ON asset_transfers(target_school_id);
CREATE INDEX idx_asset_transfers_date ON asset_transfers(transfer_date);
CREATE INDEX idx_asset_transfer_items_transfer ON asset_transfer_items(asset_transfer_id);
CREATE INDEX idx_asset_transfer_items_product ON asset_transfer_items(product_id);

-- Add comments
COMMENT ON TABLE asset_transfers IS 'Depodan okula eşya transferlerini tutan tablo';
COMMENT ON COLUMN asset_transfers.transfer_code IS 'Transfer kodu (benzersiz)';
COMMENT ON COLUMN asset_transfers.status IS 'Transfer durumu: PENDING, APPROVED, PREPARING, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, REJECTED, PARTIALLY_COMPLETED';
COMMENT ON COLUMN asset_transfers.transfer_date IS 'Planlanan transfer tarihi';
COMMENT ON COLUMN asset_transfers.actual_transfer_date IS 'Gerçekleşen transfer tarihi';

COMMENT ON TABLE asset_transfer_items IS 'Transfer edilen eşya kalemlerini tutan tablo';
COMMENT ON COLUMN asset_transfer_items.requested_quantity IS 'İstenen miktar';
COMMENT ON COLUMN asset_transfer_items.transferred_quantity IS 'Gerçek transfer edilen miktar';
COMMENT ON COLUMN asset_transfer_items.serial_numbers IS 'Seri numaraları (demirbaş için)';
COMMENT ON COLUMN asset_transfer_items.condition_notes IS 'Eşyanın durumu hakkında notlar'; 