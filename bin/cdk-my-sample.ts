#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkMySampleStack } from "../lib/cdk-my-sample-stack";
import { AlbEc2Rds } from "../lib/alb-ec2-rds";
import { RdsSingle } from "../lib/rds-single";
import { RdsMulti } from "../lib/rds-multi";
import { RdsSingleReplica } from "../lib/rds-single-replica";
import { WebAcl } from "../lib/web-acl";
import { Ec2 } from "../lib/ec2";
import { Ec2FromAmi } from "../lib/ec2-from-ami";
import { WafAlbEc2Rds } from "../lib/waf-alb-ec2-rds";
import { SnsEmailEnv } from "../lib/sns-email-env";
import { BridgeSnsEmailEnv } from "../lib/bridge-sns-email-env";
import { FargateEcsp } from "../lib/fargate-ecsp";
import { Pipeline1 } from "../lib/pipeline-1";
import { Codeguru } from "../lib/codeguru";

const app = new cdk.App();
// const stack = new CdkMySampleStack(app, "CdkMySampleStack");
// const stack = new AlbEc2Rds(app, "AlbEc2Rds");
// const stack = new RdsSingle(app, "RdsSingle");
// const stack = new RdsMulti(app, "RdsMulti");
// const stack = new RdsSingleReplica(app, "RdsSingleReplica");
// const stack = new WebAcl(app, "WebAcl");
// const stack = new Ec2(app, "Ec2");
// const stack = new Ec2FromAmi(app, "Ec2FromAmi");
// const stack = new WafAlbEc2Rds(app, "WafAlbEc2Rds");
// const stack = new SnsEmailEnv(app, "SnsEmailEnv");
// const stack = new BridgeSnsEmailEnv(app, "BridgeSnsEmailEnv");
// const stack = new FargateEcsp(app, "FargateEcsp");
const stack = new Pipeline1(app, "Pipeline1");
cdk.Tags.of(stack).add("Project", "sample");
const stack2 = new Codeguru(app, "Codeguru");
cdk.Tags.of(stack2).add("Project", "sample");
