import React from 'react';
import expect from 'expect';
import Heading from '../lib/Heading';
import { shallow } from 'enzyme';

describe('Heading', () => {
  it('supports different sizes', () => {
    const tree = shallow(<Heading>Testing</Heading>);
    assertSize(tree, 1);
    changeAndAssertSize(tree, 2);
    changeAndAssertSize(tree, 3);
    changeAndAssertSize(tree, 4);
    changeAndAssertSize(tree, 5);
    changeAndAssertSize(tree, 6);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Heading className="myClass">Testing</Heading>);
    expect(tree.prop('className')).toBe('coral-Heading coral-Heading--1 myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Heading foo>My Heading</Heading>);
    expect(tree.prop('foo')).toBe(true);
  });

  it('supports children', () => {
    const tree = shallow(<Heading classname="myClass">My Heading</Heading>);
    expect(tree.children().node).toBe('My Heading');
  });
});


function changeAndAssertSize(tree, size) {
  tree.setProps({ size });
  assertSize(tree, size);
}

function assertSize(tree, size) {
  expect(tree.type()).toBe(`h${ size }`);
  expect(tree.prop('className')).toBe(`coral-Heading coral-Heading--${ size }`);
}
