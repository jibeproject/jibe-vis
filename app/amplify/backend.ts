import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
// custom CDK stack
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import { aws_apigateway as agw } from "aws-cdk-lib";


const backend = defineBackend({
  auth,
  data
});

const customResourceStack = backend.createStack('JibeVisCustomResourceStack');

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

new CfnOutput(customResourceStack, 'S3BucketName', {
  value: s3_bucket.bucketName,
  description: 'S3 bucket name',
  exportName: 'S3BucketName',
})

// // // set up pmtile lambda function
// const protomaps = new lambda.Function(customResourceStack, 'protomapsFunction', {
//   runtime: lambda.Runtime.NODEJS_18_X,
//   architecture: lambda.Architecture.ARM_64,
//   memorySize: 512,
//   code: lambda.Code.fromAsset('amplify/lambda'), // Points to the lambda directory
//   environment: {
//     'BUCKET': s3_bucket.bucketName,
//     // 'PMTILES_PATH': 'tiles/{NAME}.pmtiles',
//     'PUBLIC_HOSTNAME': 'https://main.d1swcuo95yq9yf.amplifyapp.com/',
//   },
//   handler: 'index.handler', // Points to the 'hello' file in the lambda directory
//   }
// );

// const protomaps_url = protomaps.addFunctionUrl({
//   authType: lambda.FunctionUrlAuthType.AWS_IAM,
// })

// s3_bucket.grantRead(protomaps)

// set up cloudfront distribution


const distribution = new cloudfront.Distribution(customResourceStack, 'JibeVisCloudFront', {
  defaultBehavior: {
      // origin: new origins.FunctionUrlOrigin(protomaps_url),
      origin: new origins.S3Origin(s3_bucket),
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      // responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(customResourceStack, "jibevis-cors", {
      //   responseHeadersPolicyName: "jibevis-cors",
      //   comment: "For access to JIBE Vis S3 resources from the JIBE Vis website via Cloudfront.",
      //   corsBehavior: {
      //       accessControlAllowOrigins: ["https://main.d1swcuo95yq9yf.amplifyapp.com"],
      //       accessControlAllowCredentials: false,
      //       accessControlAllowHeaders: ["*"],
      //       accessControlAllowMethods: ["GET", "HEAD", "OPTIONS"],
      //       originOverride: true,
      //   },
      // }),
  },
  httpVersion: cloudfront.HttpVersion.HTTP3,
})

new CfnOutput(customResourceStack, 'CloudFrontURL', {
  value: distribution.domainName,
  description: 'CloudFront distribution URL',
  exportName: 'CloudFrontURL',
})