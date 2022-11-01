import { Stack, StackProps } from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsp from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export class FargateEcsp extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "cluster", {
      clusterName: "cluster",
    });

    const fargateService = new ecsp.ApplicationLoadBalancedFargateService(this, "fargateService", {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      },
      publicLoadBalancer: true,
    });
  }
}
