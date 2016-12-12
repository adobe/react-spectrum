import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import Wait from '../src/Wait';

describe('Wait', () => {
  it('default', () => {
    const tree = shallow(<Wait />);
    expect(tree.prop('className')).toBe('coral-Wait');
    expect(tree.type()).toBe('div');
  });

  it('supports size L', () => {
    const tree = shallow(<Wait size="L" />);
    expect(tree.prop('className')).toBe('coral-Wait coral-Wait--large');
  });

  it('supports size M', () => {
    const tree = shallow(<Wait size="M" />);
    expect(tree.prop('className')).toBe('coral-Wait coral-Wait--medium');
  });

  it('supports dots variant', () => {
    const tree = shallow(<Wait variant="dots" />);
    expect(tree.prop('className')).toBe('coral-Wait coral-Wait--dots');
  });

  it('supports centered', () => {
    const tree = shallow(<Wait centered />);
    expect(tree.prop('className')).toBe('coral-Wait coral-Wait--centered');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Wait className="myClass" />);
    expect(tree.prop('className')).toBe('coral-Wait myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Wait foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
