import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import {Table} from '../../src/Table';

describe('Table', () => {
  it('supports hover', () => {
    const tree = shallow(render({hover: true}));
    assert.equal(tree.hasClass('coral-Table--hover'), true);
  });

  it('supports bordered', () => {
    const tree = shallow(render({bordered: true}));
    assert.equal(tree.hasClass('coral-Table--bordered'), true);
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
    assert.equal(tree.children().node, 'Foo');
  });
});

const render = ({children, ...otherProps}) => (
  <Table {...otherProps}>{children}</Table>
);
