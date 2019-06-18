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
import Provider from '../../src/Provider';
import React from 'react';
import {shallow} from 'enzyme';

describe('Provider', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Provider />);
    assert(tree.hasClass('spectrum'));
    assert(tree.hasClass('spectrum--light'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Provider className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Provider aria-hidden />);
    assert.equal(tree.prop('aria-hidden'), true);
    assert.equal(tree.shallow().find('div').prop('aria-hidden'), true);
  });

  it('supports other themes', () => {
    const tree = shallow(<Provider theme="dark" />);
    assert(tree.hasClass('spectrum--dark'));
  });

  it('supports scaling', () => {
    const tree = shallow(<Provider scale="large" />);
    assert(tree.hasClass('spectrum--large'));
  });
});
