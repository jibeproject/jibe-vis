// Drawing on https://github.com/aws-samples/aws-react-spa-with-cognito-auth/blob/main/backend/lib/api.ts
import * as cdk from "aws-cdk-lib/core";
import { aws_apigateway as agw } from "aws-cdk-lib";
// import { aws_lambda as lambda } from "aws-cdk-lib";
// import { aws_lambda_nodejs as lambdaNodejs } from "aws-cdk-lib";
import { aws_s3 as s3 } from 'aws-cdk-lib'
// Drawing on https://github.com/andrewevans0102/deploy-react-with-cdk/blob/master/infra/lib/deployment-service.ts
import { Construct } from 'constructs'
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib'
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
const path = '../app/build'

export class ServiceStack extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Definition of API Gateway
        // const api = new agw.RestApi(this, "api", {
        //     deployOptions: {
        //     stageName: "api",
        //     },
        //     defaultCorsPreflightOptions: {
        //     allowOrigins: agw.Cors.ALL_ORIGINS,
        //     allowMethods: agw.Cors.ALL_METHODS,
        //     },
        // });

        // Definition of lambda function
        // const getTimeFunction = new lambdaNodejs.NodejsFunction(this, "getTime", {
        //     handler: "handler",
        //     runtime: lambda.Runtime.NODEJS_20_X,
        //     timeout: cdk.Duration.seconds(30),
        //     memorySize: 512,
        //     entry: "./lambda/time/get.ts",
        // });

        const hostingBucket = new s3.Bucket(this, 'FrontendBucket', {
            autoDeleteObjects: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            cors: [
                {
                    allowedOrigins: ["https://example.com"],
                    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
                    allowedHeaders: ["range","if-match"],
                    exposedHeaders: ["etag"],
                    maxAge: 3000
                }
            ]
        })

        const distribution = new Distribution(this, 'CloudfrontDistribution', {
            defaultBehavior: {
                origin: new S3Origin(hostingBucket),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        })

        new BucketDeployment(this, 'BucketDeployment', {
            sources: [Source.asset(path)],
            destinationBucket: hostingBucket,
            distribution,
            distributionPaths: ['/*'],
        })

        new CfnOutput(this, 'CloudFrontURL', {
            value: distribution.domainName,
            description: 'The distribution URL',
            exportName: 'CloudfrontURL',
        })

        new CfnOutput(this, 'BucketName', {
            value: hostingBucket.bucketName,
            description: 'The name of the S3 bucket',
            exportName: 'BucketName',
        })
    }
}

