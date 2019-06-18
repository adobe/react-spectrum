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
import {ListItem} from '../../src/List';
import {MenuItem} from '../../src/Menu';
import React from 'react';
import {shallow} from 'enzyme';

describe('MenuItem', () => {
  it('should be a ListItem', () => {
    const tree = shallow(<MenuItem />);
    assert.equal(tree.find(ListItem).length, 1);
  });
  it('should accept a label', () => {
    const tree = shallow(<MenuItem label="foo" />);
    let items = tree.find(ListItem);
    assert.equal(items.length, 1);
    assert.equal(items.at(0).prop('label'), 'foo');
  });
});
