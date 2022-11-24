import { Stack } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export class createRoles {
  private stack: Stack;

  public constructor(stack: Stack) {
    this.stack = stack;
  }

  public createTaskRole() {
    const taskRole = new iam.Role(this.stack, "TaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });
    taskRole.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    });
    taskRole.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess",
    });

    taskRole.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess",
    });
    return taskRole;
  }

  public createExecutionRole() {
    const executionRole = new iam.Role(this.stack, "ExecutionkRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });
    executionRole.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    });

    executionRole.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess",
    });

    const policyDocumentSecret = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["secretsmanager:GetSecretValue", "kms:Decrypt"],
          Resource: ["arn:aws:secretsmanager:ap-northeast-1:162457395143:secret:*", "arn:aws:kms:ap-northeast-1:162457395143:*"],
        },
      ],
    };

    const customPolicyDocumentSecret = iam.PolicyDocument.fromJson(policyDocumentSecret);
    const newManagedPolicySecret = new iam.ManagedPolicy(this.stack, "newManagedPolicySecret", {
      document: customPolicyDocumentSecret,
    });
    executionRole.addManagedPolicy(newManagedPolicySecret);

    return executionRole;
  }

  public createCodebuildRole() {
    // policy for codebuild role
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "CloudWatchLogsPolicy",
          Effect: "Allow",
          Action: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
          Resource: ["*"],
        },
        {
          Sid: "CodeCommitPolicy",
          Effect: "Allow",
          Action: ["codecommit:GitPull"],
          Resource: ["*"],
        },
        {
          Sid: "S3GetObjectPolicy",
          Effect: "Allow",
          Action: ["s3:GetObject", "s3:GetObjectVersion"],
          Resource: ["*"],
        },
        {
          Sid: "S3PutObjectPolicy",
          Effect: "Allow",
          Action: ["s3:PutObject"],
          Resource: ["*"],
        },
        {
          Sid: "ECRPullPolicy",
          Effect: "Allow",
          Action: ["ecr:BatchCheckLayerAvailability", "ecr:GetDownloadUrlForLayer", "ecr:BatchGetImage"],
          Resource: ["*"],
        },
        {
          Sid: "ECRAuthPolicy",
          Effect: "Allow",
          Action: ["ecr:GetAuthorizationToken"],
          Resource: ["*"],
        },
        {
          Sid: "S3BucketIdentity",
          Effect: "Allow",
          Action: ["s3:GetBucketAcl", "s3:GetBucketLocation"],
          Resource: ["*"],
        },
        {
          Sid: "SSMGetParameterPolicy",
          Effect: "Allow",
          Action: ["ssm:GetParameter"],
          Resource: ["*"],
        },
        {
          Effect: "Allow",
          Action: ["ecs:*"],
          Resource: "*",
        },
        {
          Action: "iam:PassRole",
          Effect: "Allow",
          Resource: ["*"],
          Condition: {
            StringLike: {
              "iam:PassedToService": "ecs-tasks.amazonaws.com",
            },
          },
        },
      ],
    };

    const customPolicyDocument = iam.PolicyDocument.fromJson(policyDocument);
    const newManagedPolicy = new iam.ManagedPolicy(this.stack, "codebuildPolicy", {
      document: customPolicyDocument,
    });

    const codebuildRole = new iam.Role(this.stack, "codebuildRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      description: "codebuildRole",
      managedPolicies: [newManagedPolicy, iam.ManagedPolicy.fromManagedPolicyArn(this.stack, "managedECR", "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser")],
    });

    return codebuildRole;
  }
}
