import assert from 'assert';
import {clamp, snapValueToStep} from '../src/number';

describe('number utils', () => {
  describe('clamp', () => {
    it('should constrain value between min and max', () => {
      assert.strictEqual(clamp(5, -1, 1), 1);
      assert.strictEqual(clamp(-5, -1, 1), -1);
    });
  });

  describe('snapValueToStep', () => {
    it('should snap value to nearest step based on min and max', () => {
      assert.strictEqual(snapValueToStep(2, -0.5, 100, 3), 2.5);
      assert.strictEqual(snapValueToStep(-6.2, -2.5, 100, 3), -2.5);
      assert.strictEqual(snapValueToStep(106.2, -2.5, 100, 3), 99.5);
      assert.strictEqual(snapValueToStep(-0.009999, -0.5, 0.5, 0.01), -0.01);
    });
  });
});
