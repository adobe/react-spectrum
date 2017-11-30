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
    const tree = shallow(render({foo: true}));
    assert.equal(tree.prop('foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(render({children: 'Foo'}));
    assert.equal(tree.childAt(0).text(), 'Foo');
  });
});

const render = ({children, ...otherProps}) => (
  <Table {...otherProps}>{children}</Table>
);
