-- Demographic Distribution Tables for JIBE Visualization
-- These tables compute percentile distributions of MMET (Marginal Metabolic Equivalent of Task)
-- and mode share statistics grouped by demographic characteristics
-- Generated from lambda_function.py build_demographic_distribution_query()

-- Note: Column names with dots (e.g., "p.id") must be quoted in queries
-- Gender and occupation are INT types and are cast to VARCHAR for grouping

-- =============================================================================
-- MELBOURNE - BASE SCENARIO
-- =============================================================================

-- Melbourne Base - Overall
CREATE TABLE IF NOT EXISTS melbourne_base_distribution_overall
AS
WITH person_mmet AS (
    SELECT 
        'Overall' as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM melbourne_base_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        "p.id" as id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM melbourne_base_trips
    GROUP BY "p.id"
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Melbourne Base - Grouped by Gender
CREATE TABLE IF NOT EXISTS melbourne_base_distribution_gender
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.gender = 1 THEN 'Male'
            WHEN p.gender = 2 THEN 'Female'
            ELSE CAST(p.gender AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM melbourne_base_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        "p.id" as id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM melbourne_base_trips
    GROUP BY "p.id"
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Melbourne Base - Grouped by Age
CREATE TABLE IF NOT EXISTS melbourne_base_distribution_age
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.age >= 0 AND p.age <= 14 THEN '0–14'
            WHEN p.age >= 15 AND p.age <= 17 THEN '15–17'
            WHEN p.age >= 18 AND p.age <= 44 THEN '18–44'
            WHEN p.age >= 45 AND p.age <= 64 THEN '45–64'
            WHEN p.age >= 65 THEN '65+'
            ELSE CAST(p.age AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM melbourne_base_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        "p.id" as id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM melbourne_base_trips
    GROUP BY "p.id"
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Melbourne Base - Grouped by Occupation
CREATE TABLE IF NOT EXISTS melbourne_base_distribution_occupation
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.occupation = 0 THEN 'Toddler'
            WHEN p.occupation = 1 THEN 'Employed'
            WHEN p.occupation = 2 THEN 'Unemployed'
            WHEN p.occupation = 3 THEN 'Student'
            WHEN p.occupation = 4 THEN 'Retiree'
            ELSE CAST(p.occupation AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM melbourne_base_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        "p.id" as id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM melbourne_base_trips
    GROUP BY "p.id"
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- =============================================================================
-- MELBOURNE - CYCLING SCENARIO
-- =============================================================================

CREATE TABLE IF NOT EXISTS melbourne_cycling_distribution_overall
AS
WITH person_mmet AS (
    SELECT 
        'Overall' as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM melbourne_cycling_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        "p.id" as id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM melbourne_cycling_trips
    GROUP BY "p.id"
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Melbourne Cycling - Grouped by Gender
CREATE TABLE IF NOT EXISTS melbourne_cycling_distribution_gender
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.gender = 1 THEN 'Male'
            WHEN p.gender = 2 THEN 'Female'
            ELSE CAST(p.gender AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM melbourne_cycling_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        "p.id" as id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM melbourne_cycling_trips
    GROUP BY "p.id"
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Melbourne Cycling - Grouped by Age
CREATE TABLE IF NOT EXISTS melbourne_cycling_distribution_age
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.age >= 0 AND p.age <= 14 THEN '0–14'
            WHEN p.age >= 15 AND p.age <= 17 THEN '15–17'
            WHEN p.age >= 18 AND p.age <= 44 THEN '18–44'
            WHEN p.age >= 45 AND p.age <= 64 THEN '45–64'
            WHEN p.age >= 65 THEN '65+'
            ELSE CAST(p.age AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM melbourne_cycling_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        "p.id" as id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM melbourne_cycling_trips
    GROUP BY "p.id"
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Melbourne Cycling - Grouped by Occupation
CREATE TABLE IF NOT EXISTS melbourne_cycling_distribution_occupation
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.occupation = 0 THEN 'Toddler'
            WHEN p.occupation = 1 THEN 'Employed'
            WHEN p.occupation = 2 THEN 'Unemployed'
            WHEN p.occupation = 3 THEN 'Student'
            WHEN p.occupation = 4 THEN 'Retiree'
            ELSE CAST(p.occupation AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM melbourne_cycling_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        "p.id" as id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM melbourne_cycling_trips
    GROUP BY "p.id"
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- =============================================================================
-- MANCHESTER - BASE SCENARIO
-- =============================================================================

-- Manchester Base - Grouped by Gender
CREATE TABLE IF NOT EXISTS manchester_base_distribution_gender
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.gender = 1 THEN 'Male'
            WHEN p.gender = 2 THEN 'Female'
            ELSE CAST(p.gender AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM manchester_base_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM manchester_base_trips
    GROUP BY id
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Manchester Base - Grouped by Age
CREATE TABLE IF NOT EXISTS manchester_base_distribution_age
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.age >= 0 AND p.age <= 14 THEN '0–14'
            WHEN p.age >= 15 AND p.age <= 17 THEN '15–17'
            WHEN p.age >= 18 AND p.age <= 44 THEN '18–44'
            WHEN p.age >= 45 AND p.age <= 64 THEN '45–64'
            WHEN p.age >= 65 THEN '65+'
            ELSE CAST(p.age AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM manchester_base_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM manchester_base_trips
    GROUP BY id
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Manchester Base - Grouped by Occupation
CREATE TABLE IF NOT EXISTS manchester_base_distribution_occupation
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.occupation = 0 THEN 'Toddler'
            WHEN p.occupation = 1 THEN 'Employed'
            WHEN p.occupation = 2 THEN 'Unemployed'
            WHEN p.occupation = 3 THEN 'Student'
            WHEN p.occupation = 4 THEN 'Retiree'
            ELSE CAST(p.occupation AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM manchester_base_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM manchester_base_trips
    GROUP BY id
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- =============================================================================
-- MANCHESTER - CYCLING SCENARIO
-- =============================================================================

-- Manchester Cycling - Grouped by Gender
CREATE TABLE IF NOT EXISTS manchester_cycling_distribution_gender
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.gender = 1 THEN 'Male'
            WHEN p.gender = 2 THEN 'Female'
            ELSE CAST(p.gender AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM manchester_cycling_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM manchester_cycling_trips
    GROUP BY id
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Manchester Cycling - Grouped by Age
CREATE TABLE IF NOT EXISTS manchester_cycling_distribution_age
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.age >= 0 AND p.age <= 14 THEN '0–14'
            WHEN p.age >= 15 AND p.age <= 17 THEN '15–17'
            WHEN p.age >= 18 AND p.age <= 44 THEN '18–44'
            WHEN p.age >= 45 AND p.age <= 64 THEN '45–64'
            WHEN p.age >= 65 THEN '65+'
            ELSE CAST(p.age AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM manchester_cycling_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM manchester_cycling_trips
    GROUP BY id
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- Manchester Cycling - Grouped by Occupation
CREATE TABLE IF NOT EXISTS manchester_cycling_distribution_occupation
AS
WITH person_mmet AS (
    SELECT 
        CASE 
            WHEN p.occupation = 0 THEN 'Toddler'
            WHEN p.occupation = 1 THEN 'Employed'
            WHEN p.occupation = 2 THEN 'Unemployed'
            WHEN p.occupation = 3 THEN 'Student'
            WHEN p.occupation = 4 THEN 'Retiree'
            ELSE CAST(p.occupation AS VARCHAR)
        END as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM manchester_cycling_pp_exposure_2018 p
),
trip_modes AS (
    SELECT 
        id,
        SUM(CASE WHEN mode = 'walk' THEN time_walk ELSE 0 END) as time_walk,
        SUM(CASE WHEN mode IN ('bike', 'bicycle') THEN time_bike ELSE 0 END) as time_bike,
        SUM(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN time_auto ELSE 0 END) as time_car,
        SUM(CASE WHEN mode = 'pt' THEN time_pt ELSE 0 END) as time_pt,
        AVG(CASE WHEN mode = 'walk' THEN 1.0 ELSE 0.0 END) as walk_share,
        AVG(CASE WHEN mode IN ('bike', 'bicycle') THEN 1.0 ELSE 0.0 END) as bike_share,
        AVG(CASE WHEN mode IN ('car', 'autoPassenger', 'autoDriver') THEN 1.0 ELSE 0.0 END) as car_share,
        AVG(CASE WHEN mode = 'pt' THEN 1.0 ELSE 0.0 END) as pt_share
    FROM manchester_cycling_trips
    GROUP BY id
)
SELECT 
    p.demographic_group,
    COUNT(*) as person_count,
    COUNT(CASE WHEN t.time_walk > 0 THEN 1 END) as person_walk_count,
    COUNT(CASE WHEN t.time_bike > 0 THEN 1 END) as person_bike_count,
    COUNT(CASE WHEN t.time_car > 0 THEN 1 END) as person_car_count,
    COUNT(CASE WHEN t.time_pt > 0 THEN 1 END) as person_pt_count,
    AVG(CASE WHEN t.time_walk > 0 THEN t.time_walk END) as avg_walk_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.01) as pct_walk_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.05) as pct_walk_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.25) as pct_walk_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.50) as pct_walk_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.75) as pct_walk_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.95) as pct_walk_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_walk > 0 THEN t.time_walk END, 0.99) as pct_walk_mins_week_p99,
    AVG(CASE WHEN t.time_bike > 0 THEN t.time_bike END) as avg_bike_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.01) as pct_bike_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.05) as pct_bike_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.25) as pct_bike_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.50) as pct_bike_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.75) as pct_bike_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.95) as pct_bike_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_bike > 0 THEN t.time_bike END, 0.99) as pct_bike_mins_week_p99,
    AVG(CASE WHEN t.time_car > 0 THEN t.time_car END) as avg_car_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.01) as pct_car_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.05) as pct_car_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.25) as pct_car_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.50) as pct_car_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.75) as pct_car_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.95) as pct_car_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_car  > 0 THEN t.time_car  END, 0.99) as pct_car_mins_week_p99,
    AVG(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END) as avg_pt_mins_week,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.01) as pct_pt_mins_week_p1,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.05) as pct_pt_mins_week_p5,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.25) as pct_pt_mins_week_p25,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.50) as pct_pt_mins_week_p50,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.75) as pct_pt_mins_week_p75,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.95) as pct_pt_mins_week_p95,
    APPROX_PERCENTILE(CASE WHEN t.time_pt   > 0 THEN t.time_pt   END, 0.99) as pct_pt_mins_week_p99,
    AVG(t.walk_share) as walk_share,
    AVG(t.bike_share) as bike_share,
    AVG(t.car_share) as car_share,
    AVG(t.pt_share) as pt_share
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group;

-- =============================================================================
-- NOTES FOR LAMBDA INTEGRATION
-- =============================================================================
-- The Lambda function dynamically creates tables named: {city}_{scenario}_distribution
-- without the group_by suffix. If you want the Lambda to work with these tables,
-- either:
-- 1. Modify the Lambda to append _{group_by} to the table name
-- 2. Create views that the Lambda expects:
--
-- CREATE OR REPLACE VIEW melbourne_base_distribution AS 
-- SELECT * FROM melbourne_base_distribution_gender;
--
-- 3. Or modify these queries to use a single table with all group_by combinations
