import React from 'react';
import expect from 'expect';
import Checkbox from '../components/Checkbox';
import { shallow } from 'enzyme';

describe('Checkbox', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Checkbox label="React" />);
    expect(tree.prop('className')).toBe('coral-Checkbox');
    const input = findInput(tree);
    expect(input.prop('type')).toBe('checkbox');
    expect(input.prop('className')).toBe('coral-Checkbox-input');
    expectChecked(tree, false);
    const checkmark = findCheckmark(tree);
    expect(checkmark.prop('className')).toBe('coral-Checkbox-checkmark');
    const label = findLabel(tree);
    expect(label.prop('className')).toBe('coral-Checkbox-description');
    expect(label.children().node).toBe('React');
  });

  it('uncontrolled checkbox will toggle', () => {
    const tree = shallow(<Checkbox label="React" defaultChecked />);
    findInput(tree).simulate('change', { target: { checked: false } });
    expectChecked(tree, false);
  });

  it('controlled checkbox won\'t toggle', () => {
    const tree = shallow(<Checkbox label="React" checked />);
    findInput(tree).simulate('change', { target: { checked: false } });
    expectChecked(tree, true);
  });

  it('supports defaultChecked and checked', () => {
    let tree = shallow(<Checkbox label="React" defaultChecked />);
    expect(findInput(tree).prop('defaultChecked')).toBe(true);
    expectChecked(tree, true);
    tree = shallow(<Checkbox label="React" checked />);
    expect(findInput(tree).prop('defaultChecked')).toBe(false);
    expectChecked(tree, true);
  });

  it('supports name', () => {
    let tree = shallow(<Checkbox label="React" name="foo" />);
    expect(findInput(tree).prop('name')).toBe('foo');
  });

  it('supports indeterminate', () => {
    let tree = shallow(<Checkbox label="React" indeterminate />);
    expect(findInput(tree).prop('aria-checked')).toBe('mixed');
  });

  it('supports disabled', () => {
    const tree = shallow(<Checkbox label="React" />);
    expect(findInput(tree).prop('disabled')).toNotExist();
    expect(tree.prop('aria-disabled')).toBe(false);
    tree.setProps({ disabled: true });
    expect(findInput(tree).prop('disabled')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(true);
  });

  it('supports required', () => {
    const tree = shallow(<Checkbox label="React" />);
    expect(tree.prop('aria-required')).toBe(false);
    tree.setProps({ required: true });
    expect(tree.prop('aria-required')).toBe(true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Checkbox label="React" />);
    expect(tree.prop('aria-readonly')).toBe(false);
    tree.setProps({ readOnly: true });
    expect(tree.prop('aria-readonly')).toBe(true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Checkbox label="React" invalid />);
    expect(tree.prop('className')).toBe('coral-Checkbox is-invalid');
  });

  it('supports children', () => {
    const tree = shallow(<Checkbox label="React"><div>My Custom Content</div></Checkbox>);
    const child = findLabel(tree);
    expect(child).toExist();
    expect(child.childAt(1).children().node).toBe('My Custom Content');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Checkbox label="React" className="myClass" />);
    expect(tree.prop('className')).toBe('coral-Checkbox myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Checkbox label="React" foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});

const findInput = tree => tree.find('input');
const findCheckmark = tree => tree.find('.coral-Checkbox-checkmark');
const findLabel = tree => tree.find('.coral-Checkbox-description');

const expectChecked = (tree, checked) => {
  const input = findInput(tree);
  expect(input.prop('checked')).toBe(checked);
  expect(input.prop('aria-checked')).toBe(checked);
};
