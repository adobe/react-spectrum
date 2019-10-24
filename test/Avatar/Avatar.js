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
import Avatar from '../../src/Avatar';
import React from 'react';
import {shallow} from 'enzyme';

describe('Avatar', function () {
  it('should render an avatar image', function () {
    let tree = shallow(<Avatar src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" alt="Avatar" />);
    assert.equal(tree.type(), 'img');
    assert.equal(tree.prop('className'), 'spectrum-Avatar');
    assert.equal(tree.prop('src'), 'https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658');
    assert.equal(tree.prop('alt'), 'Avatar');
  });

  it('should render a disabled avatar', function () {
    let tree = shallow(<Avatar src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" disabled />);
    assert.equal(tree.prop('className'), 'spectrum-Avatar is-disabled');
  });

  it('should support custom classes', function () {
    let tree = shallow(<Avatar src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" className="my-class" />);
    assert.equal(tree.prop('className'), 'spectrum-Avatar my-class');
  });

  it('should support other DOM props', function () {
    let tree = shallow(<Avatar src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" aria-label="Avatar" />);
    assert.equal(tree.prop('aria-label'), 'Avatar');
  });
});
