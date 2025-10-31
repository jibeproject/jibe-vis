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
// Extract just the meaningful part of the stack name
const projectName = stackName.split('-')[1] || 'amplify';
const databaseName = `${projectName}_analytics_db`.toLowerCase();
const stackParts = stackName.split('-');
const appId = stackParts[1]; 
const environment = stackParts[2]; 

const amplifyDomain = `https://${environment}.${appId}.amplifyapp.com`;


// set up storage
const s3_bucket = new s3.Bucket(customResourceStack, 'JibeVisData', {
  autoDeleteObjects: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.DESTROY,
  cors: [
      {
          allowedOrigins: [amplifyDomain],
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
  exportName: `${projectName }-S3BucketName`
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
  exportName: `${projectName }-jibevisAthenaDatabase`
});

// Set up Athena workgroup
const workgroup = new athena.CfnWorkGroup(customResourceStack, 'JibeVisWorkGroup', {
  name: `${projectName}-jibevisworkgroup`,
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
  exportName: `${projectName}-jibevisAthenaWorkGroup`
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
  exportName: `${projectName}-JibeVisCloudFrontURL`
})
