import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
// custom CDK stack
import * as athena from 'aws-cdk-lib/aws-athena';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import { Stack, CfnOutput, RemovalPolicy } from 'aws-cdk-lib'
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
const stackName = Stack.of(customResourceStack).stackName;
const databaseName = `amplify_${stackName.replace(/[^a-zA-Z0-9]/g, '')}_jibevisdatabase`
  .toLowerCase()
  .substring(0, 255); // Ensure it's not too long

// set up storage
const s3_bucket = new s3.Bucket(customResourceStack, 'JibeVisData', {
  autoDeleteObjects: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.DESTROY,
  cors: [
      {
          allowedOrigins: ["https://main.d1swcuo95yq9yf.amplifyapp.com"],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedHeaders: ["range","if-match"],
          exposedHeaders: ["etag"],
          maxAge: 3000
      }
  ]
})

new CfnOutput(customResourceStack, 'S3Bucket', {
  value: s3_bucket.bucketName,
  description: 'S3 bucket',
  exportName: `${stackName}-S3BucketName`
})

// Set up Athena database
const database = new glue.CfnDatabase(customResourceStack, 'JibeVisDatabase', {
  catalogId: customResourceStack.account,
  databaseInput: {
    name: databaseName
 }
});

new CfnOutput(customResourceStack, 'AthenaDatabase', {
  value: database.ref,
  description: 'Athena database',
  exportName: `${stackName}-jibevisAthenaDatabase`
});

// Set up Athena workgroup
const workgroup = new athena.CfnWorkGroup(customResourceStack, 'JibeVisWorkGroup', {
  name: `${stackName}-jibevisworkgroup`,
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
  exportName: `${stackName}-jibevisAthenaWorkGroup`
});


const distribution = new cloudfront.Distribution(customResourceStack, 'JibeVisCloudFront', {
  defaultBehavior: {
    origin: origins.S3BucketOrigin.withOriginAccessControl(s3_bucket),
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  },
  httpVersion: cloudfront.HttpVersion.HTTP3,
});


new CfnOutput(customResourceStack, 'CloudFrontURL', {
  value: distribution.domainName,
  description: 'CloudFront distribution URL',
  exportName: `${stackName}-JibeVisCloudFrontURL`
})
