-- Envanter permission kayıtları (mevcut ortamlarda eksikse)
INSERT INTO permissions (name, display_name, resource, action, is_active, created_at, updated_at)
SELECT 'INVENTORY_READ', 'Envanter Görüntüle', 'INVENTORY', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'INVENTORY_READ');

INSERT INTO permissions (name, display_name, resource, action, is_active, created_at, updated_at)
SELECT 'INVENTORY_UPDATE', 'Envanter Güncelle', 'INVENTORY', 'UPDATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'INVENTORY_UPDATE');
