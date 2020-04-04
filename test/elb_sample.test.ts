import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import ElbSample = require('../lib/elb_sample-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ElbSample.ElbSampleStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
