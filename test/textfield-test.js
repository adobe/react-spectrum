import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import Textfield from '../src/Textfield';

describe('Textfield', () => {
  it('default', () => {
    const tree = shallow(<Textfield />);
    expect(tree.prop('className')).toBe('coral-Textfield');
    expect(tree.prop('aria-invalid')).toBe(false);
  });

  it('supports quiet variation', () => {
    const tree = shallow(<Textfield quiet />);
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--quiet');
    tree.setProps({ quiet: false });
    expect(tree.prop('className')).toBe('coral-Textfield');
  });

  it('supports name', () => {
    const tree = shallow(<Textfield name="foo" />);
    expect(tree.prop('name')).toBe('foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<Textfield />);
    expect(tree.prop('disabled')).toNotExist();
    expect(tree.prop('aria-disabled')).toBe(false);
    tree.setProps({ disabled: true });
    expect(tree.prop('disabled')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(true);
  });

  it('supports required', () => {
    const tree = shallow(<Textfield />);
    expect(tree.prop('aria-required')).toBe(false);
    tree.setProps({ required: true });
    expect(tree.prop('aria-required')).toBe(true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Textfield />);
    expect(tree.prop('aria-readonly')).toBe(false);
    tree.setProps({ readOnly: true });
    expect(tree.prop('aria-readonly')).toBe(true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Textfield invalid />);
    expect(tree.prop('className')).toBe('coral-Textfield is-invalid');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Textfield className="myClass" />);
    expect(tree.prop('className')).toBe('coral-Textfield myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Textfield foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
