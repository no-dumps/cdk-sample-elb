#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ElbSampleStack } from '../lib/elb_sample-stack';

const app = new cdk.App();
new ElbSampleStack(app, 'ElbSampleStack');
