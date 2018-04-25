import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import SwitchBase from '../../src/Switch/js/SwitchBase';

describe('SwitchBase', () => {
  it('has correct defaults', () => {
    const tree = shallow(
      <SwitchBase
        className="coral-Foo"
        inputClassName="coral-Foo-input"
        markClassName="coral-Foo-checkmark"
        labelClassName="coral-Foo-description"
        inputType="bar"
        label="React" />
    );
    assert.equal(tree.prop('className'), 'coral-Foo');
    const input = findInput(tree);
    assert.equal(input.prop('type'), 'bar');
    assert.equal(input.prop('className'), 'coral-Foo-input');
    expectChecked(tree, false);
    const checkmark = findCheckmark(tree, 'Foo');
    assert.equal(checkmark.prop('className'), 'coral-Foo-checkmark');
    const label = findLabel(tree, 'Foo');
    assert.equal(label.prop('className'), 'coral-Foo-description');
    assert.equal(label.children().text(), 'React');
  });

  it('uncontrolled switchBase will toggle', () => {
    const tree = shallow(<SwitchBase defaultChecked={false} />);
    findInput(tree).simulate('change', {target: {checked: true}});
    expectChecked(tree, true);
  });

  it('controlled switchBase won\'t toggle', () => {
    const tree = shallow(<SwitchBase checked />);
    findInput(tree).simulate('change', {target: {checked: false}});
    expectChecked(tree, true);
  });

  it('supports defaultChecked and checked', () => {
    let tree = shallow(<SwitchBase defaultChecked />);
    expectChecked(tree, true);
    tree = shallow(<SwitchBase checked />);
    assert.equal(findInput(tree).prop('checked'), true);
    assert.equal(findInput(tree).prop('defaultChecked'), undefined);
    expectChecked(tree, true);
  });

  it('supports name', () => {
    const tree = shallow(<SwitchBase name="foo" />);
    assert.equal(findInput(tree).prop('name'), 'foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<SwitchBase />);
    assert(!findInput(tree).prop('disabled'));
    tree.setProps({disabled: true});
    tree.update();
    assert.equal(findInput(tree).prop('disabled'), true);
  });

  it('supports required', () => {
    const tree = shallow(<SwitchBase />);
    assert(!findInput(tree).prop('required'));
    tree.setProps({required: true});
    tree.update();
    assert.equal(findInput(tree).prop('required'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<SwitchBase />);
    assert(!findInput(tree).prop('readOnly'));
    tree.setProps({readOnly: true});
    tree.update();
    assert.equal(findInput(tree).prop('readOnly'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<SwitchBase invalid />);
    assert.equal(tree.prop('className'), 'is-invalid');
    assert.equal(findInput(tree).prop('aria-invalid'), true);
  });

  it('supports children', () => {
    const tree = shallow(
      <SwitchBase labelClassName="coral-Foo-description">
        <div>My Custom Content</div>
      </SwitchBase>
    );
    const child = findLabel(tree);
    assert(child);
    assert.equal(child.childAt(0).text(), 'My Custom Content');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<SwitchBase className="myClass" />);
    assert.equal(tree.prop('className'), 'myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<SwitchBase foo />);
    assert.equal(findInput(tree).prop('foo'), true);
  });

  it('supports not rendering a label', () => {
    const tree = shallow(
      <SwitchBase
        labelClassName="coral-Foo-description"
        renderLabel={false} />
    );
    assert(!findLabel(tree).length);
    tree.setProps({renderLabel: true});
    tree.setProps({label: 'React'});
    assert(findLabel(tree).length);
  });

  it('supports overriding the input className', () => {
    const tree = shallow(<SwitchBase inputClassName="my-input-class" />);
    const input = tree.find('.my-input-class');
    assert(input.getElement());
    assert.equal(input.type(), 'input');
  });

  it('supports overriding the mark className', () => {
    const tree = shallow(<SwitchBase markClassName="my-mark-class" />);
    const mark = tree.find('.my-mark-class');
    assert(mark.getElement());
    assert.equal(mark.type(), 'span');
  });

  it('supports overriding the label className', () => {
    const tree = shallow(<SwitchBase labelClassName="my-label-class" label="React" />);
    const mark = tree.find('.my-label-class');
    assert(mark.getElement());
    assert.equal(mark.type(), 'span');
  });
});

const findInput = tree => tree.find('input');
const findCheckmark = (tree) => tree.find('.coral-Foo-checkmark');
const findLabel = (tree) => tree.find('.coral-Foo-description');

const expectChecked = (tree, checked) => {
  assert.equal(findInput(tree).prop('checked'), checked);
};
