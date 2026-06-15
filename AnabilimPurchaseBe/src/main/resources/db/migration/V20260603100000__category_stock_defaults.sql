ALTER TABLE categories ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(50) DEFAULT 'PIECE';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS max_quantity INTEGER DEFAULT 100;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'TRY';

UPDATE categories SET unit_of_measure = 'PIECE' WHERE unit_of_measure IS NULL;
UPDATE categories SET min_quantity = 1 WHERE min_quantity IS NULL;
UPDATE categories SET max_quantity = 100 WHERE max_quantity IS NULL;
UPDATE categories SET currency = 'TRY' WHERE currency IS NULL OR TRIM(currency) = '';
