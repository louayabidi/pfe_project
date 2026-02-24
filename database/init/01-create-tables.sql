-- database/init/01-create-tables.sql
-- Script d'initialisation pour la plateforme de gamification
-- Point de vue App Owner uniquement

-- 1. Table des propriétaires d'application
CREATE TABLE IF NOT EXISTS app_owners (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des applications
CREATE TABLE IF NOT EXISTS apps (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES app_owners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_key_rotated_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    webhook_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id, name)
);

-- 3. Table des badges
CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    app_id BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    image_public_id VARCHAR(255),
    is_hidden BOOLEAN DEFAULT FALSE,
    max_awards_per_user INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(app_id, name)
);

-- 4. Table des règles
CREATE TABLE IF NOT EXISTS rules (
    id BIGSERIAL PRIMARY KEY,
    app_id BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL,
    conditions JSONB,
    actions JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    cooldown_minutes INTEGER,
    max_awards_per_user INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(app_id, name)
);

-- 5. Table des clés API (historique)
CREATE TABLE IF NOT EXISTS api_keys_history (
    id BIGSERIAL PRIMARY KEY,
    app_id BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    api_key_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- Index pour performance
CREATE INDEX idx_apps_owner_id ON apps(owner_id);
CREATE INDEX idx_apps_api_key ON apps(api_key);
CREATE INDEX idx_badges_app_id ON badges(app_id);
CREATE INDEX idx_rules_app_id ON rules(app_id);
CREATE INDEX idx_rules_trigger_event ON rules(trigger_event);