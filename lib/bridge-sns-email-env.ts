import { Stack, StackProps } from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as dotenv from "dotenv";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";

dotenv.config();

export class BridgeSnsEmailEnv extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // SNS Topic sends messages to Email
    const topic = new sns.Topic(this, "topic", {
      displayName: "topic",
    });

    if (process.env.EMAIL) {
      topic.addSubscription(new subs.EmailSubscription(process.env.EMAIL)); // Email Subscription
    }

    // EventBridge Rule sends messages to SNS Topic
    const rule = new events.Rule(this, "rule", {
      eventPattern: {
        source: ["aws.ec2"],
        detailType: ["AWS API Call via CloudTrail"],
        detail: {
          eventSource: ["ec2.amazonaws.com"],
          eventName: ["AuthorizeSecurityGroupIngress", "AuthorizeSecurityGroupEgress", "RevokeSecurityGroupIngress", "RevokeSecurityGroupEgress", "ModifySecurityGroupRules"],
        },
      },
      eventBus: events.EventBus.fromEventBusName(this, "eventBus", "default"),
    });

    rule.addTarget(
      new targets.SnsTopic(topic, {
        message: events.RuleTargetInput.fromObject({
          account: events.EventField.fromPath("$.account"),
          region: events.EventField.fromPath("$.region"),
          time: events.EventField.fromPath("$.time"),
          user: events.EventField.fromPath("$.detail.userIdentity.userName"),
          eventName: events.EventField.fromPath("$.detail.eventName"),
          sourceIPAddress: events.EventField.fromPath("$.detail.sourceIPAddress"),
          userAgent: events.EventField.fromPath("$.detail.userAgent"),
          GroupId: events.EventField.fromPath("$.detail.requestParameters.ModifySecurityGroupRulesRequest.GroupId"),
          SecurityGroupRule: events.EventField.fromPath("$.detail.requestParameters.ModifySecurityGroupRulesRequest.SecurityGroupRule.SecurityGroupRule"),
        }),
      })
    );
  }
}
