-- Kullanıcı grupları (whiteboard'daki kutular)
CREATE TABLE user_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
    position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Grup–grup bağlantıları (whiteboard'daki oklar)
CREATE TABLE user_group_links (
    id BIGSERIAL PRIMARY KEY,
    source_group_id BIGINT NOT NULL,
    target_group_id BIGINT NOT NULL,
    link_label VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_link_source FOREIGN KEY (source_group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_link_target FOREIGN KEY (target_group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    CONSTRAINT chk_link_different CHECK (source_group_id != target_group_id)
);

-- Kullanıcı–grup üyeliği (N-N)
CREATE TABLE user_user_groups (
    user_id BIGINT NOT NULL,
    user_group_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, user_group_id),
    CONSTRAINT fk_uug_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uug_group FOREIGN KEY (user_group_id) REFERENCES user_groups(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_groups_name ON user_groups(name);
CREATE INDEX idx_user_group_links_source ON user_group_links(source_group_id);
CREATE INDEX idx_user_group_links_target ON user_group_links(target_group_id);
CREATE INDEX idx_user_user_groups_user ON user_user_groups(user_id);
CREATE INDEX idx_user_user_groups_group ON user_user_groups(user_group_id);

COMMENT ON TABLE user_groups IS 'Whiteboard üzerindeki kullanıcı grupları';
COMMENT ON TABLE user_group_links IS 'Gruplar arası bağlantılar';
COMMENT ON TABLE user_user_groups IS 'Kullanıcıların gruplara üyeliği';
