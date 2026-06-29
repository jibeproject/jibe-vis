"""
Developer-admin Lambda for the JIBE-Vis /dev dashboard.

Lets a signed-in member of the Cognito `developers` group replace/refresh the
scenario data for a city/year/scenario combination without running offline
scripts:

  presign-upload        -> presigned S3 PUT URL for a raw model output file
  list-files            -> objects already staged in S3 for the combination
  list-catalog          -> Glue tables already registered for the combination
  start-ingest          -> trigger the parameterised Glue job (CSV -> parquet + catalog)
  ingest-status         -> poll the Glue job run state
  rebuild-distribution  -> drop + recreate the derived *_distribution_* tables
  query-status          -> poll Athena query execution state(s)

Security:
  - API Gateway validates the Cognito token; this handler additionally requires
    the `developers` group claim on EVERY action.
  - city/year/scenario/group/filename are validated against strict allowlists
    before being used to build S3 keys or SQL/Glue identifiers.
"""

import json
import os
import re

import boto3

import distribution_sql

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

DEVELOPER_GROUP = 'developers'
SOURCE_PREFIX_ROOT = os.environ.get('SOURCE_PREFIX_ROOT', 'source')

_TOKEN_RE = re.compile(r'^[a-z0-9_]+$')
_YEAR_RE = re.compile(r'^\d{4}$')
_FILENAME_RE = re.compile(r'^[A-Za-z0-9._-]+\.csv$')


class BadRequest(Exception):
    pass


class Forbidden(Exception):
    pass


def _response(status, body):
    return {'statusCode': status, 'headers': CORS_HEADERS, 'body': json.dumps(body)}


def _require_developer(event):
    """Reject the request unless the caller is in the developers group."""
    claims = (
        event.get('requestContext', {})
        .get('authorizer', {})
        .get('claims', {})
    )
    groups = claims.get('cognito:groups', '')
    # In the REST API Gateway authorizer context the claim arrives as a string,
    # rendered either bracket-wrapped (e.g. "[developers admins]") or
    # comma/space separated. Normalise both to a token list.
    if isinstance(groups, str):
        group_list = [g for g in re.split(r'[,\s]+', groups.strip('[]')) if g]
    else:
        group_list = list(groups or [])
    if DEVELOPER_GROUP not in group_list:
        raise Forbidden('Caller is not a member of the developers group')


def _token(value, name):
    value = (value or '').strip().lower()
    if not _TOKEN_RE.match(value):
        raise BadRequest(f'Invalid {name}: must match [a-z0-9_]+')
    return value


def _year(value):
    value = (value or '').strip()
    if not _YEAR_RE.match(value):
        raise BadRequest('Invalid year: must be a 4-digit number')
    return value


def _filename(value):
    value = (value or '').strip()
    if not _FILENAME_RE.match(value):
        raise BadRequest('Invalid filename: must be a safe *.csv name')
    return value


def _params(event):
    """Merge query-string params and a JSON body into a single dict."""
    params = dict(event.get('queryStringParameters') or {})
    body = event.get('body')
    if body:
        try:
            parsed = json.loads(body)
            if isinstance(parsed, dict):
                params.update(parsed)
        except (ValueError, TypeError):
            pass
    return params


def _scenario_prefix(city, year, scenario):
    return f'{SOURCE_PREFIX_ROOT}/{city}/scenOutput_{year}/{scenario}/'


# --- actions ---------------------------------------------------------------

def action_presign_upload(p):
    city = _token(p.get('city'), 'city')
    year = _year(p.get('year'))
    scenario = _token(p.get('scenario'), 'scenario')
    filename = _filename(p.get('filename'))

    bucket = os.environ['SOURCE_BUCKET']
    key = f'{_scenario_prefix(city, year, scenario)}microData/{filename}'
    s3 = boto3.client('s3')
    url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': bucket, 'Key': key, 'ContentType': 'text/csv'},
        ExpiresIn=900,
    )
    return _response(200, {'url': url, 'bucket': bucket, 'key': key})


def action_list_files(p):
    city = _token(p.get('city'), 'city')
    year = _year(p.get('year'))
    scenario = _token(p.get('scenario'), 'scenario')

    bucket = os.environ['SOURCE_BUCKET']
    prefix = _scenario_prefix(city, year, scenario)
    s3 = boto3.client('s3')
    files = []
    paginator = s3.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get('Contents', []):
            files.append({'key': obj['Key'], 'size': obj['Size'],
                          'lastModified': obj['LastModified'].isoformat()})
    return _response(200, {'bucket': bucket, 'prefix': prefix, 'files': files})


def action_list_catalog(p):
    city = _token(p.get('city'), 'city')
    scenario = _token(p.get('scenario'), 'scenario')

    database = os.environ['DATABASE']
    glue = boto3.client('glue')
    tables = []
    paginator = glue.get_paginator('get_tables')
    for page in paginator.paginate(DatabaseName=database,
                                   Expression=f'{city}_{scenario}_*'):
        for t in page.get('TableList', []):
            tables.append({
                'name': t['Name'],
                'location': t.get('StorageDescriptor', {}).get('Location'),
                'updateTime': t.get('UpdateTime').isoformat() if t.get('UpdateTime') else None,
            })
    return _response(200, {'database': database, 'tables': tables})


def action_start_ingest(p):
    city = _token(p.get('city'), 'city')
    year = _year(p.get('year'))
    scenario = _token(p.get('scenario'), 'scenario')

    source_bucket = os.environ['SOURCE_BUCKET']
    source_prefix = _scenario_prefix(city, year, scenario)
    glue = boto3.client('glue')
    run = glue.start_job_run(
        JobName=os.environ['GLUE_JOB_NAME'],
        Arguments={
            '--CITY': city,
            '--YEAR': year,
            '--SCENARIO': scenario,
            '--SOURCE_BUCKET': source_bucket,
            '--SOURCE_PREFIX': source_prefix,
        },
    )
    return _response(200, {'jobRunId': run['JobRunId'], 'sourcePrefix': source_prefix})


def action_ingest_status(p):
    job_run_id = p.get('jobRunId')
    if not job_run_id or not re.match(r'^jr_[a-z0-9]+$', job_run_id):
        raise BadRequest('Invalid jobRunId')
    glue = boto3.client('glue')
    run = glue.get_job_run(JobName=os.environ['GLUE_JOB_NAME'], RunId=job_run_id)
    jr = run['JobRun']
    return _response(200, {
        'jobRunId': job_run_id,
        'state': jr['JobRunState'],
        'errorMessage': jr.get('ErrorMessage'),
    })


def action_rebuild_distribution(p):
    city = _token(p.get('city'), 'city')
    year = _year(p.get('year'))
    scenario = _token(p.get('scenario'), 'scenario')

    database = os.environ['DATABASE']
    output = os.environ['ATHENA_OUTPUT']
    athena = boto3.client('athena')

    statements = distribution_sql.build_statements(city, scenario, year)

    # Drops are metadata-only and fast: run them synchronously so the
    # subsequent CTAS targets are clear. The CTAS queries are started
    # asynchronously and polled by the client via query-status.
    started = []
    for group, drop_sql, create_sql in statements:
        _run_and_wait(athena, drop_sql, database, output)
        resp = athena.start_query_execution(
            QueryString=create_sql,
            QueryExecutionContext={'Database': database},
            ResultConfiguration={'OutputLocation': output},
        )
        started.append({'group': group, 'queryExecutionId': resp['QueryExecutionId']})

    return _response(200, {'queries': started})


def action_query_status(p):
    ids = p.get('queryExecutionIds') or p.get('queryExecutionId')
    if isinstance(ids, str):
        ids = [ids]
    if not ids or not all(re.match(r'^[0-9a-f-]+$', qid) for qid in ids):
        raise BadRequest('Invalid queryExecutionIds')

    athena = boto3.client('athena')
    results = []
    for qid in ids:
        info = athena.get_query_execution(QueryExecutionId=qid)['QueryExecution']
        results.append({
            'queryExecutionId': qid,
            'state': info['Status']['State'],
            'reason': info['Status'].get('StateChangeReason'),
        })
    return _response(200, {'queries': results})


def _run_and_wait(athena, sql, database, output, max_wait=20):
    import time
    resp = athena.start_query_execution(
        QueryString=sql,
        QueryExecutionContext={'Database': database},
        ResultConfiguration={'OutputLocation': output},
    )
    qid = resp['QueryExecutionId']
    elapsed = 0
    while elapsed < max_wait:
        state = athena.get_query_execution(QueryExecutionId=qid)['QueryExecution']['Status']['State']
        if state in ('SUCCEEDED', 'FAILED', 'CANCELLED'):
            if state != 'SUCCEEDED':
                raise Exception(f'Statement failed ({state}): {sql[:120]}')
            return
        time.sleep(1)
        elapsed += 1
    raise Exception(f'Statement timed out: {sql[:120]}')


ACTIONS = {
    'presign-upload': action_presign_upload,
    'list-files': action_list_files,
    'list-catalog': action_list_catalog,
    'start-ingest': action_start_ingest,
    'ingest-status': action_ingest_status,
    'rebuild-distribution': action_rebuild_distribution,
    'query-status': action_query_status,
}


def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return _response(200, {})

    try:
        _require_developer(event)
        params = _params(event)
        action = params.get('action')
        handler = ACTIONS.get(action)
        if not handler:
            raise BadRequest(f'Unknown action: {action}')
        return handler(params)
    except Forbidden as e:
        return _response(403, {'error': str(e)})
    except BadRequest as e:
        return _response(400, {'error': str(e)})
    except Exception as e:  # noqa: BLE001
        import traceback
        print(traceback.format_exc())
        return _response(500, {'error': str(e), 'type': type(e).__name__})
