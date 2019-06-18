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
import Label from '../../src/Label';
import React from 'react';
import {shallow} from 'enzyme';

describe('Label', () => {
  it('supports the large size', () => {
    const tree = shallow(<Label size="L">Testing</Label>);
    assert(tree.hasClass('spectrum-Label--large'));
  });

  it('supports variants, default grey', () => {
    let tree = shallow(<Label variant="red">Testing</Label>);
    assert(tree.hasClass('spectrum-Label--red'));

    tree = shallow(<Label>Testing</Label>);
    assert(tree.hasClass('spectrum-Label--grey'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Label className="myClass">Testing</Label>);
    assert(tree.hasClass('myClass'));
    assert(tree.hasClass('spectrum-Label'));
  });

  it('supports additional properties', () => {
    const tree = shallow(<Label data-foo>Testing</Label>);
    assert.equal(tree.prop('data-foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Label>My Link</Label>);
    assert.equal(tree.childAt(0).text(), 'My Link');
  });
});
