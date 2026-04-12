-- V003__multi_trigger_events.sql

-- 1. Remove the old single-event column
ALTER TABLE rules_advanced DROP INDEX idx_adv_rule_event;
ALTER TABLE rules_advanced DROP COLUMN trigger_event;

-- 2. Create the new join table
CREATE TABLE IF NOT EXISTS rule_trigger_events (
    rule_id     BIGINT          NOT NULL,
    event_name  VARCHAR(200)    NOT NULL,

    CONSTRAINT fk_rte_rule FOREIGN KEY (rule_id) REFERENCES rules_advanced(id) ON DELETE CASCADE,
    INDEX idx_rte_rule_id    (rule_id),
    INDEX idx_rte_event_name (event_name)
);