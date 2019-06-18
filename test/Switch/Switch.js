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
import React from 'react';
import {shallow} from 'enzyme';
import Switch from '../../src/Switch';

describe('Switch', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Switch />);
    assert.equal(tree.prop('inputType'), 'checkbox');
    assert.equal(tree.prop('className'), 'spectrum-ToggleSwitch');
    assert.equal(tree.prop('inputClassName'), 'spectrum-ToggleSwitch-input');
    assert.equal(tree.prop('markClassName'), 'spectrum-ToggleSwitch-switch');
    assert.equal(tree.prop('labelClassName'), 'spectrum-ToggleSwitch-label');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Switch className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Switch foo />);
    assert.equal(tree.prop('foo'), true);
  });

  it('supports ab variant', () => {
    const tree = shallow(<Switch variant="ab" />);
    assert.equal(tree.hasClass('spectrum-ToggleSwitch--ab'), true);
  });

  it('supports quiet', () => {
    const tree = shallow(<Switch quiet />);
    assert.equal(tree.prop('className'), 'spectrum-ToggleSwitch spectrum-ToggleSwitch--quiet');
  });

  it('has appropriate WAI-ARIA role for a switch', () => {
    const tree = shallow(<Switch />);
    assert.equal(tree.prop('role'), 'switch');
  });
});
