-- Create schools table
CREATE TABLE schools (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    school_code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    principal_name VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    school_type VARCHAR(50),
    student_capacity INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_schools_code ON schools(school_code);
CREATE INDEX idx_schools_city ON schools(city);
CREATE INDEX idx_schools_district ON schools(district);
CREATE INDEX idx_schools_active ON schools(is_active);

-- Add comments
COMMENT ON TABLE schools IS 'Okul bilgilerini tutan tablo';
COMMENT ON COLUMN schools.school_code IS 'Okul kodu (benzersiz)';
COMMENT ON COLUMN schools.principal_name IS 'Okul müdürü adı';
COMMENT ON COLUMN schools.school_type IS 'Okul türü (İlkokul, Ortaokul, Lise vb.)';
COMMENT ON COLUMN schools.student_capacity IS 'Öğrenci kapasitesi'; 