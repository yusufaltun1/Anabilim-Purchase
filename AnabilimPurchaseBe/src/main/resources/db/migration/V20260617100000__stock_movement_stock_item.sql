ALTER TABLE stock_movements
    ADD COLUMN IF NOT EXISTS stock_item_id BIGINT NULL;

ALTER TABLE stock_movements
    DROP CONSTRAINT IF EXISTS fk_stock_movements_stock_item;

ALTER TABLE stock_movements
    ADD CONSTRAINT fk_stock_movements_stock_item
        FOREIGN KEY (stock_item_id) REFERENCES stock_items (id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_stock_item_id ON stock_movements (stock_item_id);

UPDATE stock_movements sm
SET stock_item_id = a.stock_item_id
FROM assignments a
WHERE sm.stock_item_id IS NULL
  AND sm.reference_type = 'ASSIGNMENT'
  AND sm.reference_id = a.id
  AND a.stock_item_id IS NOT NULL;

UPDATE stock_movements sm
SET stock_item_id = si.id
FROM stock_items si
WHERE sm.stock_item_id IS NULL
  AND si.serial_number IS NOT NULL
  AND si.serial_number <> ''
  AND sm.notes LIKE CONCAT('%SN: ', si.serial_number, '%');
