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
import Banner from '../../src/Banner';
import React from 'react';
import {shallow} from 'enzyme';

describe('Banner', () => {
  it('supports variants, default info', () => {
    let tree = shallow(<Banner variant="warning" />);
    assert(tree.hasClass('spectrum-Banner--warning'));

    tree = shallow(<Banner />);
    assert(tree.hasClass('spectrum-Banner--info'));
  });

  it('supports corner placement', () => {
    let tree = shallow(<Banner corner />);
    assert(tree.hasClass('spectrum-Banner--corner'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Banner className="myClass" />);
    assert(tree.hasClass('myClass'));
    assert(tree.hasClass('spectrum-Banner'));
  });

  it('supports additional properties', () => {
    const tree = shallow(<Banner data-foo />);
    assert.equal(tree.prop('data-foo'), true);

  });
});
