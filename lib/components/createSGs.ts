import { Stack } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class createSGs {
  private stack: Stack;
  private vpc: ec2.Vpc;

  public constructor(stack: Stack, vpc: ec2.Vpc) {
    this.stack = stack;
    this.vpc = vpc;
  }

  public createSg80() {
    const Sg80 = new ec2.SecurityGroup(this.stack, "Sg80", {
      vpc: this.vpc,
      description: "Allow tcp80 access",
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    Sg80.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "Allow tcp80 access");

    return Sg80;
  }

  public createSg3000() {
    const Sg3000 = new ec2.SecurityGroup(this.stack, "Sg3000", {
      vpc: this.vpc,
      description: "Allow tcp3000 access",
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    Sg3000.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), "Allow tcp3000 access");

    return Sg3000;
  }
}
