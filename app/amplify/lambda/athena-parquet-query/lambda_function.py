""" Lambda function to query Athena synthetic population parquet database on S3 """

import json
import os
import boto3

def lambda_handler(event, context):
    """ Lambda function to query Athena synthetic population parquet database on S3 """       
    if 'rawQueryString' in event and event['rawQueryString'] != '':
        query = {u[0]:u[1] for u in [x.split('=') for x in event['rawQueryString'].split('&')]}
    else:
        query = event
        query['var'] = 'mmethr'
        query['group'] = 'gender'
        if 'area' not in query or 'code' not in query:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'area and code are required, but not present in the event data ({event["rawQueryString"]}).'})
            }
    area = query['area'].lower()
    var = query['var'].lower()
    group = query['group'].lower()
    client = boto3.client('athena')
    sql = f"""
    SELECT * FROM {var}_x_{group}_{area};
    """
    response = client.start_query_execution(
        QueryString=sql,
        QueryExecutionContext={'Database': 'jibevisdatabase'},
        ResultConfiguration={'OutputLocation': os.environ['BUCKET']},
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
