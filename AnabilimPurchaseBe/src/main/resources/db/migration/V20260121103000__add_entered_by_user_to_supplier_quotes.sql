-- Satın almacı veya iç kullanıcı tarafından girilen teklifleri kimin girdiğini tutmak için alan
ALTER TABLE supplier_quotes
    ADD COLUMN IF NOT EXISTS entered_by_user_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_supplier_quotes_entered_by_user'
          AND table_name = 'supplier_quotes'
    ) THEN
        ALTER TABLE supplier_quotes
            ADD CONSTRAINT fk_supplier_quotes_entered_by_user
            FOREIGN KEY (entered_by_user_id) REFERENCES users(id);
    END IF;
END $$;

