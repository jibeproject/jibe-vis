"""
Developer-admin Lambda for the JIBE-Vis /dev dashboard.

Lets a signed-in member of the Cognito `developers` group replace/refresh the
scenario data for a city/year/scenario combination without running offline
scripts:

  presign-upload           -> presigned S3 PUT URL for a raw model output file
  list-files               -> objects already staged in S3 for the combination
  list-catalog             -> Glue tables already registered for the combination
  start-ingest             -> trigger the parameterised Glue job (CSV -> parquet + catalog)
  ingest-status            -> poll the Glue job run state
  rebuild-distribution     -> drop + recreate the derived *_distribution_* tables
  query-status             -> poll Athena query execution state(s)
  presign-reference-upload -> presigned PUT for a city reference CSV (e.g. areas.csv)
  list-reference           -> objects staged under the city's reference/ prefix
  start-reference-ingest   -> Glue-ingest reference CSVs as {city}_lookup_* tables
  rebuild-linkage          -> drop + recreate the {var}_x_{group}_{area} tables
                              behind the exposures-and-health map stories
  presign-tiles-upload     -> presigned PUT for a *.pmtiles file under tiles/
  list-tiles               -> *.pmtiles files served via CloudFront

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
import linkage_sql

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
_PMTILES_RE = re.compile(r'^[A-Za-z0-9._-]+\.pmtiles$')

# Reference (non-scenario) data is ingested under this pseudo-scenario token so
# the standard Glue job registers it as {city}_lookup_<file> without clashing
# with real scenario tables.
REFERENCE_SCENARIO_TOKEN = 'lookup'


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


def _reference_prefix(city):
    return f'{SOURCE_PREFIX_ROOT}/{city}/reference/'


def action_presign_reference_upload(p):
    city = _token(p.get('city'), 'city')
    filename = _filename(p.get('filename'))

    bucket = os.environ['SOURCE_BUCKET']
    key = f'{_reference_prefix(city)}{filename}'
    s3 = boto3.client('s3')
    url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': bucket, 'Key': key, 'ContentType': 'text/csv'},
        ExpiresIn=900,
    )
    return _response(200, {'url': url, 'bucket': bucket, 'key': key})


def action_list_reference(p):
    city = _token(p.get('city'), 'city')

    bucket = os.environ['SOURCE_BUCKET']
    prefix = _reference_prefix(city)
    s3 = boto3.client('s3')
    files = []
    paginator = s3.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get('Contents', []):
            files.append({'key': obj['Key'], 'size': obj['Size'],
                          'lastModified': obj['LastModified'].isoformat()})
    return _response(200, {'bucket': bucket, 'prefix': prefix, 'files': files})


def action_start_reference_ingest(p):
    city = _token(p.get('city'), 'city')

    glue = boto3.client('glue')
    run = glue.start_job_run(
        JobName=os.environ['GLUE_JOB_NAME'],
        Arguments={
            '--CITY': city,
            '--YEAR': '0000',  # reference data is not year-specific
            '--SCENARIO': REFERENCE_SCENARIO_TOKEN,
            '--SOURCE_BUCKET': os.environ['SOURCE_BUCKET'],
            '--SOURCE_PREFIX': _reference_prefix(city),
        },
    )
    return _response(200, {'jobRunId': run['JobRunId'],
                           'sourcePrefix': _reference_prefix(city),
                           'tablePrefix': f'{city}_{REFERENCE_SCENARIO_TOKEN}_'})


def action_rebuild_linkage(p):
    city = _token(p.get('city'), 'city')
    year = _year(p.get('year'))

    if city not in linkage_sql.CITY_LINKAGE_CONFIG:
        raise BadRequest(
            f'No linkage configuration for city "{city}". '
            f'Configured: {", ".join(sorted(linkage_sql.CITY_LINKAGE_CONFIG))}. '
            'Add an entry to linkage_sql.CITY_LINKAGE_CONFIG.'
        )

    database = os.environ['DATABASE']
    output = os.environ['ATHENA_OUTPUT']
    athena = boto3.client('athena')

    statements = linkage_sql.build_statements(city, year)

    # Drops are metadata-only; run them all concurrently and wait, then start
    # the CTAS queries asynchronously for the client to poll via query-status.
    _run_batch_and_wait(athena, [drop for _, drop, _ in statements], database, output)
    started = []
    for table, _, create_sql in statements:
        resp = athena.start_query_execution(
            QueryString=create_sql,
            QueryExecutionContext={'Database': database},
            ResultConfiguration={'OutputLocation': output},
        )
        started.append({'group': table, 'queryExecutionId': resp['QueryExecutionId']})

    return _response(200, {'queries': started})


def action_presign_tiles_upload(p):
    filename = (p.get('filename') or '').strip()
    if not _PMTILES_RE.match(filename):
        raise BadRequest('Invalid filename: must be a safe *.pmtiles name')

    bucket = os.environ['DEST_BUCKET']
    key = f'tiles/{filename}'
    s3 = boto3.client('s3')
    url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': bucket, 'Key': key,
                'ContentType': 'application/octet-stream'},
        ExpiresIn=3600,
    )
    return _response(200, {'url': url, 'bucket': bucket, 'key': key,
                           'note': 'Replaced tiles may be served from the '
                                   'CloudFront cache for up to 24 hours.'})


def action_list_tiles(p):
    bucket = os.environ['DEST_BUCKET']
    s3 = boto3.client('s3')
    files = []
    paginator = s3.get_paginator('list_objects_v2')
    # Top-level *.pmtiles (legacy locations) ...
    for page in paginator.paginate(Bucket=bucket, Delimiter='/'):
        for obj in page.get('Contents', []):
            if obj['Key'].endswith('.pmtiles'):
                files.append({'key': obj['Key'], 'size': obj['Size'],
                              'lastModified': obj['LastModified'].isoformat()})
    # ... plus everything under tiles/.
    for page in paginator.paginate(Bucket=bucket, Prefix='tiles/'):
        for obj in page.get('Contents', []):
            if obj['Key'].endswith('.pmtiles'):
                files.append({'key': obj['Key'], 'size': obj['Size'],
                              'lastModified': obj['LastModified'].isoformat()})
    return _response(200, {'bucket': bucket, 'files': files})


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
    _run_batch_and_wait(athena, [sql], database, output, max_wait=max_wait)


def _run_batch_and_wait(athena, sqls, database, output, max_wait=20):
    """Start all statements concurrently and wait for every one to succeed."""
    import time
    pending = {}
    for sql in sqls:
        resp = athena.start_query_execution(
            QueryString=sql,
            QueryExecutionContext={'Database': database},
            ResultConfiguration={'OutputLocation': output},
        )
        pending[resp['QueryExecutionId']] = sql
    elapsed = 0
    while pending and elapsed < max_wait:
        for qid, sql in list(pending.items()):
            state = athena.get_query_execution(QueryExecutionId=qid)['QueryExecution']['Status']['State']
            if state == 'SUCCEEDED':
                del pending[qid]
            elif state in ('FAILED', 'CANCELLED'):
                raise Exception(f'Statement failed ({state}): {sql[:120]}')
        if pending:
            time.sleep(1)
            elapsed += 1
    if pending:
        raise Exception(f'Statement timed out: {list(pending.values())[0][:120]}')


ACTIONS = {
    'presign-upload': action_presign_upload,
    'list-files': action_list_files,
    'list-catalog': action_list_catalog,
    'start-ingest': action_start_ingest,
    'ingest-status': action_ingest_status,
    'rebuild-distribution': action_rebuild_distribution,
    'query-status': action_query_status,
    'presign-reference-upload': action_presign_reference_upload,
    'list-reference': action_list_reference,
    'start-reference-ingest': action_start_reference_ingest,
    'rebuild-linkage': action_rebuild_linkage,
    'presign-tiles-upload': action_presign_tiles_upload,
    'list-tiles': action_list_tiles,
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
