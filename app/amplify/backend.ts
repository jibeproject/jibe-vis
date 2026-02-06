import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
// custom CDK stack
import * as athena from 'aws-cdk-lib/aws-athena';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as iam from 'aws-cdk-lib/aws-iam'

const backend = defineBackend({
  auth,
  data
});

// // rotate API-key as per #48 ; comment out and re-deploy once rotated.
// backend.data.resources.cfnResources.cfnApiKey?.overrideLogicalId(
//   `recoverApiKey${new Date().getTime()}`
// );


const branchName = process.env.AWS_BRANCH || 'sandbox';
const isMainBranch = branchName === 'main';

// Only create resources in main branch
if (isMainBranch) {

  const customResourceStack = backend.createStack('JibeVisCustomResourceStack');

  // set up storage
  const s3_bucket = new s3.Bucket(customResourceStack, 'JibeVisData', {
    bucketName: `jibevisdatashared-${customResourceStack.account}`, // Globally unique
    autoDeleteObjects: false, // Keep data when stack is deleted
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: RemovalPolicy.RETAIN, // Don't delete in production
    versioned: true, // Enable versioning for safety
    cors: [
      {
        allowedOrigins: [
          "https://*.d1swcuo95yq9yf.amplifyapp.com", // All branches
          "https://transporthealthimpacts.org",
          "http://localhost:5173",
          "http://localhost:3000"
        ],
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD, s3.HttpMethods.PUT],
        allowedHeaders: ["range", "if-match", "content-type"],
        exposedHeaders: ["etag"],
        maxAge: 3000
      }
    ]
  });

  new CfnOutput(customResourceStack, 'S3BucketName', {
    value: s3_bucket.bucketName,
    description: 'S3 bucket name',
    exportName: 'S3BucketName',
  })

  // Set up Athena database
  const database = new glue.CfnDatabase(customResourceStack, 'JibeVisDatabase', {
    catalogId: customResourceStack.account,
    databaseInput: {
      name: 'jibevisdatabase'
    }
  });

  new CfnOutput(customResourceStack, 'AthenaDatabaseName', {
    value: database.ref,
    description: 'Athena database name',
    exportName: 'AthenaDatabaseName',
  });

  // Set up Athena workgroup
  const workgroup = new athena.CfnWorkGroup(customResourceStack, 'JibeVisWorkGroup', {
    name: 'JibeVisWorkGroup',
    state: 'ENABLED',
    workGroupConfiguration: {
      resultConfiguration: {
        outputLocation: `s3://${s3_bucket.bucketName}/athena-results/`
      }
    }
  });

  new CfnOutput(customResourceStack, 'AthenaWorkGroupName', {
    value: workgroup.name,
    description: 'Athena workgroup name',
    exportName: 'AthenaWorkGroupName',
  });

    // CORS Response Headers Policy for CloudFront
    const corsResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(customResourceStack, 'SharedCorsPolicy', {
      responseHeadersPolicyName: 'JibeVis-Shared-CORS-Policy',
      comment: 'Shared CORS policy for all JibeVis environments',
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['range', 'if-match', 'cache-control', 'content-type'],
        accessControlAllowMethods: ['GET', 'HEAD', 'OPTIONS'],
        accessControlAllowOrigins: [
          "https://*.d1swcuo95yq9yf.amplifyapp.com",
          "https://transporthealthimpacts.org",
          "http://localhost:5173",
          "http://localhost:3000"
        ],
        accessControlExposeHeaders: ['etag', 'content-length', 'content-range'],
        accessControlMaxAge: Duration.seconds(3600),
        originOverride: true
      },
  });

    // // set up pmtile lambda function
  const protomaps = new lambda.Function(customResourceStack, 'JibeVisProtomaps', {
    runtime: lambda.Runtime.NODEJS_18_X,
    architecture: lambda.Architecture.ARM_64,
    memorySize: 512,
    code: lambda.Code.fromAsset('amplify/lambda/pmtiles'),
    environment: {
      'BUCKET': s3_bucket.bucketName,
      'PMTILES_PATH': 'tiles/{NAME}.pmtiles',
      'PUBLIC_HOSTNAME': 'https://transporthealthimpacts.org/',
    },
    handler: 'index.handler',
    }
  );

  const protomaps_url = protomaps.addFunctionUrl({
    authType: lambda.FunctionUrlAuthType.AWS_IAM,
  })

  s3_bucket.grantRead(protomaps)

  // Set up Athena query lambda function
  const athenaQuery = new lambda.Function(customResourceStack, 'JibeVisAthenaQuery', {
    runtime: lambda.Runtime.PYTHON_3_12,
    architecture: lambda.Architecture.ARM_64,
    memorySize: 512,
    timeout: Duration.seconds(300),
    code: lambda.Code.fromAsset('amplify/lambda/athena-parquet-query'),
    environment: {
      'BUCKET': `s3://${s3_bucket.bucketName}/athena-results/`,
      'DEST_BUCKET': s3_bucket.bucketName,
      'DATABASE': database.ref,
    },
    handler: 'lambda_function.lambda_handler',
  });

  s3_bucket.grantReadWrite(athenaQuery);
  
  // Grant Athena and Glue permissions
  athenaQuery.addToRolePolicy(new iam.PolicyStatement({
    actions: [
      'athena:StartQueryExecution',
      'athena:GetQueryExecution',
      'athena:GetQueryResults',
      'glue:GetTable',
      'glue:GetDatabase',
      'glue:CreateTable',
    ],
    resources: ['*'],
  }));

  // Add Function URL for direct invocation
  const athenaQueryUrl = athenaQuery.addFunctionUrl({
    authType: lambda.FunctionUrlAuthType.NONE,
    cors: {
      allowedOrigins: [
        'https://main.d1swcuo95yq9yf.amplifyapp.com',
        'https://transporthealthimpacts.org',
        'http://localhost:5173'
      ],
      allowedMethods: [lambda.HttpMethod.GET],
      allowedHeaders: ['*'],
    },
  });

  new CfnOutput(customResourceStack, 'AthenaQueryFunctionName', {
    value: athenaQuery.functionName,
    description: 'Athena query Lambda function name',
    exportName: 'AthenaQueryFunctionName',
  });

  new CfnOutput(customResourceStack, 'AthenaQueryFunctionUrl', {
    value: athenaQueryUrl.url,
    description: 'Athena query Lambda function URL',
    exportName: 'AthenaQueryFunctionUrl',
  });


  // Create custom cache policy for Lambda queries
  const queryCachePolicy = new cloudfront.CachePolicy(customResourceStack, 'QueryCachePolicy', {
    cachePolicyName: 'JibeVisQueryCachePolicy',
    comment: 'Cache policy for Athena query Lambda',
    defaultTtl: Duration.seconds(300), // 5 minutes
    maxTtl: Duration.seconds(3600), // 1 hour
    minTtl: Duration.seconds(0),
    queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    enableAcceptEncodingGzip: true,
  });

  // Create Lambda Function URL origin
  const athenaQueryOrigin = new origins.HttpOrigin(athenaQueryUrl.url.replace('https://', ''), {
    protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
    originSslProtocols: [cloudfront.OriginSslPolicy.TLS_V1_2],
    readTimeout: Duration.seconds(60), // Increase timeout for long-running queries
    keepaliveTimeout: Duration.seconds(60),
  });

  const distribution = new cloudfront.Distribution(customResourceStack, 'JibeVisCloudFront', {
    defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(s3_bucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: corsResponseHeadersPolicy,
        compress: true
      },
      additionalBehaviors: {
        // Specific behavior for PMTiles files (no compression for binary files)
        '*.pmtiles': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(s3_bucket),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          responseHeadersPolicy: corsResponseHeadersPolicy,
          compress: false // Don't compress binary map files
        },
        // Behavior for Athena query Lambda
        'query/*': {
          origin: athenaQueryOrigin,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: queryCachePolicy,
          responseHeadersPolicy: corsResponseHeadersPolicy,
          compress: true
        }
      },
    httpVersion: cloudfront.HttpVersion.HTTP3,
  })

  new CfnOutput(customResourceStack, 'CloudFrontURL', {
    value: distribution.domainName,
    description: 'CloudFront distribution URL',
    exportName: 'CloudFrontURL',
  })
} 
