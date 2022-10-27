#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkMySampleStack } from "../lib/cdk-my-sample-stack";
import { AlbEc2Rds } from "../lib/alb-ec2-rds";
import { RdsSingle } from "../lib/rds-single";
import { RdsMulti } from "../lib/rds-multi";
import { RdsSingleReplica } from "../lib/rds-single-replica";

const app = new cdk.App();
// new CdkMySampleStack(app, "CdkMySampleStack");
// new AlbEc2Rds(app, "AlbEc2Rds");
// new RdsSingle(app, "RdsSingle");
// new RdsMulti(app, "RdsMulti");
// new RdsSingleReplica(app, "RdsSingleReplica");
