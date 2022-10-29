import { Stack, StackProps } from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as dotenv from "dotenv";
import { Construct } from "constructs";

dotenv.config();

export class SnsEmailEnv extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // SNS Topic sends messages to Email
    const topic = new sns.Topic(this, "topic", {
      displayName: "topic",
    });

    if (process.env.EMAIL) {
      topic.addSubscription(new subs.EmailSubscription(process.env.EMAIL)); // Email Subscription
    }
  }
}
