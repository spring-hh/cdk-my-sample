import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codegurureviewer from "aws-cdk-lib/aws-codegurureviewer";

export class Codeguru extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prefix = "codeguru";
    const repository = new codecommit.Repository(this, `${prefix}Repository`, {
      repositoryName: `${prefix}-repository`,
    });

    const codeGuruReviewer = new codegurureviewer.CfnRepositoryAssociation(this, `${prefix}CodeGuruReviewer`, {
      name: repository.repositoryName,
      type: "CodeCommit",
    });
  }
}
