import assert from 'assert';
import {concatIterators, difference, keyDiff} from '../src/utils';

describe('utils', function () {
  describe('keyDiff', function () {
    it('should return an empty set if two identical sets are given', function () {
      var res = keyDiff(new Set([1, 2, 3]), new Set([1, 2, 3]));
      assert.deepEqual(Array.from(res), []);
    });

    it('should return the keys in a that are not in b', function () {
      var res = keyDiff(new Set([1, 2, 3]), new Set([1]));
      assert.deepEqual(Array.from(res), [2, 3]);
    });
  });

  describe('difference', function () {
    it('should return empty sets if the inputs are equal', function () {
      var {toRemove, toAdd} = difference(new Set([1, 2, 3]), new Set([1, 2, 3]));
      assert.deepEqual(Array.from(toRemove), []);
      assert.deepEqual(Array.from(toAdd), []);
    });

    it('should return items to remove', function () {
      var {toRemove, toAdd} = difference(new Set([1, 2, 3]), new Set([1, 2]));
      assert.deepEqual(Array.from(toRemove), [3]);
      assert.deepEqual(Array.from(toAdd), []);
    });

    it('should return items to add', function () {
      var {toRemove, toAdd} = difference(new Set([1, 2, 3]), new Set([1, 2, 3, 4]));
      assert.deepEqual(Array.from(toRemove), []);
      assert.deepEqual(Array.from(toAdd), [4]);
    });

    it('should return items to add and remove', function () {
      var {toRemove, toAdd} = difference(new Set([1, 2, 3]), new Set([1, 3, 4]));
      assert.deepEqual(Array.from(toRemove), [2]);
      assert.deepEqual(Array.from(toAdd), [4]);
    });

    it('should handle case where arrays are completely different', function () {
      var {toRemove, toAdd} = difference(new Set([1, 2, 3]), new Set([4, 5, 6]));
      assert.deepEqual(Array.from(toRemove), [1, 2, 3]);
      assert.deepEqual(Array.from(toAdd), [4, 5, 6]);
    });
  });

  describe('concatIterators', function () {
    it('should return an iterator that iterates over all items in all of the provided iterators', function () {
      var res = concatIterators(new Set([1, 2, 3]), new Set([4, 5, 6]));
      assert.deepEqual(Array.from(res), [1, 2, 3, 4, 5, 6]);
    });
  });
});
