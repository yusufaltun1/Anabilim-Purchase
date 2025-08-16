CREATE TABLE supplier_quotes (
    id BIGSERIAL PRIMARY KEY,
    quote_uid VARCHAR(36) NOT NULL UNIQUE,
    request_item_id BIGINT NOT NULL REFERENCES purchase_request_items(id),
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    unit_price DECIMAL(19,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(19,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
    delivery_date TIMESTAMP NOT NULL,
    validity_date TIMESTAMP,
    notes TEXT,
    supplier_reference VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    responded_at TIMESTAMP
); 