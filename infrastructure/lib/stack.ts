import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentConstructs } from './services';
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as agw from "aws-cdk-lib/aws-apigateway";


interface ServiceStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
}

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    const authorizer = new agw.CognitoUserPoolsAuthorizer(this, "Authorizer", {
        cognitoUserPools: [props.userPool],
    });

    new DeploymentConstructs(this, 'deployment')
  }
}