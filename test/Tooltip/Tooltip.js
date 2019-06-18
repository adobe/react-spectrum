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
import Tooltip from '../../src/Tooltip';

describe('Tooltip', () => {
  it('supports different placements', () => {
    const tree = shallow(<Tooltip placement="top" />);
    assert(tree.hasClass('spectrum-Tooltip--top'));
  });

  it('supports different variants', () => {
    const tree = shallow(<Tooltip variant="info" />);
    assert(tree.hasClass('spectrum-Tooltip--info'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Tooltip className="foo" />);
    assert(tree.hasClass('foo'));
  });

  it('supports children', () => {
    const tree = shallow(<Tooltip>oh hey</Tooltip>);
    assert.equal(tree.find('.spectrum-Tooltip-label').prop('children'), 'oh hey');
  });

  it('has WAI-ARIA role="tooltip"', () => {
    const tree = shallow(<Tooltip>oh hey</Tooltip>);
    assert.equal(tree.prop('role'), 'tooltip');
  });
});
