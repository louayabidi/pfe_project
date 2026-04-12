-- ============================================================
-- ÉTAPE 1 — Migration SQL : Advanced Rules
-- À exécuter AVANT de démarrer le backend
-- mysql -u user -p database < V002__create_advanced_rules.sql
-- ============================================================

-- Table principale : rules avancées
CREATE TABLE IF NOT EXISTS rules_advanced (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    app_id              BIGINT          NOT NULL,
    name                VARCHAR(200)    NOT NULL,
    description         VARCHAR(500),
    trigger_event       VARCHAR(200)    NOT NULL,
    condition_logic     VARCHAR(10)     NOT NULL DEFAULT 'AND',  -- 'AND' ou 'OR'
    conditions          JSON,           -- Liste de AdvancedCondition
    actions             JSON,           -- Liste de AdvancedAction
    priority            INT             NOT NULL DEFAULT 0,
    cooldown_minutes    INT,
    max_awards_per_user INT,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    trigger_count       BIGINT          NOT NULL DEFAULT 0,
    last_triggered_at   DATETIME,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_adv_rule_app FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,

    INDEX idx_adv_rule_app       (app_id),
    INDEX idx_adv_rule_event     (app_id, trigger_event),
    INDEX idx_adv_rule_active    (app_id, is_active),
    INDEX idx_adv_rule_priority  (app_id, is_active, priority DESC)
);

-- Table historique : combien de fois une règle a été accordée à un utilisateur
-- Utilisée pour cooldown et maxAwardsPerUser
CREATE TABLE IF NOT EXISTS rule_trigger_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_id         BIGINT          NOT NULL,
    app_id          BIGINT          NOT NULL,
    user_id         VARCHAR(255)    NOT NULL,
    triggered_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rth_rule FOREIGN KEY (rule_id) REFERENCES rules_advanced(id) ON DELETE CASCADE,
    CONSTRAINT fk_rth_app  FOREIGN KEY (app_id)  REFERENCES apps(id)           ON DELETE CASCADE,

    INDEX idx_rth_rule_user    (rule_id, user_id),
    INDEX idx_rth_user_app     (user_id, app_id),
    INDEX idx_rth_triggered_at (triggered_at)
);

-- Données de test (optionnel - supprimer en production)
-- INSERT INTO rules_advanced (app_id, name, description, trigger_event, condition_logic, conditions, actions, priority)
-- VALUES (
--     1,
--     'Login 3 fois en 7 jours',
--     'Récompense pour utilisateurs réguliers',
--     'login',
--     'AND',
--     '[{"type":"EVENT_COUNT","field":"login","operator":"GREATER_THAN_OR_EQUAL","value":3},{"type":"TIME_PERIOD","field":"window","operator":"WITHIN","value":"7_DAYS"}]',
--     '[{"type":"POINTS","value":100,"description":"+100 points fidélité"}]',
--     10
-- );