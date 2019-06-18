/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import {clamp, snapValueToStep} from '../../src/utils/number';

describe('clamp', () => {
  it('should constrain value between min and max', () => {
    assert.equal(clamp(5, -1, 1), 1);
    assert.equal(clamp(-5, -1, 1), -1);
  });
});

describe('snapValueToStep', () => {
  it('should snap value to nearest step based on min and max', () => {
    assert.equal(snapValueToStep(2, -0.5, 100, 3), 2.5);
    assert.equal(snapValueToStep(-6.2, -2.5, 100, 3), -2.5);
    assert.equal(snapValueToStep(106.2, -2.5, 100, 3), 99.5);
    assert.equal(snapValueToStep(-0.009999, -0.5, 0.5, 0.01), -0.01);
  });
});
