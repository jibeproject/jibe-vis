import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
// custom CDK stack
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Distribution } from 'aws-cdk-lib/aws-cloudfront'
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
// import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
// import { aws_apigateway as agw } from "aws-cdk-lib";

const backend = defineBackend({
  auth,
});

const customResourceStack = backend.createStack('JibeVisCustomResourceStack');

const s3_bucket = new s3.Bucket(customResourceStack, 'FrontendBucket', {
  autoDeleteObjects: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.DESTROY,
  cors: [
      {
          allowedOrigins: ["https://main.d1swcuo95yq9yf.amplifyapp.com/"],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedHeaders: ["range","if-match"],
          exposedHeaders: ["etag"],
          maxAge: 3000
      }
  ]
})

const distribution = new Distribution(customResourceStack, 'CloudfrontDistribution', {
  defaultBehavior: {
      origin: new S3Origin(s3_bucket),
      // viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  },
  // defaultRootObject: 'index.html',
  // errorResponses: [
  //     {
  //         httpStatus: 404,
  //         responseHttpStatus: 200,
  //         responsePagePath: '/index.html',
  //     },
  // ],
})

new CfnOutput(customResourceStack, 'CloudFrontURL', {
  value: distribution.domainName,
  // description: 'A String type that describes the output value.',
  exportName: 'JibeBis-CDK-CloudFront',
})

new CfnOutput(customResourceStack, 'BucketName', {
  value: s3_bucket.bucketName,
  // description: '	A String type that describes the output value.',
  exportName: 'JibeVis-CDK-S3',
})