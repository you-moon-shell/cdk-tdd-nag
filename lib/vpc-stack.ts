import { Construct } from "constructs";

import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_kms as kms } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";

import { NagSuppressions } from "cdk-nag";

export class VPCStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const serverAccessLogBucket = new s3.Bucket(this, "serveraccesslog-bucket", {
      accessControl: s3.BucketAccessControl.PRIVATE,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
      enforceSSL: true,
    });
    NagSuppressions.addResourceSuppressions(serverAccessLogBucket, [{ id: "AwsSolutions-S1", reason: "ServerAccessLogを保存するBucketのため" }]);

    const flowLogKey = new kms.Key(this, "flowlog-key", {
      enableKeyRotation: true,
    });
    flowLogKey.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["kms:Encrypt*", "kms:Decrypt*", "kms:ReEncrypt*", "kms:GenerateDataKey*", "kms:Describe*"],
        principals: [new iam.ServicePrincipal("delivery.logs.amazonaws.com")],
        resources: ["*"],
      })
    );

    const flowLogBucket = new s3.Bucket(this, "flowlog-bucket", {
      accessControl: s3.BucketAccessControl.PRIVATE,
      encryptionKey: flowLogKey,
      encryption: s3.BucketEncryption.KMS,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
      enforceSSL: true,
      serverAccessLogsBucket: serverAccessLogBucket,
    });

    const vpc = new ec2.Vpc(this, "vpc", {
      ipAddresses: ec2.IpAddresses.cidr("192.168.0.0/16"),
      maxAzs: 1,
      natGateways: 0,
      flowLogs: {},
    });

    vpc.addFlowLog("flowlog", {
      destination: ec2.FlowLogDestination.toS3(flowLogBucket),
      trafficType: ec2.FlowLogTrafficType.ALL,
    });
  }
}
