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

const app = new cdk.App();
// new CdkMySampleStack(app, "CdkMySampleStack");
// new AlbEc2Rds(app, "AlbEc2Rds");
// new RdsSingle(app, "RdsSingle");
// new RdsMulti(app, "RdsMulti");
// new RdsSingleReplica(app, "RdsSingleReplica");
// new WebAcl(app, "WebAcl");
// new Ec2(app, "Ec2");
// new Ec2FromAmi(app, "Ec2FromAmi");
// new WafAlbEc2Rds(app, "WafAlbEc2Rds");
// new SnsEmailEnv(app, "SnsEmailEnv");
