-- Drop Demographic Distribution Tables
-- Run these statements before recreating the distribution tables with create_demographic_distribution_tables.sql

-- =============================================================================
-- MELBOURNE - BASE SCENARIO
-- =============================================================================
DROP TABLE IF EXISTS melbourne_base_distribution_gender;
DROP TABLE IF EXISTS melbourne_base_distribution_age;
DROP TABLE IF EXISTS melbourne_base_distribution_occupation;

-- =============================================================================
-- MELBOURNE - CYCLING SCENARIO
-- =============================================================================
DROP TABLE IF EXISTS melbourne_cycling_distribution_gender;
DROP TABLE IF EXISTS melbourne_cycling_distribution_age;
DROP TABLE IF EXISTS melbourne_cycling_distribution_occupation;

-- =============================================================================
-- MANCHESTER - BASE SCENARIO
-- =============================================================================
DROP TABLE IF EXISTS manchester_base_distribution_gender;
DROP TABLE IF EXISTS manchester_base_distribution_age;
DROP TABLE IF EXISTS manchester_base_distribution_occupation;

-- =============================================================================
-- MANCHESTER - CYCLING SCENARIO
-- =============================================================================
DROP TABLE IF EXISTS manchester_cycling_distribution_gender;
DROP TABLE IF EXISTS manchester_cycling_distribution_age;
DROP TABLE IF EXISTS manchester_cycling_distribution_occupation;
