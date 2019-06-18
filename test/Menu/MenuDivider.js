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
import {MenuDivider} from '../../src/Menu';
import React from 'react';
import {shallow} from 'enzyme';

describe('MenuDivider', () => {
  it('should render an li element with role="separator"', () => {
    const tree = shallow(<MenuDivider />);
    assert.equal(tree.find('li').length, 1);
    assert.equal(tree.find('li').prop('role'), 'separator');
  });
});
