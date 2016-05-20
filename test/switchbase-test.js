import React from 'react';
import expect from 'expect';
import SwitchBase from '../components/internal/SwitchBase';
import { shallow } from 'enzyme';

describe('SwitchBase', () => {
  it('has correct defaults', () => {
    const tree = shallow(<SwitchBase elementName="Foo" inputType="bar" label="React" />);
    expect(tree.prop('className')).toBe('coral-Foo');
    const input = findInput(tree);
    expect(input.prop('type')).toBe('bar');
    expect(input.prop('className')).toBe('coral-Foo-input');
    expectChecked(tree, false);
    const checkmark = findCheckmark(tree, 'Foo');
    expect(checkmark.prop('className')).toBe('coral-Foo-checkmark');
    const label = findLabel(tree, 'Foo');
    expect(label.prop('className')).toBe('coral-Foo-description');
    expect(label.children().node).toBe('React');
  });

  it('uncontrolled switchBase will toggle', () => {
    const tree = shallow(<SwitchBase defaultChecked={ false } />);
    findInput(tree).simulate('change', { target: { checked: true } });
    expectChecked(tree, true);
  });

  it('controlled switchBase won\'t toggle', () => {
    const tree = shallow(<SwitchBase checked />);
    findInput(tree).simulate('change', { target: { checked: false } });
    expectChecked(tree, true);
  });

  it('supports defaultChecked and checked', () => {
    let tree = shallow(<SwitchBase defaultChecked />);
    expect(findInput(tree).prop('defaultChecked')).toBe(true);
    expectChecked(tree, true);
    tree = shallow(<SwitchBase checked />);
    expect(findInput(tree).prop('defaultChecked')).toBe(false);
    expectChecked(tree, true);
  });

  it('supports name', () => {
    let tree = shallow(<SwitchBase name="foo" />);
    expect(findInput(tree).prop('name')).toBe('foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<SwitchBase />);
    expect(findInput(tree).prop('disabled')).toNotExist();
    expect(tree.prop('aria-disabled')).toBe(false);
    tree.setProps({ disabled: true });
    expect(findInput(tree).prop('disabled')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(true);
  });

  it('supports required', () => {
    const tree = shallow(<SwitchBase />);
    expect(tree.prop('aria-required')).toBe(false);
    tree.setProps({ required: true });
    expect(tree.prop('aria-required')).toBe(true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<SwitchBase />);
    expect(tree.prop('aria-readonly')).toBe(false);
    tree.setProps({ readOnly: true });
    expect(tree.prop('aria-readonly')).toBe(true);
  });

  it('supports invalid', () => {
    const tree = shallow(<SwitchBase elementName="Foo" invalid />);
    expect(tree.prop('className')).toBe('coral-Foo is-invalid');
  });

  it('supports children', () => {
    const tree = shallow(<SwitchBase elementName="Foo"><div>My Custom Content</div></SwitchBase>);
    const child = findLabel(tree, 'Foo');
    expect(child).toExist();
    expect(child.childAt(0).text()).toBe('My Custom Content');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<SwitchBase elementName="Foo" className="myClass" />);
    expect(tree.prop('className')).toBe('coral-Foo myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<SwitchBase foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});

const findInput = tree => tree.find('input');
const findCheckmark = (tree, classType) => tree.find(`.coral-${ classType }-checkmark`);
const findLabel = (tree, classType) => tree.find(`.coral-${ classType }-description`);

const expectChecked = (tree, checked) => {
  expect(tree.prop('aria-checked')).toBe(checked);
  expect(findInput(tree).prop('checked')).toBe(checked);
};
