import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
// custom CDK stack
import * as cdk from 'aws-cdk-lib';
import * as athena from 'aws-cdk-lib/aws-athena';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
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
const userPool = backend.auth.resources.userPool;

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

  // ---------------------------------------------------------------------------
  // Parameterised Glue ETL job (driven by the /dev developer dashboard)
  // ---------------------------------------------------------------------------
  // Deploy the PySpark script to the shared bucket so the Glue job can load it.
  new s3deploy.BucketDeployment(customResourceStack, 'JibeVisGlueScript', {
    sources: [s3deploy.Source.asset('amplify/glue')],
    destinationBucket: s3_bucket,
    destinationKeyPrefix: 'glue-scripts',
    prune: false,
  });

  // IAM role assumed by the Glue job.
  const glueJobRole = new iam.Role(customResourceStack, 'JibeVisGlueJobRole', {
    assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
    ],
  });
  // Read source CSVs + read/write parquet, scripts and temp dir on the shared bucket.
  s3_bucket.grantReadWrite(glueJobRole);
  // Catalogue CRUD so the job can (re)register tables for the city/scenario.
  glueJobRole.addToPolicy(new iam.PolicyStatement({
    actions: [
      'glue:GetDatabase',
      'glue:GetTable',
      'glue:CreateTable',
      'glue:DeleteTable',
      'glue:UpdateTable',
    ],
    resources: ['*'],
  }));

  const etlJob = new glue.CfnJob(customResourceStack, 'JibeVisEtlJob', {
    name: 'JibeVisEtlJob',
    role: glueJobRole.roleArn,
    glueVersion: '4.0',
    command: {
      name: 'glueetl',
      pythonVersion: '3',
      scriptLocation: `s3://${s3_bucket.bucketName}/glue-scripts/jibe_etl.py`,
    },
    defaultArguments: {
      '--job-language': 'python',
      '--enable-glue-datacatalog': 'true',
      '--TempDir': `s3://${s3_bucket.bucketName}/glue-temp/`,
      // City/year/scenario/source are provided at run time by the dev-admin Lambda.
      '--DEST_BUCKET': s3_bucket.bucketName,
      '--DATABASE_NAME': database.ref,
    },
    numberOfWorkers: 4,
    workerType: 'G.1X',
    timeout: 60,
    executionProperty: { maxConcurrentRuns: 3 },
  });

  new CfnOutput(customResourceStack, 'EtlJobName', {
    value: etlJob.name!,
    description: 'Glue ETL job name',
    exportName: 'EtlJobName',
  });

    // Create API Gateway REST API
    const api = new apigateway.RestApi(customResourceStack, 'JibeVisApi', {
      restApiName: 'Jibe Vis API',
      description: 'API for Jibe Vis Athena queries',
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'https://main.d1swcuo95yq9yf.amplifyapp.com',
          'https://transporthealthimpacts.org',
          'http://localhost:5173'
        ],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowCredentials: true,
      },
    });

    // Create Cognito User Pool Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(customResourceStack, 'JibeVisAuthorizer', {
      cognitoUserPools: [userPool],
      identitySource: 'method.request.header.Authorization',
      authorizerName: 'JibeVisAuthorizer',
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

  // Create Lambda integration with proper permissions
  const lambdaIntegration = new apigateway.LambdaIntegration(athenaQuery, {
    proxy: true,
    allowTestInvoke: true,
  });

  // Create API resource and method
  const athenaResource = api.root.addResource('athena-query');
  athenaResource.addMethod('GET', lambdaIntegration, {
    authorizer: authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
  });

  athenaQuery.addPermission('ApiGatewayInvoke', {
    principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    action: 'lambda:InvokeFunction',
    sourceArn: api.arnForExecuteApi('*', '/*'),
  });

  s3_bucket.grantReadWrite(athenaQuery);
  
  // Grant Athena and Glue permissions
  athenaQuery.addToRolePolicy(new iam.PolicyStatement({
    actions: [
      'athena:StartQueryExecution',
      'athena:GetQueryExecution',
      'athena:GetQueryResults',
      'glue:GetDatabase',
      'glue:GetTable',
      'glue:GetPartitions',
    ],
    resources: ['*'],
  }));

  new CfnOutput(customResourceStack, 'AthenaQueryFunctionName', {
    value: athenaQuery.functionName,
    description: 'Athena query Lambda function name',
    exportName: 'AthenaQueryFunctionName',
  });

  // ---------------------------------------------------------------------------
  // Developer-admin Lambda + /dev API (gated to the Cognito `developers` group)
  // ---------------------------------------------------------------------------
  const devAdmin = new lambda.Function(customResourceStack, 'JibeVisDevAdmin', {
    runtime: lambda.Runtime.PYTHON_3_12,
    architecture: lambda.Architecture.ARM_64,
    memorySize: 512,
    timeout: Duration.seconds(300),
    code: lambda.Code.fromAsset('amplify/lambda/dev-admin'),
    environment: {
      // Shared bucket doubles as the upload/source area (under source/) and the
      // parquet/athena-results destination.
      'SOURCE_BUCKET': s3_bucket.bucketName,
      'DEST_BUCKET': s3_bucket.bucketName,
      'DATABASE': database.ref,
      'GLUE_JOB_NAME': etlJob.name!,
      'ATHENA_OUTPUT': `s3://${s3_bucket.bucketName}/athena-results/`,
      'SOURCE_PREFIX_ROOT': 'source',
    },
    handler: 'lambda_function.lambda_handler',
  });

  // Presigned uploads, file listing, parquet output + athena results.
  s3_bucket.grantReadWrite(devAdmin);

  // Drive the Glue job and read the catalogue.
  devAdmin.addToRolePolicy(new iam.PolicyStatement({
    actions: [
      'glue:StartJobRun',
      'glue:GetJobRun',
      'glue:GetJobRuns',
      'glue:GetTables',
      'glue:GetTable',
      'glue:GetDatabase',
      'glue:CreateTable',
      'glue:DeleteTable',
      'glue:UpdateTable',
      'glue:GetPartitions',
    ],
    resources: ['*'],
  }));

  // Rebuild the derived distribution tables via Athena CTAS.
  devAdmin.addToRolePolicy(new iam.PolicyStatement({
    actions: [
      'athena:StartQueryExecution',
      'athena:GetQueryExecution',
      'athena:GetQueryResults',
      'athena:StopQueryExecution',
    ],
    resources: ['*'],
  }));

  const devIntegration = new apigateway.LambdaIntegration(devAdmin, {
    proxy: true,
    allowTestInvoke: true,
  });

  const devResource = api.root.addResource('dev');
  for (const method of ['GET', 'POST']) {
    devResource.addMethod(method, devIntegration, {
      authorizer: authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }

  devAdmin.addPermission('DevApiGatewayInvoke', {
    principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    action: 'lambda:InvokeFunction',
    sourceArn: api.arnForExecuteApi('*', '/*'),
  });

  new CfnOutput(customResourceStack, 'DevAdminFunctionName', {
    value: devAdmin.functionName,
    description: 'Developer-admin Lambda function name',
    exportName: 'DevAdminFunctionName',
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
      },
    httpVersion: cloudfront.HttpVersion.HTTP3,
  })

  athenaQuery.addPermission('CloudFrontInvoke', {
    principal: new iam.ServicePrincipal('cloudfront.amazonaws.com'),
    action: 'lambda:InvokeFunction',
    sourceArn: distribution.distributionArn, 
  });

  
  const authenticatedRole = backend.auth.resources.authenticatedUserIamRole;
  athenaQuery.addPermission('AmplifyAuthenticatedAccess', {
    principal: authenticatedRole,
    action: 'lambda:InvokeFunction',
  });

  new CfnOutput(customResourceStack, 'CloudFrontURL', {
    value: distribution.domainName,
    description: 'CloudFront distribution URL',
    exportName: 'CloudFrontURL',
  })

  // Add custom outputs to amplify_outputs.json
  backend.addOutput({
    custom: {
      cloudFrontDomain: distribution.domainName,
    }
  });
  
backend.addOutput({
  custom: {
    apiGatewayUrl: api.url,
    apiGatewayId: api.restApiId,
  },
});
} 