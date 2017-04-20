import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Textfield from '../../src/Textfield';
import Textarea from '../../src/Textarea';

describe('Textarea', () => {
  it('should render a Textfield with multiLine = true', () => {
    const tree = shallow(<Textarea />);
    expect(tree.type()).toBe(Textfield);
    expect(tree.prop('multiLine')).toBe(true);
  });

  it('should render a textarea', () => {
    const tree = shallow(<Textfield multiLine />);
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--multiline');
    expect(tree.prop('aria-invalid')).toBe(false);
  });

  it('supports quiet variation', () => {
    const tree = shallow(<Textfield multiLine quiet />);
    expect(tree.prop('className'))
      .toBe('coral-Textfield coral-Textfield--multiline coral-Textfield--quiet');
    tree.setProps({quiet: false});
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--multiline');
  });

  it('supports name', () => {
    const tree = shallow(<Textfield multiLine name="foo" />);
    expect(tree.prop('name')).toBe('foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<Textfield multiLine />);
    expect(tree.prop('disabled')).toNotExist();
    expect(tree.prop('aria-disabled')).toBe(false);
    tree.setProps({disabled: true});
    expect(tree.prop('disabled')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(true);
  });

  it('supports required', () => {
    const tree = shallow(<Textfield multiLine />);
    expect(tree.prop('aria-required')).toBe(false);
    tree.setProps({required: true});
    expect(tree.prop('aria-required')).toBe(true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Textfield multiLine />);
    expect(tree.prop('aria-readonly')).toBe(false);
    tree.setProps({readOnly: true});
    expect(tree.prop('aria-readonly')).toBe(true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Textfield multiLine invalid />);
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--multiline is-invalid');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Textfield multiLine className="myClass" />);
    expect(tree.prop('className')).toBe('coral-Textfield coral-Textfield--multiline myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Textfield multiLine foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
