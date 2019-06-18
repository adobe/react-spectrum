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
import {Table} from '../../src/Table';

describe('Table', () => {
  it('supports quiet', () => {
    const tree = shallow(render({quiet: true}));
    assert.equal(tree.hasClass('spectrum-Table--quiet'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(render({className: 'myClass'}));
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(render({'aria-foo': true}));
    assert.equal(tree.prop('aria-foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(render({children: 'Foo'}));
    assert.equal(tree.childAt(0).text(), 'Foo');
  });
});

const render = ({children, ...otherProps}) => (
  <Table {...otherProps}>{children}</Table>
);
