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

  it('supports large', () => {
    const tree = shallow(<Wait large />);
    expect(tree.prop('className')).toBe('coral-Wait coral-Wait--large');
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
