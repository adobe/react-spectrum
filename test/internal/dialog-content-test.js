import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import DialogContent from '../../src/internal/DialogContent';

describe('DialogContent', () => {
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

const render = props => (
  <DialogContent { ...props } />
);
