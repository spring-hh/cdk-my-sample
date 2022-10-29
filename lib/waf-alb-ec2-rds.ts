import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as target from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import * as rds from "aws-cdk-lib/aws-rds";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

export class WafAlbEc2Rds extends Stack {
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

    // Security Group for ALB
    const albSg = new ec2.SecurityGroup(this, "albSg", {
      vpc: vpc,
      description: "allow http access from the world",
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "allow http access from the world");

    // Security Group for EC2
    const ec2Sg = new ec2.SecurityGroup(this, "ec2Sg", {
      vpc: vpc,
      description: "allow http access from alb",
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    ec2Sg.addIngressRule(albSg, ec2.Port.tcp(80), "allow http access from alb");

    // EC2
    const image = new ec2.AmazonLinuxImage();
    const ec2_1 = new ec2.Instance(this, "ec2_1", {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: image,
      vpcSubnets: {
        subnetGroupName: "public",
      },
      keyName: "key",
      securityGroup: ec2Sg,
    });
    ec2_1.userData.addCommands("#!/bin/bash", "sudo yum update -y", "sudo yum install httpd -y", "sudo service httpd start", "sudo chkconfig httpd on");

    const ec2_2 = new ec2.Instance(this, "ec2_2", {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: image,
      vpcSubnets: {
        subnetGroupName: "public",
      },
      keyName: "key",
      securityGroup: ec2Sg,
    });
    ec2_2.userData.addCommands("#!/bin/bash", "sudo yum update -y", "sudo yum install httpd -y", "sudo service httpd start", "sudo chkconfig httpd on");

    const tg_1 = new target.InstanceTarget(ec2_1);
    const tg_2 = new target.InstanceTarget(ec2_2);

    // ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, "alb", {
      vpc: vpc,
      internetFacing: true,
      vpcSubnets: {
        subnetGroupName: "public",
      },
      securityGroup: albSg,
    });
    const listener = alb.addListener("listener", {
      port: 80,
      open: true,
    });
    listener.addTargets("target", {
      port: 80,
      targets: [tg_1, tg_2],
      healthCheck: {
        path: "/",
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        healthyHttpCodes: "200",
      },
    });

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

    const rds_1 = new rds.DatabaseInstance(this, "rds_1", {
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

    // WAFv2
    const acl = new wafv2.CfnWebACL(this, "acl", {
      defaultAction: { allow: {} },
      scope: "REGIONAL",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: "acl",
      },
      rules: [
        // MAX WCU: 1500
        // BaseLine Rule Group [WCU: 700/ WCU: 100/ WCU: 200]
        {
          name: "AWSManagedRulesCommonRuleSet",
          priority: 1,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesCommonRuleSet",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "AWSManagedRulesCommonRuleSet",
          },
        },
        {
          name: "AWSManagedRulesAdminProtectionRuleSet",
          priority: 2,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesAdminProtectionRuleSet",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "AWSManagedRulesAdminProtectionRuleSet",
          },
        },
        {
          name: "AWSManagedRulesKnownBadInputsRuleSet",
          priority: 3,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesKnownBadInputsRuleSet",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "AWSManagedRulesKnownBadInputsRuleSet",
          },
        },
        // UseCase Rule Group [WCU: 200/ WCU: 200]
        {
          name: "AWSManagedRulesSQLiRuleSet",
          priority: 4,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesSQLiRuleSet",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "AWSManagedRulesSQLiRuleSet",
          },
        },
        {
          name: "AWSManagedRulesLinuxRuleSet",
          priority: 5,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesLinuxRuleSet",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "AWSManagedRulesLinuxRuleSet",
          },
        },
        // IP Rating Rule Group [WCU: 25/ WCU: 50]
        {
          name: "AWSManagedRulesAmazonIpReputationList",
          priority: 6,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesAmazonIpReputationList",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "AWSManagedRulesAmazonIpReputationList",
          },
        },
        {
          name: "AWSManagedRulesAnonymousIpList",
          priority: 7,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesAnonymousIpList",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "AWSManagedRulesAnonymousIpList",
          },
        },
      ],
    });

    // Waf v2 association
    const wafv2Association = new wafv2.CfnWebACLAssociation(this, "wafv2Association", {
      resourceArn: alb.loadBalancerArn,
      webAclArn: acl.attrArn,
    });
  }
}
