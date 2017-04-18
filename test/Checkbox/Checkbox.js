import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import Checkbox from '../../src/Checkbox';

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
    const tree = shallow(<Checkbox indeterminate />);
    let innerTree = tree.shallow();
    expect(tree.prop('aria-checked')).toBe('mixed');
    expect(innerTree.prop('aria-checked')).toBe('mixed');

    tree.setProps({ indeterminate: false });
    innerTree = tree.shallow();
    expect(tree.prop('aria-checked')).toNotExist();
    expect(innerTree.prop('aria-checked')).toBe(false);

    tree.setProps({ checked: true });
    innerTree = tree.shallow();
    expect(tree.prop('aria-checked')).toNotExist();
    expect(innerTree.prop('aria-checked')).toBe(true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Checkbox className="foo" />);
    expect(tree.hasClass('foo')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Checkbox foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
