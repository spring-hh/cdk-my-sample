import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

export class WebAcl extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
  }
}
