import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { createRoles } from "./components/createRoles";
import { createSGs } from "./components/createSGs";
import { createVpc } from "./components/createVpc";
import { createTaskBase } from "./components/createTaskBase";
import { Construct } from "constructs";

export class Pipeline1 extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC作成
    const vpc: ec2.Vpc = new createVpc(this).createVpc();

    // Role作成
    const codebuildRole: iam.Role = new createRoles(this).createCodebuildRole();
    const taskRole: iam.Role = new createRoles(this).createTaskRole();
    const executionRole: iam.Role = new createRoles(this).createExecutionRole();

    // Security Group作成
    const sg3000: ec2.SecurityGroup = new createSGs(this, vpc).createSg3000();
    const sg80: ec2.SecurityGroup = new createSGs(this, vpc).createSg80();

    // codecommit
    const repo = new codecommit.Repository(this, "repo", {
      repositoryName: "repo",
      description: "repo",
    });

    // ecr repository
    const ecrrepo = new ecr.Repository(this, "ecrrepo", {
      repositoryName: "ecrrepo",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // task definition
    const task = new createTaskBase(this, {
      vpc: vpc,
      taskRole: taskRole,
      executionRole: executionRole,
      serviceName: "service",
    });

    // add container to task definition
    task.taskDefinition.addContainer("container", {
      containerName: "container",
      image: ecs.ContainerImage.fromEcrRepository(ecr.Repository.fromRepositoryName(this, "service", "ecrrepo")),
      logging: task.logDriver,
      portMappings: [
        {
          containerPort: 3000,
          hostPort: 3000,
          protocol: ecs.Protocol.TCP,
        },
      ],
    });

    // codebuild
    const codebuildProject = new codebuild.PipelineProject(this, "codebuildProject", {
      projectName: "codebuildProject",
      role: codebuildRole,
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      environment: {
        privileged: true,
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
      // environmentVariables type: parameter
      environmentVariables: {
        DOCKER_USER: {
          type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
          value: "/docker/user",
        },
        DOCKER_PASS: {
          type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
          value: "/docker/pass",
        },
        AWS_DEFAULT_REGION: {
          type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
          value: "/codebuild/region",
        },
        AWS_ACCOUNT_ID: {
          type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
          value: "/codebuild/account",
        },
        IMAGE_REPO_NAME: {
          type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
          value: "/codebuild/repo",
        },
        IMAGE_TAG: {
          type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
          value: "/codebuild/tag",
        },
      },
    });

    // Artifact
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // Code Pipeline Action
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: "CodeCommit",
      repository: repo,
      output: sourceOutput,
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "CodeBuild",
      project: codebuildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    // pipeline
    const pipeline = new codepipeline.Pipeline(this, "pipeline", {
      pipelineName: "pipeline",
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
      ],
    });
  }
}
