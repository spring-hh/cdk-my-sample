import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { createVpc } from "./components/createVpc";
import { Construct } from "constructs";

export class RdsMulti extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC
    const vpc: ec2.Vpc = new createVpc(this).createVpc();

    // Security Group for EC2 (dummy)
    const ec2Sg = new ec2.SecurityGroup(this, "ec2Sg", {
      vpc: vpc,
      description: "allow http access from the world",
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    ec2Sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "allow http access from the world");

    // RDS
    const rdsSg = new ec2.SecurityGroup(this, "rdsSg", {
      vpc: vpc,
      description: "allow postgresql access from ec2",
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    rdsSg.addIngressRule(ec2Sg, ec2.Port.tcp(5432), "allow postgresql access from ec2");

    const dbUser: string = "testuser";
    const dbName: string = "testdb";
    const rdsCredentials: rds.Credentials = rds.Credentials.fromGeneratedSecret(dbUser);

    const db = new rds.DatabaseInstance(this, "db", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc: vpc,
      vpcSubnets: {
        subnetGroupName: "private",
      },
      credentials: rdsCredentials,
      databaseName: dbName,
      securityGroups: [rdsSg],
      multiAz: true,
      allocatedStorage: 20,
      storageType: rds.StorageType.STANDARD,
      deletionProtection: false,
      backupRetention: Duration.days(7),
      removalPolicy: RemovalPolicy.DESTROY,
      autoMinorVersionUpgrade: true,
      cloudwatchLogsExports: ["postgresql"],
    });
  }
}
