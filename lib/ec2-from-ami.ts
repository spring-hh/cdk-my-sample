import { Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { createVpc } from "./components/createVpc";
import { Construct } from "constructs";

export class Ec2FromAmi extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC
    const vpc: ec2.Vpc = new createVpc(this).createVpc();

    // Security Group for EC2
    const ec2Sg = new ec2.SecurityGroup(this, "ec2Sg", {
      vpc: vpc,
      description: "allow http access from the world",
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    ec2Sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "allow http access from the world");

    // EC2
    const image = ec2.MachineImage.genericLinux({
      // "ami-0de5311b2a443fb89" is Amazon Linux 2 AMI (HVM) - Kernel 5.10, SSD Volume Type
      "ap-northeast-1": "ami-0de5311b2a443fb89",
    });
    const ec2Instance = new ec2.Instance(this, "ec2Instance", {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: image,
      vpcSubnets: {
        subnetGroupName: "public",
      },
      keyName: "key",
      securityGroup: ec2Sg,
    });
  }
}
