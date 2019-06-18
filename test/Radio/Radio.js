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
import Radio from '../../src/Radio';
import React from 'react';
import {shallow} from 'enzyme';

describe('Radio', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Radio />);
    assert.equal(tree.prop('inputType'), 'radio');
    assert.equal(tree.prop('className'), 'spectrum-Radio');
    assert.equal(tree.prop('inputClassName'), 'spectrum-Radio-input');
    assert.equal(tree.prop('markClassName'), 'spectrum-Radio-button');
    assert.equal(tree.prop('labelClassName'), 'spectrum-Radio-label');
  });

  it('supports labelBelow layout', () => {
    const tree = shallow(<Radio labelBelow />);
    assert.equal(tree.hasClass('spectrum-Radio--labelBelow'), true);
  });

  it('supports quiet', () => {
    const tree = shallow(<Radio quiet />);
    assert.equal(tree.prop('className'), 'spectrum-Radio spectrum-Radio--quiet');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Radio className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Radio aria-hidden />);
    assert.equal(tree.prop('aria-hidden'), true);
    assert.equal(tree.shallow().find('input').prop('aria-hidden'), true);
  });
});
