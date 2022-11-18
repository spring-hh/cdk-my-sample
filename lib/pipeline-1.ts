import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { Construct } from "constructs";

export class Pipeline1 extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
      ],
    };

    const customPolicyDocument = iam.PolicyDocument.fromJson(policyDocument);
    const newManagedPolicy = new iam.ManagedPolicy(this, "codebuildPolicy", {
      document: customPolicyDocument,
    });

    const codebuildRole = new iam.Role(this, "codebuildRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      description: "codebuildRole",
      managedPolicies: [newManagedPolicy, iam.ManagedPolicy.fromManagedPolicyArn(this, "managedECR", "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser")],
    });

    // codebuild
    const codebuildProject = new codebuild.PipelineProject(this, "codebuildProject", {
      projectName: "codebuildProject",
      role: codebuildRole,
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      environment: {
        privileged: true,
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
