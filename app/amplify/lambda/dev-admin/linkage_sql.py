"""
Templated generator for the area-linkage tables behind the
"Transport exposures and health" map stories.

The map popup (graphs.tsx -> athena-parquet-query Lambda build_area_query)
queries tables named

    {var}_x_{group}_{area}      e.g. pm25_x_gender_sa2_name_2016

with one row per area x group level x scenario, plus a '___' row aggregating
the whole region (rendered as "Greater region" in the UI). The area column is
named "{area}.home" and {area} is the story layer's lowercased linkage-code,
which is how a query is routed to the right city without a city parameter.

Everything city-specific lives in CITY_LINKAGE_CONFIG: adding a city means
adding a config entry (plus ingesting its microdata and its existing model
zoneSystem.csv via the /dev dashboard), not writing new SQL.

Inputs assumed in the Glue catalogue:
  {city}_{token}_pp_exposure_{year}  person microdata (with a home `zone`
                                     column), one per scenario token
  {city}_lookup_zonesystem           the JIBE model's own zoneSystem.csv
                                     (input/zoneSystem.csv), ingested once via
                                     the dashboard's reference-ingest action.
                                     It already maps each zone to higher area
                                     identifiers (Melbourne: SA1_MAIN16,
                                     SA2_NAME_2016; Manchester: lsoa/msoa/lad),
                                     so no bespoke lookup file is needed.
"""

from typing import Dict, List, Tuple

CITY_LINKAGE_CONFIG: Dict[str, dict] = {
    'melbourne': {
        # story scenario label -> ingested table token ({city}_{token}_...)
        'scenarios': {'reference': 'base', 'cycling': 'cycling'},
        # lowercased story linkage-codes; each must be (a) a column in the
        # zoneSystem lookup table and (b) a property on the map tiles layer
        'areas': ['sa1_main16', 'sa2_name_2016'],
        # pp_exposure home-zone column, and the zoneSystem column it joins to
        # (Melbourne pp zone is the 7-digit SA1 code)
        'person_zone_column': 'zone',
        'lookup_zone_column': 'sa1_7dig16',
        # raw person columns carried into the aggregation CTE
        'person_columns': [
            'gender', 'occupation',
            'exposure_normalised_pm25', 'exposure_normalised_no2',
            'mmethr_walk', 'mmethr_cycle', 'mmethr_othersport',
        ],
        # integer code -> display label for demographic groupings
        'demographics': {
            'gender': {1: 'Male', 2: 'Female'},
            'occupation': {0: 'Toddler', 1: 'Employed', 2: 'Unemployed',
                           3: 'Student', 4: 'Retiree'},
        },
        # variable -> groups to build tables for, and output column -> person-level expression
        'variables': {
            'pm25': {
                'groups': ['gender', 'occupation'],
                'columns': {'exposure_normalised_pm25': 'exposure_normalised_pm25'},
            },
            'no2': {
                'groups': ['gender', 'occupation'],
                'columns': {'exposure_normalised_no2': 'exposure_normalised_no2'},
            },
            'mmethr': {
                'groups': ['scenario', 'gender', 'occupation'],
                'columns': {
                    'mmethr_walk': 'mmethr_walk',
                    'mmethr_cycle': 'mmethr_cycle',
                    'mmethr_othersport': 'mmethr_othersport',
                    'mmethr_total': 'mmethr_walk + mmethr_cycle + mmethr_othersport',
                },
            },
        },
    },
}


def lookup_table_name(city: str) -> str:
    # zoneSystem.csv ingested under the reference prefix -> {city}_lookup_zonesystem
    return f'{city}_lookup_zonesystem'


def _case_expression(column: str, labels: Dict[int, str]) -> str:
    whens = ' '.join(
        f"WHEN {column} = {code} THEN '{label}'" for code, label in labels.items()
    )
    return f'CASE {whens} ELSE CAST({column} AS VARCHAR) END'


def _persons_cte(city: str, cfg: dict, year: str) -> str:
    zone = cfg['person_zone_column']
    cols = ', '.join(f'p.{c}' for c in cfg['person_columns'])
    selects = []
    for label, token in cfg['scenarios'].items():
        selects.append(
            f"    SELECT '{label}' AS scenario, {cols}, p.{zone} AS home_zone\n"
            f'    FROM {city}_{token}_pp_exposure_{year} p'
        )
    return '\n  UNION ALL\n'.join(selects)


def _select_statement(city: str, cfg: dict, year: str,
                      var: str, group: str, area: str) -> str:
    aggregates = ',\n'.join(
        f'        AVG({expr}) AS {name}'
        for name, expr in cfg['variables'][var]['columns'].items()
    )
    if group == 'scenario':
        # scenario doubles as the grouping column; no separate demographic column
        group_select = ''
        group_by = 'GROUP BY 1, 2'
    else:
        group_expr = _case_expression(group, cfg['demographics'][group])
        group_select = f'        {group_expr} AS {group},\n'
        group_by = 'GROUP BY 1, 2, 3'

    def block(area_select: str) -> str:
        return (
            f'    SELECT\n'
            f'        {area_select} AS "{area}.home",\n'
            f'{group_select}'
            f'        scenario,\n'
            f'{aggregates}\n'
            f'    FROM located\n'
            f'    {group_by}'
        )

    overall_region = "'___'"
    return (
        f'WITH persons AS (\n{_persons_cte(city, cfg, year)}\n'
        f'),\n'
        f'located AS (\n'
        # area values cast to VARCHAR so numeric codes (e.g. SA1_MAIN16) compare
        # cleanly against string tile properties in the frontend
        f'    SELECT s.*, CAST(l.{area} AS VARCHAR) AS area_value\n'
        f'    FROM persons s\n'
        f'    JOIN {lookup_table_name(city)} l\n'
        f'      ON CAST(s.home_zone AS VARCHAR) = CAST(l.{cfg["lookup_zone_column"]} AS VARCHAR)\n'
        f')\n'
        f'{block("area_value")}\n'
        f'  UNION ALL\n'
        f'{block(overall_region)}'
    )


def build_statements(city: str, year: str) -> List[Tuple[str, str, str]]:
    """Return (table_name, drop_sql, create_sql) for every var x group x area
    combination configured for the city. Raises KeyError for unknown cities."""
    cfg = CITY_LINKAGE_CONFIG[city]
    statements: List[Tuple[str, str, str]] = []
    for var, var_cfg in cfg['variables'].items():
        for group in var_cfg['groups']:
            for area in cfg['areas']:
                table = f'{var}_x_{group}_{area}'
                drop_sql = f'DROP TABLE IF EXISTS {table}'
                create_sql = (
                    f'CREATE TABLE {table} AS\n'
                    f'{_select_statement(city, cfg, year, var, group, area)}'
                )
                statements.append((table, drop_sql, create_sql))
    return statements
