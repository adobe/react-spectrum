import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Switch from '../../src/Switch';

describe('Switch', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Switch />);
    expect(tree.prop('inputType')).toBe('checkbox');
    expect(tree.prop('className')).toBe('coral3-Switch');
    expect(tree.prop('inputClassName')).toBe('coral3-Switch-input');
    expect(tree.prop('markClassName')).toBe('coral3-Switch-label');
    expect(tree.prop('renderLabel')).toBe(false);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Switch className="foo" />);
    expect(tree.hasClass('foo')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Switch foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
