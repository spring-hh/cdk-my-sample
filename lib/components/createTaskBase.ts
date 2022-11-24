import { RemovalPolicy, Stack } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface Props {
  vpc: ec2.Vpc;
  taskRole: iam.Role;
  executionRole: iam.Role;
  serviceName: string;
}

export class createTaskBase {
  private stack: Stack;
  private props: Props;
  private taskRole: iam.Role;
  private executionRole: iam.Role;

  public logDriver: ecs.AwsLogDriver;
  public taskDefinition: ecs.FargateTaskDefinition;
  public ServiceSecGrp: ec2.SecurityGroup;

  public constructor(stack: Stack, props: Props) {
    this.stack = stack;
    this.props = props;
    this.taskRole = props.taskRole;
    this.executionRole = props.executionRole;
    this.initialize();
  }

  private initialize() {
    this.createLogSettings();
    this.createTaskDef();
  }

  private createLogSettings() {
    const serviceLogGroup = new logs.LogGroup(this.stack, `${this.props.serviceName}ServiceLogGroup`, {
      logGroupName: `/ecs/${this.props.serviceName}Service`,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.logDriver = new ecs.AwsLogDriver({
      logGroup: serviceLogGroup,
      streamPrefix: `${this.props.serviceName}Service`,
    });
  }

  private createTaskDef() {
    this.taskDefinition = new ecs.FargateTaskDefinition(this.stack, `${this.props.serviceName}ServiceTaskDef`, {
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: this.taskRole,
      executionRole: this.executionRole,
      runtimePlatform: {
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        // cpuArchitecture: ecs.CpuArchitecture.ARM64,
      },
    });
  }
}
