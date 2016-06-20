import React from 'react';
import expect from 'expect';
import TD from '../src/TD';
import { shallow } from 'enzyme';

describe('TD', () => {
  it('supports additional classNames', () => {
    const tree = shallow(render({ className: 'myClass' }));
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(render({ foo: true }));
    expect(tree.prop('foo')).toBe(true);
  });

  it('supports children', () => {
    const tree = shallow(render({ children: 'Foo' }));
    expect(tree.children().node).toBe('Foo');
  });
});

const render = ({ children, ...otherProps }) => (
  <TD { ...otherProps }>{ children }</TD>
);
