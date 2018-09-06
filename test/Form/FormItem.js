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
    assert.equal(label.text(), 'Company Title');
    assert.equal(label.prop('htmlFor'), 'company-title');
  });

  it('label text should be right aligned', () => {
    const wrapper = shallow(<FormItem label="Test" labelAlign="right"><input type="text" /></FormItem>).dive();
    assert.equal(wrapper.find('label').hasClass('spectrum-FieldLabel--right'), true);
  });
});
