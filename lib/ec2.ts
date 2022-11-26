import { Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { createVpc } from "./components/createVpc";

export class Ec2 extends Stack {
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
    const image = new ec2.AmazonLinuxImage();
    const instance = new ec2.Instance(this, "instance", {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: image,
      vpcSubnets: {
        subnetGroupName: "public",
      },
      keyName: "key",
      securityGroup: ec2Sg,
    });
    instance.userData.addCommands("#!/bin/bash", "sudo yum update -y", "sudo yum install httpd -y", "sudo service httpd start", "sudo chkconfig httpd on");
  }
}
