import { Stack } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class createVpc {
  private stack: Stack;

  public constructor(stack: Stack) {
    this.stack = stack;
  }

  public createVpc() {
    const vpc = new ec2.Vpc(this.stack, "vpc", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
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

    return vpc;
  }
}
