import React from 'react';
import expect from 'expect';
import SwitchBase from '../../lib/internal/SwitchBase';
import { shallow } from 'enzyme';

describe('SwitchBase', () => {
  it('has correct defaults', () => {
    const tree = shallow(
      <SwitchBase
        className="coral-Foo"
        inputClassName="coral-Foo-input"
        markClassName="coral-Foo-checkmark"
        labelClassName="coral-Foo-description"
        inputType="bar"
        label="React"
      />
    );
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
    const tree = shallow(<SwitchBase name="foo" />);
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
    const tree = shallow(<SwitchBase invalid />);
    expect(tree.prop('className')).toBe('is-invalid');
  });

  it('supports children', () => {
    const tree = shallow(
      <SwitchBase labelClassName="coral-Foo-description">
        <div>My Custom Content</div>
      </SwitchBase>
    );
    const child = findLabel(tree);
    expect(child).toExist();
    expect(child.childAt(0).text()).toBe('My Custom Content');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<SwitchBase className="myClass" />);
    expect(tree.prop('className')).toBe('myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<SwitchBase foo />);
    expect(tree.prop('foo')).toBe(true);
  });

  it('supports not rendering a label', () => {
    const tree = shallow(
      <SwitchBase
        labelClassName="coral-Foo-description"
        renderLabel={ false }
      />
    );
    expect(findLabel(tree).node).toNotExist();
    tree.setProps({ renderLabel: true });
    expect(findLabel(tree).node).toExist();
  });

  it('supports overriding the input className', () => {
    const tree = shallow(<SwitchBase inputClassName="my-input-class" />);
    const input = tree.find('.my-input-class');
    expect(input.node).toExist();
    expect(input.type()).toBe('input');
  });

  it('supports overriding the mark className', () => {
    const tree = shallow(<SwitchBase markClassName="my-mark-class" />);
    const mark = tree.find('.my-mark-class');
    expect(mark.node).toExist();
    expect(mark.type()).toBe('span');
  });

  it('supports overriding the label className', () => {
    const tree = shallow(<SwitchBase labelClassName="my-label-class" />);
    const mark = tree.find('.my-label-class');
    expect(mark.node).toExist();
    expect(mark.type()).toBe('label');
  });
});

const findInput = tree => tree.find('input');
const findCheckmark = (tree) => tree.find('.coral-Foo-checkmark');
const findLabel = (tree) => tree.find('.coral-Foo-description');

const expectChecked = (tree, checked) => {
  expect(tree.prop('aria-checked')).toBe(checked);
  expect(findInput(tree).prop('checked')).toBe(checked);
};
