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
import {getTextFromReact, isUrl, normalize, removeDiacritics} from '../../src/utils/string';
import React from 'react';
import {shallow} from 'enzyme';

describe('string', () => {
  describe('isUrl', () => {
    it('matches urls', () => {
      assert.equal(isUrl('http://www.adobe.com/image.png'), true);
      assert.equal(isUrl('http://adobe.com/image.png'), true);
      assert.equal(isUrl('adobe.com/image.png'), true);
      assert.equal(isUrl('image.png'), true);
      assert.equal(isUrl('../image.png'), true);
      assert.equal(isUrl('/image.png'), true);
    });

    it('doesn\'t match icon types', () => {
      assert.equal(isUrl('add'), false);
      assert.equal(isUrl('adobe'), false);
      assert.equal(isUrl('foo-bar'), false);
    });
  });

  describe('normalize', () => {
    const str = '\u1E9B\u0323';
    it('Default: Canonically-composed form (NFC)', () => {
      assert.equal(normalize(str), '\u1E9B\u0323');
    });
    it('Canonically-decomposed form (NFD)', () => {
      assert.equal(normalize(str, 'NFD'), '\u017F\u0323\u0307');
    });
    it('Compatibly-composed (NFKC)', () => {
      assert.equal(normalize(str, 'NFKC'), '\u1E69');
    });
    it('Compatibly-composed (NFKD)', () => {
      assert.equal(normalize(str, 'NFKD'), '\u0073\u0323\u0307');
    });
  });

  it('removeDiacritics', () => {
    const str = '\u1E9B\u0323';
    assert.equal(removeDiacritics(str), '\u017F');
    assert.equal(removeDiacritics(str, 'NFD'), '\u017F');
    assert.equal(removeDiacritics(str, 'NFC'), '\u017F');
    assert.equal(removeDiacritics(str, 'NFKC'), '\u0073');
    assert.equal(removeDiacritics(str, 'NFKD'), '\u0073');
  });

  it('getTextFromReact', () => {
    let tree = shallow(
      <div>This
        <span>string
          <span>should
            <span>be</span>
            <span>concatenated into</span>
            {[1, ' ', 'sentence.']}
          </span>
        </span>
      </div>
    );
    assert.equal(getTextFromReact(tree.get(0)), 'This string should be concatenated into 1 sentence.');
  });
});
