import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import Well from '../../src/Well';

describe('Well', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<Well className="myClass">Testing</Well>);
    expect(tree.prop('className')).toBe('coral-Well myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Well foo>My Well</Well>);
    expect(tree.prop('foo')).toBe(true);
  });

  it('supports children', () => {
    const tree = shallow(<Well>My Well</Well>);
    expect(tree.children().node).toBe('My Well');
  });
});
