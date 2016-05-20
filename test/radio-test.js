import React from 'react';
import expect from 'expect';
import Radio from '../components/Radio';
import { shallow } from 'enzyme';

describe('Radio', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Radio />);
    expect(tree.prop('inputType')).toBe('radio');
    expect(tree.prop('elementName')).toBe('Radio');
  });
});
