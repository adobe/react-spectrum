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
import Well from '../../src/Well';

describe('Well', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<Well className="myClass">Testing</Well>);
    assert.equal(tree.prop('className'), 'spectrum-Well myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Well aria-hidden>My Well</Well>);
    assert.equal(tree.prop('aria-hidden'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Well>My Well</Well>);
    assert.equal(tree.childAt(0).text(), 'My Well');
  });
});
