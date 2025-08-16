ALTER TABLE purchase_request_items
    DROP COLUMN IF EXISTS estimated_unit_price,
    DROP COLUMN IF EXISTS estimated_total_price,
    DROP COLUMN IF EXISTS final_unit_price,
    DROP COLUMN IF EXISTS final_total_price; 