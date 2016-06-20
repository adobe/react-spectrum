import React from 'react';
import expect from 'expect';
import Radio from '../src/Radio';
import { shallow } from 'enzyme';

describe('Radio', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Radio />);
    expect(tree.prop('inputType')).toBe('radio');
    expect(tree.prop('className')).toBe('coral-Radio');
    expect(tree.prop('inputClassName')).toBe('coral-Radio-input');
    expect(tree.prop('markClassName')).toBe('coral-Radio-checkmark');
    expect(tree.prop('labelClassName')).toBe('coral-Radio-description');
  });
});
