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
