import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
// custom CDK stack
import * as athena from 'aws-cdk-lib/aws-athena';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import { Names, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib'
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

const environment = process.env.AWS_BRANCH || 'sandbox';
const uniqueId = Names.uniqueId(customResourceStack);
const shortId = uniqueId.slice(-8); 

// Add this to see what we're actually getting
const appId = 'd1swcuo95yq9yf';
const projectName = 'JibeVis'+shortId;

const amplifyDomain = `https://${environment === 'sandbox' ? 'main' : environment}.${appId}.amplifyapp.com`;


// set up storage
const s3_bucket = new s3.Bucket(customResourceStack, 'JibeVisData', {
  autoDeleteObjects: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.DESTROY,
  cors: [
      {
          allowedOrigins: [amplifyDomain, "http://localhost:5173"],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedHeaders: ["range","if-match"],
          exposedHeaders: ["etag"],
          maxAge: 3000
      }
  ]
})

// Secure CORS policy for PMTiles
const secureResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(customResourceStack, 'SecureCorsPolicy', {
  responseHeadersPolicyName: `${projectName}-secure-cors`,
  comment: 'Secure CORS policy for PMTiles access',
  corsBehavior: {
    accessControlAllowCredentials: false,
    accessControlAllowHeaders: [
      'range',
      'if-match',
      'cache-control',
      'content-type'
    ],
    accessControlAllowMethods: ['GET', 'HEAD'],
    accessControlAllowOrigins: [
      `https://${environment}.${appId}.amplifyapp.com`,
      ...(process.env.NODE_ENV === 'development' ? [
        'http://localhost:5173',
        'http://localhost:3000'
      ] : [])
    ],
    accessControlExposeHeaders: [
      'etag',
      'content-length',
      'content-range'
    ],
    accessControlMaxAge: Duration.seconds(3600),
    originOverride: true
  },
  securityHeadersBehavior: {
    contentTypeOptions: { override: true },
    frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
    referrerPolicy: {
      referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
      override: true
    },
    strictTransportSecurity: {
      accessControlMaxAge: Duration.seconds(31536000),
      includeSubdomains: true,
      preload: true,
      override: true
    }
  }
});

new CfnOutput(customResourceStack, 'S3Bucket', {
  value: s3_bucket.bucketName,
  description: 'S3 bucket',
  exportName: `${projectName}-S3BucketName`
})

// Set up Athena database
const database = new glue.CfnDatabase(customResourceStack, 'JibeVisDatabase', {
  catalogId: customResourceStack.account,
  databaseInput: {
    name: `${projectName}database`.toLowerCase()
 }
});

new CfnOutput(customResourceStack, 'AthenaDatabase', {
  value: database.ref,
  description: 'Athena database',
  exportName: `${projectName}-AthenaDatabase`
});

// Set up Athena workgroup
const workgroup = new athena.CfnWorkGroup(customResourceStack, 'JibeVisWorkGroup', {
  name: `${projectName}-workgroup`,
  state: 'ENABLED',
  workGroupConfiguration: {
    resultConfiguration: {
      outputLocation: `s3://${s3_bucket.bucketName}/athena-results/`
    }
  }
});

new CfnOutput(customResourceStack, 'AthenaWorkGroup', {
  value: workgroup.name,
  description: 'Athena workgroup',
  exportName: `${projectName}-AthenaWorkGroup`
});


const distribution = new cloudfront.Distribution(customResourceStack, 'JibeVisCloudFront', {
  defaultBehavior: {
    origin: origins.S3BucketOrigin.withOriginAccessControl(s3_bucket),
    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
    cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    responseHeadersPolicy: secureResponseHeadersPolicy, 
    compress: true
  },
  httpVersion: cloudfront.HttpVersion.HTTP3,
});


new CfnOutput(customResourceStack, 'CloudFrontURL', {
  value: distribution.domainName,
  description: 'CloudFront distribution URL',
  exportName: `${projectName}-CloudFrontURL`
})
