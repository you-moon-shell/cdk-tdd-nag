import { App } from "aws-cdk-lib";

import { Template } from "aws-cdk-lib/assertions";

import { VPCStack } from "../lib/vpc-stack";

const app = new App();
const vpcStack = new VPCStack(app, "test-vpc-stack");
const vpcTemplate = Template.fromStack(vpcStack);

test("VPCが192.168.0.0/16で1つ作成されること", () => {
  vpcTemplate.resourceCountIs("AWS::EC2::VPC", 1);
  vpcTemplate.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "192.168.0.0/16",
  });
});

test("Subnetが2つ作成されること", () => {
  vpcTemplate.resourceCountIs("AWS::EC2::Subnet", 2);
});

test("NatGatewayが作成されないこと", () => {
  vpcTemplate.resourceCountIs("AWS::EC2::NatGateway", 0);
});
