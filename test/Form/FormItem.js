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
import {FormItem} from '../../src/Form';
import React from 'react';
import {shallow} from 'enzyme';
import Textfield from '../../src/Textfield';

const render = (props = {}) => shallow(
  <FormItem label="Company Title" labelFor="company-title">
    <Textfield placeholder="Company Title" id="company-title" />
  </FormItem>
).dive();

describe('FormItem', () => {
  it('should render a FormItem element with classes and its children', () => {
    const wrapper = render();
    assert.equal(wrapper.find('.spectrum-Form-item').length, 1);
    assert.equal(wrapper.find('label').length, 1);
    assert.equal(wrapper.find(Textfield).length, 1);
  });

  it('label should have the correct inner text and reference', () => {
    const wrapper = render();
    const label = wrapper.find('label');
    const field = wrapper.find(Textfield);
    assert.equal(label.text(), 'Company Title');
    assert.equal(label.prop('htmlFor'), 'company-title');
    assert.equal(field.prop('aria-labelledby'), label.prop('id'));
  });

  it('label text should be right aligned', () => {
    const wrapper = shallow(<FormItem label="Test" labelAlign="right"><input type="text" /></FormItem>).dive();
    assert(wrapper.find('label').hasClass('spectrum-FieldLabel--right'));
  });

  it('with no label prop use div rather than label', () => {
    const wrapper = shallow(<FormItem><label><input type="checkbox" />I agree to terms and conditions.</label></FormItem>).dive();
    assert.equal(wrapper.find('label').length, 1);
    const divs = wrapper.find('div');
    assert.equal(divs.length, 3);
    assert(divs.at(0).hasClass('spectrum-Form-item'));
    assert(divs.at(1).hasClass('spectrum-Form-itemLabel'));
    assert(divs.at(2).hasClass('spectrum-Form-itemField'));
  });
});
