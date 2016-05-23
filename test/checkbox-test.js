import React from 'react';
import expect from 'expect';
import Checkbox from '../components/Checkbox';
import { shallow } from 'enzyme';

describe('Checkbox', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Checkbox />);
    expect(tree.prop('inputType')).toBe('checkbox');
    expect(tree.prop('aria-checked')).toNotExist();
    expect(tree.prop('className')).toBe('coral-Checkbox');
    expect(tree.prop('inputClassName')).toBe('coral-Checkbox-input');
    expect(tree.prop('markClassName')).toBe('coral-Checkbox-checkmark');
    expect(tree.prop('labelClassName')).toBe('coral-Checkbox-description');
  });

  it('supports indeterminate', () => {
    // Render the Checkbox AND it's SwitchBase component and make sure overriding
    // aria-checked happens properly.
    let tree = shallow(<Checkbox indeterminate />);
    let innerTree = tree.shallow();
    expect(tree.prop('aria-checked')).toBe('mixed');
    expect(innerTree.prop('aria-checked')).toBe('mixed');

    tree.setProps({ 'indeterminate': false });
    innerTree = tree.shallow();
    expect(tree.prop('aria-checked')).toNotExist();
    expect(innerTree.prop('aria-checked')).toBe(false);

    tree.setProps({ 'checked': true });
    innerTree = tree.shallow();
    expect(tree.prop('aria-checked')).toNotExist();
    expect(innerTree.prop('aria-checked')).toBe(true);
  });
});
