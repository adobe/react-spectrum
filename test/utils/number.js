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
