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
import Checkbox from '../../src/Checkbox';
import {mount, shallow} from 'enzyme';
import React from 'react';

describe('Checkbox', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Checkbox />);
    assert.equal(tree.prop('inputType'), 'checkbox');
    assert(!tree.prop('aria-checked'));
    assert.equal(tree.prop('className'), 'spectrum-Checkbox');
    assert.equal(tree.prop('inputClassName'), 'spectrum-Checkbox-input');
    assert.equal(tree.prop('markClassName'), 'spectrum-Checkbox-box');
    assert.equal(tree.prop('labelClassName'), 'spectrum-Checkbox-label');
  });

  it('supports indeterminate', () => {
    // Render the Checkbox AND it's SwitchBase component and make sure overriding
    // aria-checked happens properly.
    let tree = shallow(<Checkbox indeterminate />);
    let innerTree = tree.shallow();
    assert.equal(tree.prop('aria-checked'), 'mixed');
    assert.equal(findInput(innerTree).prop('aria-checked'), 'mixed');
    assert.equal(findInput(innerTree).prop('checked'), false);


    tree.setProps({indeterminate: false});
    innerTree = tree.shallow();
    assert.equal(findInput(innerTree).prop('aria-checked'), false);
    assert.equal(findInput(innerTree).prop('checked'), false);

    tree.setProps({checked: true});
    innerTree = tree.shallow();
    assert.equal(findInput(innerTree).prop('aria-checked'), true);
    assert.equal(findInput(innerTree).prop('checked'), true);

    // test mounted for code coverage of indeterminate property on input element
    tree = mount(<Checkbox indeterminate />);
    let inputRef = tree.instance().inputRef.getInput();
    assert.equal(inputRef.getAttribute('aria-checked'), 'mixed');
    assert.equal(inputRef.checked, false);
    tree.setProps({indeterminate: false});
    tree.update();
    assert(inputRef.getAttribute('aria-checked'), 'false');
    assert.equal(inputRef.checked, false);
    tree.setProps({checked: true});
    assert(inputRef.getAttribute('aria-checked'), 'true');
    assert.equal(inputRef.checked, true);
    tree.unmount();
  });

  it('supports quiet', () => {
    const tree = shallow(<Checkbox quiet />);
    assert.equal(tree.prop('className'), 'spectrum-Checkbox spectrum-Checkbox--quiet');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Checkbox className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Checkbox aria-hidden />);
    let innerTree = tree.shallow();
    assert.equal(tree.prop('aria-hidden'), true);
    assert.equal(findInput(innerTree).prop('aria-hidden'), true);
  });
});

const findInput = tree => tree.find('input');
