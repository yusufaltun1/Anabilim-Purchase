-- Add product_type column to products table
ALTER TABLE products 
ADD COLUMN product_type VARCHAR(50) NOT NULL DEFAULT 'OTHER';

-- Add comment to explain the column
COMMENT ON COLUMN products.product_type IS 'Ürün tipi: CONSUMABLE, FIXED_ASSET, EQUIPMENT, SERVICE, SOFTWARE, MAINTENANCE, OFFICE_SUPPLIES, IT_HARDWARE, FURNITURE, OTHER';

-- Update existing products to have a more appropriate default type based on category
-- This is optional - you can set specific types based on your existing data
UPDATE products 
SET product_type = CASE 
    WHEN LOWER(category.name) LIKE '%bilgisayar%' OR LOWER(category.name) LIKE '%laptop%' OR LOWER(category.name) LIKE '%pc%' THEN 'IT_HARDWARE'
    WHEN LOWER(category.name) LIKE '%yazılım%' OR LOWER(category.name) LIKE '%software%' THEN 'SOFTWARE'
    WHEN LOWER(category.name) LIKE '%mobilya%' OR LOWER(category.name) LIKE '%masa%' OR LOWER(category.name) LIKE '%sandalye%' THEN 'FURNITURE'
    WHEN LOWER(category.name) LIKE '%ofis%' OR LOWER(category.name) LIKE '%kırtasiye%' THEN 'OFFICE_SUPPLIES'
    WHEN LOWER(category.name) LIKE '%bakım%' OR LOWER(category.name) LIKE '%onarım%' THEN 'MAINTENANCE'
    WHEN LOWER(category.name) LIKE '%hizmet%' OR LOWER(category.name) LIKE '%service%' THEN 'SERVICE'
    ELSE 'OTHER'
END
FROM categories category
WHERE products.category_id = category.id; 