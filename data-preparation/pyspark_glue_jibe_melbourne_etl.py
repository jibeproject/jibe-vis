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

# Process each source individually to create separate table folders
for i, (source_path, dest_folder) in enumerate(source_mapping.items()):
    print(f"Processing {i+1}/{len(source_mapping)}: {source_path} -> {dest_folder}")
    
    try:
        # Create unique transformation context for job bookmarks
        source_hash = hashlib.md5(source_path.encode()).hexdigest()[:8]
        transformation_ctx = f"{dest_folder}_source_{source_hash}"
        
        # Create dynamic frame
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
            transformation_ctx=transformation_ctx
        )
        
        if datasource.count() > 0:
            # Add metadata columns
            df = datasource.toDF()
            df_with_metadata = df.withColumn("source_path", lit(source_path)) \
                                .withColumn("etl_timestamp", lit(spark.sql("SELECT current_timestamp()").collect()[0][0]))
            
            enhanced_frame = DynamicFrame.fromDF(df_with_metadata, glueContext, f"enhanced_{transformation_ctx}")
            
            # Create destination path - this will be the TABLE NAME
            dest_path = f"{dest_base_path}{dest_folder}/"
            
            print(f"Writing {enhanced_frame.count()} records to {dest_path}")
            
            # Write to Parquet format - IMPORTANT: Use proper write options
            glueContext.write_dynamic_frame.from_options(
                frame=enhanced_frame,
                connection_type="s3",
                format="glueparquet",
                connection_options={
                    "path": dest_path,
                    "partitionKeys": []  # No partitioning for now
                },
                format_options={
                    "compression": "snappy",
                    "writeHeader": False  # Parquet doesn't need headers
                },
                transformation_ctx=f"sink_{transformation_ctx}"
            )
            
            print(f"Successfully processed {source_path} to table folder: {dest_folder}")
        else:
            print(f"No data found in {source_path}")
            
    except Exception as e:
        print(f"Error processing {source_path}: {str(e)}")
        continue

job.commit()