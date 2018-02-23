import AddIcon from '../../src/Icon/Add';
import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {Tab} from '../../src/TabList';

describe('Tab', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Tab />);
    assert.equal(tree.prop('className'), 'spectrum-TabList-item');
    assert.equal(tree.prop('role'), 'tab');
    assert.equal(tree.prop('aria-invalid'), null);
    assert.equal(tree.prop('aria-disabled'), null);
    assert.equal(tree.prop('aria-selected'), false);
  });

  it('supports selected', () => {
    const tree = shallow(<Tab selected />);
    assert.equal(tree.hasClass('is-selected'), true);
    assert.equal(tree.prop('aria-selected'), true);
  });

  it('support invalid', () => {
    const tree = shallow(<Tab invalid />);
    assert.equal(tree.hasClass('is-invalid'), true);
    assert.equal(tree.prop('aria-invalid'), true);
  });

  it('supports icon', () => {
    const tree = mount(<Tab icon={<AddIcon />} />);
    const child = tree.find(AddIcon);
    assert.equal(child.length, 1);
  });

  it('supports onClick', () => {
    const spy = sinon.spy();
    const tree = shallow(<Tab onClick={spy} />);
    tree.simulate('click');
    assert(spy.called);
  });

  it('supports keyboard activation with Enter or Space ', () => {
    const spy = sinon.spy();
    const tree = shallow(<Tab onClick={spy} />);
    tree.simulate('keypress', {key: 'Enter', preventDefault: () => {}});
    assert(spy.calledOnce);
    tree.simulate('keypress', {key: ' ', preventDefault: () => {}});
    assert(spy.calledTwice);
  });

  it('supports disabled', () => {
    const spy = sinon.spy();
    const tree = shallow(<Tab onClick={spy} disabled />);
    assert.equal(tree.prop('aria-disabled'), true);
    assert.equal(tree.hasClass('is-disabled'), true);
    tree.simulate('click');
    assert(!spy.called);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Tab className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Tab foo />);
    assert.equal(tree.prop('foo'), true);
  });

  it('stops from rendering the props.children as tab content if prop is set', () => {
    const tree = shallow(<Tab renderChildren={false}>foo</Tab>);
    assert.equal(tree.childAt(1).text(), '');
  });

  it('renders the props.children as tab content if no label', () => {
    const tree = shallow(<Tab>foo</Tab>);
    assert.equal(tree.children().childAt(0).text(), 'foo');
  });
});
