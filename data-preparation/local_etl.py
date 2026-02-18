import boto3
import os
from dotenv import load_dotenv
from pyspark.sql import SparkSession

# Load environment variables from .env file
load_dotenv()

# Configuration
SOURCE_BUCKET = os.getenv('SOURCE_BUCKET')
DEST_BUCKET = os.getenv('DEST_BUCKET')
DATABASE_NAME = os.getenv('DATABASE_NAME')

spark = SparkSession.builder \
    .appName("JIBE Melbourne ETL Local") \
    .config("spark.hadoop.fs.s3a.aws.credentials.provider", "com.amazonaws.auth.DefaultAWSCredentialsProviderChain") \
    .getOrCreate()

source_mapping = {
    f"s3://{SOURCE_BUCKET}melbourne/scenOutput_2026/base/microData/": "melbourne_base",
    f"s3://{SOURCE_BUCKET}melbourne/scenOutput_2026/cycling/microData/": "melbourne_cycling",
    f"s3://{SOURCE_BUCKET}melbourne/scenOutput_2026/base/2018/microData/": "melbourne_base",
    f"s3://{SOURCE_BUCKET}melbourne/scenOutput_2026/cycling/2018/microData/": "melbourne_cycling",
    f"s3://{SOURCE_BUCKET}manchester/1_reference/travel_demand_mito/": "manchester_base",
    f"s3://{SOURCE_BUCKET}manchester/1_reference/03_noise/": "manchester_base",
    f"s3://{SOURCE_BUCKET}manchester/1_reference/04_exposure_and_rr/": "manchester_base",
}

dest_base_path = f"s3://{DEST_BUCKET}/parquet/"
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
                
                # Register table in Glue Data Catalog (for Athena)
                try:
                    glue_client.get_table(DatabaseName=DATABASE_NAME, Name=table_name)
                    glue_client.delete_table(DatabaseName=DATABASE_NAME, Name=table_name)
                except glue_client.exceptions.EntityNotFoundException:
                    pass
                
                columns = [{'Name': field.name, 'Type': field.dataType.simpleString()} for field in df.schema.fields]
                
                glue_client.create_table(
                    DatabaseName=DATABASE_NAME,
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

spark.stop()
