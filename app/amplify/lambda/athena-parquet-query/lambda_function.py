""" Lambda function to query Athena synthetic population parquet database on S3 """

import json
import os
import boto3

def lambda_handler(event, context):
    """ Lambda function to query Athena synthetic population parquet database on S3 """       
    key = list(event.keys())[0]
    value = event[key]
    client = boto3.client('athena')
    query = f"""
    SELECT '{value}' "key", COUNT(*) FROM synpop_manchester_2021
    WHERE "{key.lower()}.home" = '{value}'
    """
    response = client.start_query_execution(
        QueryString=query,
        QueryExecutionContext={'Database': 'jibevisdatabase'},
        ResultConfiguration={'OutputLocation': os.environ['BUCKET']}
    )
    query_execution_id = response['QueryExecutionId']
    
    # Wait for the query to complete
    while True:
        query_status = client.get_query_execution(QueryExecutionId=query_execution_id)
        query_state = query_status['QueryExecution']['Status']['State']
        if query_state.lower() in ['succeeded', 'failed', 'cancelled']:
            break
    
    if query_state.lower() == 'succeeded':
        result = client.get_query_results(QueryExecutionId=query_execution_id)
        return {
            'statusCode': 200,
            'body': json.dumps(result['ResultSet']['Rows'])
        }
    else:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"{query_status}"})
        }
