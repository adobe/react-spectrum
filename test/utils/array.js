import {arraysEqual} from '../../src/utils/array';
import assert from 'assert';

describe('array utils', () => {
  describe('arraysEqual', () => {
    it('should return true when the arrays are equal', () => {
      assert.equal(arraysEqual([], []), true);
      assert.equal(arraysEqual([1, 2], [1, 2]), true);
    });

    it('should return false when the arrays are not equal', () => {
      assert.equal(arraysEqual([], [1]), false);
      assert.equal(arraysEqual([2, 3], [4, 5]), false);
    });
  });
});
