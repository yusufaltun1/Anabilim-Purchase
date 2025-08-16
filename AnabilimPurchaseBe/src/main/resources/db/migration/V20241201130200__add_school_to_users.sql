-- Add school_id column to users table
ALTER TABLE users 
ADD COLUMN school_id BIGINT;

-- Add foreign key constraint
ALTER TABLE users 
ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id);

-- Add index
CREATE INDEX idx_users_school ON users(school_id);

-- Add comment
COMMENT ON COLUMN users.school_id IS 'Kullanıcının çalıştığı okul ID\'si'; 