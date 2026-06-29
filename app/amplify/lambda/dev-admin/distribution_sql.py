"""
Templated generator for the demographic distribution tables.

Renders DROP + CTAS statements equivalent to
data-preparation/create_demographic_distribution_tables.sql, parameterised by
city / scenario / year. The .sql file remains the human-readable source of
truth; this module reproduces it so the /dev dashboard can rebuild the derived
tables for an arbitrary combination after raw ingest.

Raw input tables (created by the Glue job):
  - person : {city}_{scenario}_pp_exposure_{year}
  - trips  : {city}_{scenario}_trips
Output tables (queried by the dashboard):
  - {city}_{scenario}_distribution_{overall|gender|age|occupation}

NOTE: the per-mode minute columns are named pct_<mode>_mins_week_p<N> /
avg_<mode>_mins_week to match the source .sql exactly. (The MelbourneModeShift
component currently reads avg_<mode>_mins_day_p<N> for its minutes box-plot — a
pre-existing naming mismatch in the repo, unaffected by this rebuild and worth
addressing separately.)
"""

from typing import Dict, List, Tuple

GROUPS = ['overall', 'gender', 'age', 'occupation']

# Per-city demographic encodings. Defaults follow the Melbourne synthetic
# population codes; other cities can be added without changing the SQL shape.
CITY_CONFIG: Dict[str, Dict[str, str]] = {
    'melbourne': {
        'gender': (
            "CASE WHEN p.gender = 1 THEN 'Male' "
            "WHEN p.gender = 2 THEN 'Female' "
            "ELSE CAST(p.gender AS VARCHAR) END"
        ),
        'age': (
            "CASE WHEN p.age >= 0 AND p.age <= 14 THEN '0–14' "
            "WHEN p.age >= 15 AND p.age <= 17 THEN '15–17' "
            "WHEN p.age >= 18 AND p.age <= 44 THEN '18–44' "
            "WHEN p.age >= 45 AND p.age <= 64 THEN '45–64' "
            "WHEN p.age >= 65 THEN '65+' "
            "ELSE CAST(p.age AS VARCHAR) END"
        ),
        'occupation': (
            "CASE WHEN p.occupation = 0 THEN 'Toddler' "
            "WHEN p.occupation = 1 THEN 'Employed' "
            "WHEN p.occupation = 2 THEN 'Unemployed' "
            "WHEN p.occupation = 3 THEN 'Student' "
            "WHEN p.occupation = 4 THEN 'Retiree' "
            "ELSE CAST(p.occupation AS VARCHAR) END"
        ),
    },
}

_MODES = ['walk', 'bike', 'car', 'pt']
_PERCENTILES = [(1, '0.01'), (5, '0.05'), (25, '0.25'),
                (50, '0.50'), (75, '0.75'), (95, '0.95'), (99, '0.99')]


def _group_expression(city: str, group: str) -> str:
    if group == 'overall':
        return "'Overall'"
    cfg = CITY_CONFIG.get(city, CITY_CONFIG['melbourne'])
    return cfg[group]


def _mode_aggregates() -> str:
    lines: List[str] = []
    for mode in _MODES:
        col = f't.time_{mode}'
        lines.append(
            f"    AVG(CASE WHEN {col} > 0 THEN {col} END) as avg_{mode}_mins_week"
        )
        for pct, frac in _PERCENTILES:
            lines.append(
                f"    APPROX_PERCENTILE(CASE WHEN {col} > 0 THEN {col} END, {frac}) "
                f"as pct_{mode}_mins_week_p{pct}"
            )
    return ',\n'.join(lines)


def _create_statement(city: str, scenario: str, year: str, group: str) -> str:
    person_table = f'{city}_{scenario}_pp_exposure_{year}'
    trips_table = f'{city}_{scenario}_trips'
    out_table = f'{city}_{scenario}_distribution_{group}'
    group_expr = _group_expression(city, group)

    return f"""CREATE TABLE {out_table} AS
WITH person_mmet AS (
    SELECT
        {group_expr} as demographic_group,
        p.mmethr_walk + p.mmethr_cycle + p.mmethr_othersport as mmet_total,
        p.id
    FROM {person_table} p
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
    FROM {trips_table}
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
{_mode_aggregates()}
FROM person_mmet p
LEFT JOIN trip_modes t ON p.id = t.id
GROUP BY p.demographic_group"""


def build_statements(city: str, scenario: str, year: str) -> List[Tuple[str, str, str]]:
    """Return a list of (group, drop_sql, create_sql) for the four groupings."""
    statements: List[Tuple[str, str, str]] = []
    for group in GROUPS:
        out_table = f'{city}_{scenario}_distribution_{group}'
        drop_sql = f'DROP TABLE IF EXISTS {out_table}'
        create_sql = _create_statement(city, scenario, year, group)
        statements.append((group, drop_sql, create_sql))
    return statements
