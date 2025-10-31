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
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import { aws_apigateway as agw } from "aws-cdk-lib";


const backend = defineBackend({
  auth,
  data
});

// // rotate API-key as per #48 ; comment out and re-deploy once rotated.
// backend.data.resources.cfnResources.cfnApiKey?.overrideLogicalId(
//   `recoverApiKey${new Date().getTime()}`
// );

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
        "https://main.d1swcuo95yq9yf.amplifyapp.com",
        "https://dev.d1swcuo95yq9yf.amplifyapp.com",
        "https://*.d1swcuo95yq9yf.amplifyapp.com",
        "http://localhost:5173",
        "http://localhost:3000"
      ],
      accessControlExposeHeaders: ['etag', 'content-length', 'content-range'],
      accessControlMaxAge: Duration.seconds(3600),
      originOverride: true
    },
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
      }
    },
  httpVersion: cloudfront.HttpVersion.HTTP3,
})

new CfnOutput(customResourceStack, 'CloudFrontURL', {
  value: distribution.domainName,
  description: 'CloudFront distribution URL',
  exportName: 'CloudFrontURL',
})