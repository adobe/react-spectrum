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
import {List} from '../../src/List';
import {Menu, MenuItem} from '../../src/Menu';
import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('Menu', () => {
  it('renders a List with correct className', () => {
    let tree = mount(<Menu className="bell" />);
    let lists = tree.find(List);
    assert.equal(lists.length, 1);
    let list = lists.at(0);
    assert(list.find('.bell').length > 0);

    tree.unmount();
  });

  it('supports onClick event', () => {
    let onClickSpy = sinon.spy();
    let tree = mount(<Menu onClick={onClickSpy}><MenuItem>Foo</MenuItem></Menu>);
    tree.find(MenuItem).simulate('click');
    assert(onClickSpy.calledOnce);

    tree.unmount();
  });
});
