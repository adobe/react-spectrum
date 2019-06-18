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
import {Form, FormItem} from '../../src/Form';
import React from 'react';
import {shallow} from 'enzyme';
import Textfield from '../../src/Textfield';

const render = (props = {}) => shallow(
  <Form {...props}>
    <FormItem label="Company Title" labelFor="company-id">
      <Textfield placeholder="Company Title" id="company-title" />
    </FormItem>
  </Form>
);

describe('Form', () => {
  it('should render a Form element with classes and its children', () => {
    const wrapper = render();
    assert.equal(wrapper.find('form').length, 1);
    assert.equal(wrapper.find(FormItem).length, 1);
    assert.equal(wrapper.find('form').prop('className'), 'spectrum-Form');
  });

  it('should render with additional properties', () => {
    const wrapper = shallow(<Form id="formId" />);
    assert.equal(wrapper.prop('id'), 'formId');
  });

  it('should render with additional classnames', () => {
    const wrapper = shallow(<Form className="test-form" />);
    assert.equal(wrapper.prop('className'), 'spectrum-Form test-form');
  });

});
