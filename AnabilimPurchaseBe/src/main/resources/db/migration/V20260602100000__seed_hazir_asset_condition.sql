INSERT INTO asset_conditions (name, allows_assignment, is_active, created_at, updated_at)
SELECT 'Hazır', TRUE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM asset_conditions WHERE LOWER(TRIM(name)) = 'hazır'
);
