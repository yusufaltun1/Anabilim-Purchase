-- Karşı teklif alanları (ana teklif ayrı; kullanıcı "Teklif Gir/Güncelle" ile ana teklifi günceller)
ALTER TABLE supplier_quotes
    ADD COLUMN IF NOT EXISTS counter_offer_quantity INTEGER,
    ADD COLUMN IF NOT EXISTS counter_offer_unit_price DECIMAL(19,4),
    ADD COLUMN IF NOT EXISTS counter_offer_entered_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS counter_offer_entered_by_user_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_supplier_quotes_counter_offer_entered_by'
          AND table_name = 'supplier_quotes'
    ) THEN
        ALTER TABLE supplier_quotes
            ADD CONSTRAINT fk_supplier_quotes_counter_offer_entered_by
            FOREIGN KEY (counter_offer_entered_by_user_id) REFERENCES users(id);
    END IF;
END $$;
