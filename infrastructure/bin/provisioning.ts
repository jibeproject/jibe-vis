#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { getConfig } from "../lib/config";
import { AuthStack } from "../lib/auth";
import { DeploymentStack } from "../lib/stack";

const config = getConfig();
const app = new cdk.App()
const auth = new AuthStack(app, "AuthStack", { 
  env: { region: config.REGION },
 });
new DeploymentStack(app, "DeploymentStack", {
  userPool: auth.userPool,
  env: { region: config.REGION },
});
