import React from 'react';
import expect from 'expect';
import Radio from '../components/Radio';
import { shallow } from 'enzyme';

describe('Radio', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Radio label="React" />);
    expect(tree.prop('className')).toBe('coral-Radio');
    const input = findInput(tree);
    expect(input.prop('type')).toBe('radio');
    expect(input.prop('className')).toBe('coral-Radio-input');
    expectChecked(tree, false);
    const checkmark = findCheckmark(tree);
    expect(checkmark.prop('className')).toBe('coral-Radio-checkmark');
    const label = findLabel(tree);
    expect(label.prop('className')).toBe('coral-Radio-description');
    expect(label.children().node).toBe('React');
  });

  it('uncontrolled radio will toggle', () => {
    const tree = shallow(<Radio label="React" defaultChecked={ false } />);
    findInput(tree).simulate('change', { target: { checked: true } });
    expectChecked(tree, true);
  });

  it('controlled radio won\'t toggle', () => {
    const tree = shallow(<Radio label="React" checked />);
    findInput(tree).simulate('change', { target: { checked: false } });
    expectChecked(tree, true);
  });

  it('supports defaultChecked and checked', () => {
    let tree = shallow(<Radio label="React" defaultChecked />);
    expect(findInput(tree).prop('defaultChecked')).toBe(true);
    expectChecked(tree, true);
    tree = shallow(<Radio label="React" checked />);
    expect(findInput(tree).prop('defaultChecked')).toBe(false);
    expectChecked(tree, true);
  });

  it('supports name', () => {
    let tree = shallow(<Radio label="React" name="foo" />);
    expect(findInput(tree).prop('name')).toBe('foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<Radio label="React" />);
    expect(findInput(tree).prop('disabled')).toNotExist();
    expect(tree.prop('aria-disabled')).toBe(false);
    tree.setProps({ disabled: true });
    expect(findInput(tree).prop('disabled')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(true);
  });

  it('supports required', () => {
    const tree = shallow(<Radio label="React" />);
    expect(tree.prop('aria-required')).toBe(false);
    tree.setProps({ required: true });
    expect(tree.prop('aria-required')).toBe(true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Radio label="React" />);
    expect(tree.prop('aria-readonly')).toBe(false);
    tree.setProps({ readOnly: true });
    expect(tree.prop('aria-readonly')).toBe(true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Radio label="React" invalid />);
    expect(tree.prop('className')).toBe('coral-Radio is-invalid');
  });

  it('supports children', () => {
    const tree = shallow(<Radio label="React"><div>My Custom Content</div></Radio>);
    const child = findLabel(tree);
    expect(child).toExist();
    expect(child.childAt(1).children().node).toBe('My Custom Content');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Radio label="React" className="myClass" />);
    expect(tree.prop('className')).toBe('coral-Radio myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Radio label="React" foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});

const findInput = tree => tree.find('input');
const findCheckmark = tree => tree.find('.coral-Radio-checkmark');
const findLabel = tree => tree.find('.coral-Radio-description');

const expectChecked = (tree, checked) => {
  const input = findInput(tree);
  expect(input.prop('checked')).toBe(checked);
  expect(input.prop('aria-checked')).toBe(checked);
};
