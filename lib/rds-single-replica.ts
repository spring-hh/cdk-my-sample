import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

export class RdsSingleReplica extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, "vpc", {
      cidr: "10.0.0.0/16",
      defaultInstanceTenancy: ec2.DefaultInstanceTenancy.DEFAULT,
      enableDnsSupport: true,
      enableDnsHostnames: true,
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "public",
          cidrMask: 24,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: "private",
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Security Group for EC2 (dummy)
    const ec2Sg = new ec2.SecurityGroup(this, "ec2Sg", {
      vpc: vpc,
      description: "allow http access from the world",
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    ec2Sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "allow http access from the world");

    // Security Group for RDS
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

    // RDS with read replica
    const rdsInstance = new rds.DatabaseInstance(this, "rds", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [rdsSg],
      credentials: rdsCredentials,
      databaseName: dbName,
      removalPolicy: RemovalPolicy.DESTROY,
      deletionProtection: false,
      multiAz: false,
      autoMinorVersionUpgrade: true,
      backupRetention: Duration.days(7),
      cloudwatchLogsExports: ["postgresql"],
      copyTagsToSnapshot: true,
      enablePerformanceInsights: true,
      iamAuthentication: false,
      instanceIdentifier: "rds",
      allocatedStorage: 20,
      monitoringInterval: Duration.minutes(1),
      port: 5432,
      preferredBackupWindow: "07:00-09:00",
      preferredMaintenanceWindow: "sun:15:00-sun:17:00",
      publiclyAccessible: false,
      storageEncrypted: true,
      storageType: rds.StorageType.STANDARD,
    });

    // RDS read replica
    const rdsReadReplica = new rds.DatabaseInstanceReadReplica(this, "rdsReadReplica", {
      sourceDatabaseInstance: rdsInstance,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [rdsSg],
      removalPolicy: RemovalPolicy.DESTROY,
      deletionProtection: false,
      autoMinorVersionUpgrade: true,
      cloudwatchLogsExports: ["postgresql"],
      copyTagsToSnapshot: true,
      enablePerformanceInsights: true,
      iamAuthentication: false,
      instanceIdentifier: "rdsReadReplica",
      monitoringInterval: Duration.minutes(1),
      port: 5432,
      publiclyAccessible: false,
      storageEncrypted: true,
      storageType: rds.StorageType.STANDARD,
    });
  }
}
