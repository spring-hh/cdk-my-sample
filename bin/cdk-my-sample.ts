#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkMySampleStack } from '../lib/cdk-my-sample-stack';

const app = new cdk.App();
new CdkMySampleStack(app, 'CdkMySampleStack');
