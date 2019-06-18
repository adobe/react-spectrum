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
import StatusLight from '../../src/StatusLight';

describe('StatusLight', () => {
  it('supports variants', () => {
    const tree = shallow(<StatusLight variant="celery">Testing</StatusLight>);
    assert(tree.hasClass('spectrum-StatusLight--celery'));
  });

  it('supports a disabled state', () => {
    const tree = shallow(<StatusLight disabled>Testing</StatusLight>);
    assert(tree.hasClass('is-disabled'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<StatusLight className="myClass">Testing</StatusLight>);
    assert(tree.hasClass('myClass'));
  });

  it('supports additional properties', () => {
    const tree = shallow(<StatusLight aria-hidden>Testing</StatusLight>);
    assert.equal(tree.prop('aria-hidden'), true);
  });

  it('supports children', () => {
    const tree = shallow(<StatusLight>Testing</StatusLight>);
    assert.equal(tree.childAt(0).text(), 'Testing');
  });
});
