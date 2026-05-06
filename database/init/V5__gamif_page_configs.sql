CREATE TABLE IF NOT EXISTS gamif_page_configs (
    id                  BIGSERIAL PRIMARY KEY,
    publishable_key     VARCHAR(120) NOT NULL UNIQUE,
    app_id              BIGINT       NOT NULL REFERENCES apps(id),
    name                VARCHAR(200) NOT NULL,
 
    -- theme
    background_color    VARCHAR(20),
    primary_color       VARCHAR(20),
    accent_color        VARCHAR(20),
    text_color          VARCHAR(20),
    card_color          VARCHAR(20),
    border_radius       INTEGER      DEFAULT 16,
    dark_mode           BOOLEAN      DEFAULT TRUE,
    animate             BOOLEAN      DEFAULT TRUE,
 
    -- badge settings
    show_locked_badges  BOOLEAN      DEFAULT TRUE,
    badge_columns       INTEGER      DEFAULT 3,
 
    -- leaderboard settings
    leaderboard_size    INTEGER      DEFAULT 10,
    leaderboard_sort_by VARCHAR(20)  DEFAULT 'points',
 
    -- full section layout
    sections_json       TEXT,
 
    created_at          TIMESTAMP    DEFAULT NOW(),
    updated_at          TIMESTAMP    DEFAULT NOW()
);
 
CREATE INDEX idx_gamif_page_app ON gamif_page_configs(app_id);