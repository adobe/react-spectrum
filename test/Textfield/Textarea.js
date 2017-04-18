import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Textarea from '../../src/Textfield/js/Textarea';

describe('Textarea', () => {
  it('default', () => {
    const tree = shallow(<Textarea />);
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--multiline');
    expect(tree.prop('aria-invalid')).toBe(false);
  });

  it('supports quiet variation', () => {
    const tree = shallow(<Textarea quiet />);
    expect(tree.prop('className'))
      .toBe('coral-Textfield coral-Textfield--multiline coral-Textfield--quiet');
    tree.setProps({quiet: false});
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--multiline');
  });

  it('supports name', () => {
    const tree = shallow(<Textarea name="foo" />);
    expect(tree.prop('name')).toBe('foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<Textarea />);
    expect(tree.prop('disabled')).toNotExist();
    expect(tree.prop('aria-disabled')).toBe(false);
    tree.setProps({disabled: true});
    expect(tree.prop('disabled')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(true);
  });

  it('supports required', () => {
    const tree = shallow(<Textarea />);
    expect(tree.prop('aria-required')).toBe(false);
    tree.setProps({required: true});
    expect(tree.prop('aria-required')).toBe(true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Textarea />);
    expect(tree.prop('aria-readonly')).toBe(false);
    tree.setProps({readOnly: true});
    expect(tree.prop('aria-readonly')).toBe(true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Textarea invalid />);
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--multiline is-invalid');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Textarea className="myClass" />);
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--multiline myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Textarea foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
