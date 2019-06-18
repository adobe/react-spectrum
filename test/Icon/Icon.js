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
import Bell from '../../src/Icon/Bell';
import Bell18 from '@react/react-spectrum-icons/dist/Bell/18';
import Bell24 from '@react/react-spectrum-icons/dist/Bell/24';
import Icon from '../../src/Icon';
import React from 'react';
import {shallow} from 'enzyme';

describe('Icon', () => {
  it('supports icons', () => {
    const tree = shallow(<Bell />);
    assert.equal(tree.type(), Icon);
    assert.equal(typeof tree.prop('icon'), 'object');
  });

  it('supports multiple sizes', () => {
    const tree = shallow(<Icon icon={Bell18} size="L" />);
    assert.equal(tree.prop('className'), 'spectrum-Icon spectrum-Icon--sizeL');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Icon icon={Bell18} className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Icon spectrum-Icon--sizeM myClass');
  });

  it('no alt specificed. Icon is hidden from AT', () => {
    const tree = shallow(<Icon icon={Bell18} className="myClass" />);
    assert.equal(tree.prop('aria-hidden'), true);
  });

  it('alt text gets rendered appropriately', () => {
    let tree = shallow(<Icon icon={Bell18} className="myClass" alt="Test" />);
    assert.equal(tree.prop('aria-label'), 'Test');
    assert.ifError(tree.prop('aria-hidden'));
    tree = shallow(<Icon icon={Bell18} className="myClass" alt="Test" aria-hidden />);
    assert.equal(tree.prop('aria-label'), 'Test');
    assert.equal(tree.prop('aria-hidden'), true);
  });

  it('is backward compatible with aria-label property', () => {
    let tree = shallow(<Icon icon={Bell18} className="myClass" aria-label="Test" />);
    assert.equal(tree.prop('aria-label'), 'Test');
    assert.ifError(tree.prop('aria-hidden'));
    tree = shallow(<Icon icon={Bell18} className="myClass" aria-label="Test" aria-hidden />);
    assert.equal(tree.prop('aria-label'), 'Test');
    assert.equal(tree.prop('aria-hidden'), true);
  });

  it('aria-label should take precedence over alt', () => {
    let tree = shallow(<Icon icon={Bell18} className="myClass" aria-label="foo" alt="bar" />);
    assert.equal(tree.prop('aria-label'), 'foo', 'aria-label takes precedence over alt');
    assert.ifError(tree.prop('aria-hidden'));
  });

  it('switches between sizes appropriately', () => {
    let tree = shallow(<Icon icon={{18: Bell18, 24: Bell24}} size="L" />);
    assert.equal(tree.prop('viewBox'), Bell18.props.viewBox);

    tree = shallow(<Icon icon={{18: Bell18, 24: Bell24}} size="M" />);
    assert.equal(tree.prop('viewBox'), Bell24.props.viewBox);
  });
});
