import sys
import boto3
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql.functions import lit

args = getResolvedOptions(sys.argv, ['JOB_NAME', 'DATABASE_NAME', 'SOURCE_BUCKET', 'DEST_BUCKET'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

source_bucket = args['SOURCE_BUCKET']
dest_bucket = args['DEST_BUCKET']
database_name = args['DATABASE_NAME']

source_mapping = {
    f"s3://{source_bucket}/scenOutput_2026/base/microData/": "melbourne_base",
    f"s3://{source_bucket}/scenOutput_2026/cycling/microData/": "melbourne_cycling",
    f"s3://{source_bucket}/scenOutput_2026/base/2018/microData/": "melbourne_base",
    f"s3://{source_bucket}/scenOutput_2026/cycling/2018/microData/": "melbourne_cycling",
}

dest_base_path = f"s3://{dest_bucket}/parquet/"
s3_client = boto3.client('s3')
glue_client = boto3.client('glue')

for source_path, prefix in source_mapping.items():
    bucket = source_path.split('/')[2]
    key_prefix = '/'.join(source_path.split('/')[3:]).rstrip('/')
    
    paginator = s3_client.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket, Prefix=key_prefix):
        for obj in page.get('Contents', []):
            if obj['Key'].endswith('.csv'):
                csv_file = f"s3://{bucket}/{obj['Key']}"
                file_name = obj['Key'].split('/')[-1].replace('.csv', '')
                table_name = f"{prefix}_{file_name}"
                
                df = spark.read.csv(csv_file, header=True, inferSchema=True)
                parquet_path = f"{dest_base_path}{prefix}/{file_name}.parquet"
                
                df.write.mode('overwrite').parquet(parquet_path)
                
                # Register table in Glue Data Catalog
                try:
                    glue_client.get_table(DatabaseName=database_name, Name=table_name)
                    glue_client.delete_table(DatabaseName=database_name, Name=table_name)
                except glue_client.exceptions.EntityNotFoundException:
                    pass
                
                columns = [{'Name': field.name, 'Type': field.dataType.simpleString()} for field in df.schema.fields]
                
                glue_client.create_table(
                    DatabaseName=database_name,
                    TableInput={
                        'Name': table_name,
                        'StorageDescriptor': {
                            'Columns': columns,
                            'Location': parquet_path,
                            'InputFormat': 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat',
                            'OutputFormat': 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat',
                            'SerdeInfo': {'SerializationLibrary': 'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe'}
                        },
                        'TableType': 'EXTERNAL_TABLE'
                    }
                )
                
                print(f"Created {table_name} at {parquet_path}")

job.commit()