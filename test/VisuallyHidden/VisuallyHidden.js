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
import VisuallyHidden from '../../src/VisuallyHidden';

describe('VisuallyHidden', () => {
  it('should render a span with the appropriate className', () => {
    const wrapper = shallow(<VisuallyHidden>Foo</VisuallyHidden>);
    assert(wrapper.hasClass('u-react-spectrum-screenReaderOnly'));
    assert.equal(wrapper.type(), 'span');
    assert.equal(wrapper.text(), 'Foo');
  });
  it('supports custom className', () => {
    const wrapper = shallow(<VisuallyHidden className="custom-class-name">Foo</VisuallyHidden>);
    assert(wrapper.hasClass('u-react-spectrum-screenReaderOnly'));
    assert(wrapper.hasClass('custom-class-name'));
  });
  it('supports element prop', () => {
    const wrapper = shallow(<VisuallyHidden element="div">Foo</VisuallyHidden>);
    assert.equal(wrapper.type(), 'div');
  });
  it('supports focusable prop', () => {
    const wrapper = shallow(<VisuallyHidden element="a" href="#main" target="_self" className="spectrum-Link" focusable>Skip to Main Content</VisuallyHidden>);
    assert.equal(wrapper.type(), 'a');
    assert(wrapper.hasClass('u-react-spectrum-screenReaderOnly'));
    assert(wrapper.hasClass('is-focusable'));
    assert(wrapper.hasClass('spectrum-Link'));
    assert.equal(wrapper.prop('href'), '#main');
    assert.equal(wrapper.prop('target'), '_self');
    assert(!wrapper.prop('focusable'));
  });
});
