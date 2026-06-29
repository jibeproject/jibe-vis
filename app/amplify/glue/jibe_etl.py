"""
Parameterised Glue/PySpark ETL for JIBE-Vis scenario data.

Generalised from data-preparation/pyspark_glue_jibe_melbourne_etl.py: instead of
a hard-coded source_mapping, the city / year / scenario / source prefix are
passed in as job arguments so the developer dashboard (/dev) can trigger a run
for any combination.

For every *.csv found under SOURCE_PREFIX it:
  - reads the CSV (header + inferred schema),
  - writes parquet to  s3://<DEST_BUCKET>/parquet/<city>_<scenario>/<file>.parquet,
  - (re)registers a Glue catalogue table  <city>_<scenario>_<file>.

The pp_exposure file is expected to carry the year in its name
(e.g. pp_exposure_2018.csv -> table melbourne_base_pp_exposure_2018), matching
what the distribution CTAS templates expect.

Job arguments (all required):
  --JOB_NAME        (supplied by Glue)
  --CITY            e.g. melbourne
  --YEAR            e.g. 2018
  --SCENARIO        e.g. base | cycling
  --SOURCE_BUCKET   bucket holding the raw model output CSVs (name only)
  --SOURCE_PREFIX   key prefix under SOURCE_BUCKET to scan for *.csv
  --DEST_BUCKET     bucket for parquet output / catalogue locations (name only)
  --DATABASE_NAME   Glue/Athena database to register tables in
"""

import re
import sys

import boto3
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext

args = getResolvedOptions(
    sys.argv,
    [
        'JOB_NAME',
        'CITY',
        'YEAR',
        'SCENARIO',
        'SOURCE_BUCKET',
        'SOURCE_PREFIX',
        'DEST_BUCKET',
        'DATABASE_NAME',
    ],
)

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)


def sanitise(token: str) -> str:
    """Lower-case and restrict to a safe identifier token (defence in depth;
    the dev-admin Lambda validates these before the job is ever started)."""
    token = token.strip().lower()
    if not re.fullmatch(r'[a-z0-9_]+', token):
        raise ValueError(f'Unsafe identifier token: {token!r}')
    return token


city = sanitise(args['CITY'])
scenario = sanitise(args['SCENARIO'])
year = args['YEAR'].strip()
if not re.fullmatch(r'\d{4}', year):
    raise ValueError(f'Unsafe year: {year!r}')

source_bucket = args['SOURCE_BUCKET'].replace('s3://', '').strip('/')
source_prefix = args['SOURCE_PREFIX'].strip('/')
dest_bucket = args['DEST_BUCKET'].replace('s3://', '').strip('/')
database_name = args['DATABASE_NAME']

prefix = f'{city}_{scenario}'
dest_base_path = f's3://{dest_bucket}/parquet/'

s3_client = boto3.client('s3')
glue_client = boto3.client('glue')

paginator = s3_client.get_paginator('list_objects_v2')
processed = 0

for page in paginator.paginate(Bucket=source_bucket, Prefix=source_prefix):
    for obj in page.get('Contents', []):
        if not obj['Key'].endswith('.csv'):
            continue

        csv_file = f"s3://{source_bucket}/{obj['Key']}"
        file_name = sanitise(obj['Key'].split('/')[-1].replace('.csv', ''))
        table_name = f'{prefix}_{file_name}'

        df = spark.read.csv(csv_file, header=True, inferSchema=True)
        parquet_path = f'{dest_base_path}{prefix}/{file_name}.parquet'

        df.write.mode('overwrite').parquet(parquet_path)

        # Re-register the table in the Glue Data Catalog
        try:
            glue_client.get_table(DatabaseName=database_name, Name=table_name)
            glue_client.delete_table(DatabaseName=database_name, Name=table_name)
        except glue_client.exceptions.EntityNotFoundException:
            pass

        columns = [
            {'Name': field.name, 'Type': field.dataType.simpleString()}
            for field in df.schema.fields
        ]

        glue_client.create_table(
            DatabaseName=database_name,
            TableInput={
                'Name': table_name,
                'StorageDescriptor': {
                    'Columns': columns,
                    'Location': parquet_path,
                    'InputFormat': 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat',
                    'OutputFormat': 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat',
                    'SerdeInfo': {
                        'SerializationLibrary': 'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe'
                    },
                },
                'TableType': 'EXTERNAL_TABLE',
            },
        )

        processed += 1
        print(f'Created {table_name} at {parquet_path}')

print(f'Processed {processed} CSV file(s) for {prefix} (year {year}).')
job.commit()
