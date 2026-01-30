# Go to AWS Glue Console
# Create a new ETL job
# Use this PySpark script:
import sys
import boto3
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

# More robust argument handling
try:
    args = getResolvedOptions(sys.argv, ['JOB_NAME'])
    job_name = args['JOB_NAME']
except:
    # Fallback if JOB_NAME is not provided
    job_name = 'JIBE-Melbourne-Glue-ETL'
    args = {'JOB_NAME': job_name}

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(job_name, args)

print(f"Starting job: {job_name}")

# Define source to destination mapping
source_mapping = {
    "s3://jibe.model.melbourne/scenOutput_2026/base/microData/": "melbourne_base",
    "s3://jibe.model.melbourne/scenOutput_2026/cycling/microData/": "melbourne_cycling",
    "s3://jibe.model.melbourne/scenOutput_2026/base/2018/microData/": "melbourne_base",
    "s3://jibe.model.melbourne/scenOutput_2026/cycling/2018/microData/": "melbourne_cycling",
}

dest_base_path = "s3://jibevisdatashared-905418182830/parquet/"

# Process each source path
for i, (source_path, subfolder) in enumerate(source_mapping.items()):
    print(f"Processing {i+1}/{len(source_mapping)}: {source_path} -> {subfolder}")
    
    try:
        # Create dynamic frame from CSV files in this path
        datasource = glueContext.create_dynamic_frame.from_options(
            format_options={
                "quoteChar": '"',
                "withHeader": True,
                "separator": ","
            },
            connection_type="s3",
            format="csv",
            connection_options={
                "paths": [source_path],
                "recurse": True
            },
            transformation_ctx=f"datasource_{i}"
        )
        
        if datasource.count() > 0:
            dest_path = f"{dest_base_path}{subfolder}/"
            
            print(f"Writing {datasource.count()} records to {dest_path}")
            
            # Write to Parquet format
            glueContext.write_dynamic_frame.from_options(
                frame=datasource,
                connection_type="s3",
                format="glueparquet",
                connection_options={
                    "path": dest_path,
                    "partitionKeys": []
                },
                format_options={
                    "compression": "snappy"
                },
                transformation_ctx=f"datasink_{i}"
            )
            
            print(f"Successfully processed {source_path} to {dest_path}")
        else:
            print(f"No data found in {source_path}")
            
    except Exception as e:
        print(f"Error processing {source_path}: {str(e)}")
        continue

job.commit()

# After successful ETL, trigger crawler
glue_client = boto3.client('glue')

def trigger_crawler():
    """Trigger the crawler to update Athena tables"""
    try:
        # Check if crawler exists
        crawler_name = "jibe-parquet-crawler"
        
        # Get crawler status
        response = glue_client.get_crawler(Name=crawler_name)
        crawler_state = response['Crawler']['State']
        
        if crawler_state == 'READY':
            # Start the crawler
            glue_client.start_crawler(Name=crawler_name)
            print(f"Started crawler: {crawler_name}")
        else:
            print(f"Crawler {crawler_name} is not ready. Current state: {crawler_state}")
            
    except glue_client.exceptions.EntityNotFoundException:
        print(f"Crawler {crawler_name} not found. Please create it first.")
    except Exception as e:
        print(f"Error triggering crawler: {str(e)}")

# Trigger crawler after successful ETL
print("ETL completed successfully. Triggering crawler to update Athena tables...")
trigger_crawler()

job.commit()