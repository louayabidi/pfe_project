-- database/init/02-add-gamification-tables.sql

-- Table des événements reçus
CREATE TABLE IF NOT EXISTS incoming_events (
    id BIGSERIAL PRIMARY KEY,
    app_id BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Table des soldes de points
CREATE TABLE IF NOT EXISTS points_balance (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    app_id BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, app_id)
);

-- Table des transactions de points
CREATE TABLE IF NOT EXISTS points_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    app_id BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    rule_id BIGINT REFERENCES rules(id),
    balance_after INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX idx_events_app_id ON incoming_events(app_id);
CREATE INDEX idx_events_user_id ON incoming_events(user_id);
CREATE INDEX idx_events_event_name ON incoming_events(event_name);
CREATE INDEX idx_points_user_id ON points_balance(user_id);
CREATE INDEX idx_transactions_user_id ON points_transactions(user_id);