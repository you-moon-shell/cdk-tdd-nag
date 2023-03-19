#!/usr/bin/env node
import "source-map-support/register";
import { App, Aspects } from "aws-cdk-lib";

import { AwsSolutionsChecks } from "cdk-nag";

import { VPCStack } from "../lib/vpc-stack";

const app = new App();
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
new VPCStack(app, "vpc-stack", {});
