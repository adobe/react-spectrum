import React from 'react';
import expect from 'expect';
import Switch from '../lib/Switch';
import { shallow } from 'enzyme';

describe('Switch', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Switch />);
    expect(tree.prop('inputType')).toBe('checkbox');
    expect(tree.prop('className')).toBe('coral3-Switch');
    expect(tree.prop('inputClassName')).toBe('coral3-Switch-input');
    expect(tree.prop('markClassName')).toBe('coral3-Switch-label');
    expect(tree.prop('renderLabel')).toBe(false);
  });
});
