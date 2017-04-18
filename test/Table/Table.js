import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Table from '../../src/Table';

describe('Table', () => {
  it('supports hover', () => {
    const tree = shallow(render({hover: true}));
    expect(tree.hasClass('coral-Table--hover')).toBe(true);
  });

  it('supports bordered', () => {
    const tree = shallow(render({bordered: true}));
    expect(tree.hasClass('coral-Table--bordered')).toBe(true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(render({className: 'myClass'}));
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(render({foo: true}));
    expect(tree.prop('foo')).toBe(true);
  });

  it('supports children', () => {
    const tree = shallow(render({children: 'Foo'}));
    expect(tree.children().node).toBe('Foo');
  });
});

const render = ({children, ...otherProps}) => (
  <Table { ...otherProps }>{ children }</Table>
);
