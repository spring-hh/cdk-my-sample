#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkMySampleStack } from "../lib/cdk-my-sample-stack";
import { AlbEc2Rds } from "../lib/alb-ec2-rds";

const app = new cdk.App();
// new CdkMySampleStack(app, "CdkMySampleStack");
new AlbEc2Rds(app, "AlbEc2Rds");
