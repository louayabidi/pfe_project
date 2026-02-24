CREATE TABLE IF NOT EXISTS user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seen_at TIMESTAMP,
    UNIQUE(user_id, badge_id)
);


CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);