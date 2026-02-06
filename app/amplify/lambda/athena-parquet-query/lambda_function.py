""" Lambda function to query Athena synthetic population parquet database on S3 """

import json
import os
import boto3

def parse_query(event):
    """Extract query parameters from event"""
    if 'rawQueryString' in event and event['rawQueryString'] != '':
        return {u[0]:u[1] for u in [x.split('=') for x in event['rawQueryString'].split('&')]}
    return event

def build_area_query(query):
    """Build SQL for area-based queries"""
    area = query['area'].lower()
    var = query['var'].lower()
    group = query['group'].lower()
    
    if 'where' in query and 'kind' in query:
        kind = query['kind'].lower()
        whereid = query['whereid']
        wherevalue = query['wherevalue']
        return f"SELECT * FROM {kind} WHERE {whereid} = '{wherevalue}';"
    
    return f"SELECT * FROM {var}_x_{group}_{area};"

def build_demographic_summary_query(query):
    """Build SQL for demographic summary queries with scenario comparison"""
    city = query.get('city', 'melbourne')
    scenario = query.get('scenario', 'base')
    group_by = query.get('group_by', 'gender')
    dest_bucket = os.environ['DEST_BUCKET']
    
    # Create joined table if not exists (runs once)
    table_name = f"{city}_{scenario}_summary"
    create_sql = f"""
    CREATE TABLE IF NOT EXISTS {table_name}
    WITH (format='PARQUET', external_location='s3://{dest_bucket}/summary/{city}/{scenario}/')
    AS
    SELECT 
        p.id,
        p.age,
        p.gender,
        p.occupation,
        p.mmethr_walk,
        p.mmethr_cycle,
        p.mmethr_othersport,
        p.exposure_normalised_pm25,
        p.exposure_normalised_no2,
        COUNT(t.id) as trip_count,
        AVG(t.totaltraveltime_sec) / 60.0 / 7.0 as avg_daily_travel_min,
        SUM(CASE WHEN t.mode = 'walk' THEN 1 ELSE 0 END) as walk_trips,
        SUM(CASE WHEN t.mode = 'bike' THEN 1 ELSE 0 END) as bike_trips,
        SUM(CASE WHEN t.mode = 'car' THEN 1 ELSE 0 END) as car_trips,
        SUM(t.distance_walk) as total_distance_walk,
        SUM(t.distance_bike) as total_distance_bike,
        SUM(t.distance_auto) as total_distance_auto
    FROM {city}_{scenario}_pp_exposure_2018 p
    LEFT JOIN {city}_{scenario}_trips t ON p.id = t.id
    GROUP BY p.id, p.age, p.gender, p.occupation, p.mmethr_walk, p.mmethr_cycle, 
             p.mmethr_othersport, p.exposure_normalised_pm25, p.exposure_normalised_no2;
    """
    
    # Query aggregated by demographic group
    query_sql = f"""
    SELECT 
        {group_by},
        COUNT(*) as person_count,
        AVG(avg_daily_travel_min) as avg_travel_time,
        AVG(mmethr_walk + mmethr_cycle + mmethr_othersport) as avg_mmet_total,
        AVG(mmethr_walk) as avg_mmet_walk,
        AVG(mmethr_cycle) as avg_mmet_cycle,
        AVG(exposure_normalised_pm25) as avg_pm25,
        AVG(exposure_normalised_no2) as avg_no2,
        SUM(walk_trips) * 1.0 / NULLIF(SUM(trip_count), 0) as walk_mode_share,
        SUM(bike_trips) * 1.0 / NULLIF(SUM(trip_count), 0) as bike_mode_share,
        SUM(car_trips) * 1.0 / NULLIF(SUM(trip_count), 0) as car_mode_share
    FROM {table_name}
    GROUP BY {group_by}
    ORDER BY {group_by};
    """
    
    return create_sql, query_sql

def execute_query(client, sql, database='jibevisdatabase'):
    """Execute Athena query and return results"""
    response = client.start_query_execution(
        QueryString=sql,
        QueryExecutionContext={'Database': database},
        ResultConfiguration={'OutputLocation': os.environ['BUCKET']},
    )
    query_execution_id = response['QueryExecutionId']
    
    while True:
        query_status = client.get_query_execution(QueryExecutionId=query_execution_id)
        query_state = query_status['QueryExecution']['Status']['State']
        if query_state.lower() in ['succeeded', 'failed', 'cancelled']:
            break
    
    if query_state.lower() == 'succeeded':
        return client.get_query_results(QueryExecutionId=query_execution_id)
    else:
        raise Exception(f"Query failed: {query_status}")

def lambda_handler(event, context):
    """Main handler routing to appropriate query builder"""
    query = parse_query(event)
    client = boto3.client('athena')
    
    try:
        topic = query.get('topic', 'summary')
        
        if topic == 'demographic_summary':
            # Demographic summary queries with scenario comparison
            create_sql, query_sql = build_demographic_summary_query(query)
            try:
                execute_query(client, create_sql)
            except Exception:
                pass  # Table might already exist
            result = execute_query(client, query_sql)
            
        else:
            # Area-based queries
            if 'area' not in query:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'area parameter required for area-based queries'})
                }
            sql = build_area_query(query)
            result = execute_query(client, sql)
        
        return {
            'statusCode': 200,
            'body': json.dumps(result['ResultSet']['Rows'])
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
