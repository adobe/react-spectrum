import React from 'react';
import assert from 'assert';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {Tab} from '../../src/TabList';

describe('Tab', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Tab />);
    assert.equal(tree.prop('className'), 'coral-Tab');
    assert.equal(tree.prop('role'), 'tab');
    assert.equal(tree.prop('tabIndex'), '0');
    assert.equal(tree.prop('aria-invalid'), false);
    assert.equal(tree.prop('aria-disabled'), false);
    assert.equal(tree.prop('aria-selected'), false);
    assert.equal(tree.prop('selected'), false);
    assert.equal(tree.prop('disabled'), false);
  });

  it('supports tabIndex', () => {
    const tree = shallow(<Tab tabIndex="10" />);
    assert.equal(tree.prop('tabIndex'), '10');
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
    const tree = mount(<Tab icon="add" />);
    const child = tree.find('.coral-Icon');
    assert.equal(child.length, 1);
  });

  it('supports disabled', () => {
    const spy = sinon.spy();
    const tree = shallow(<Tab onClick={spy} disabled />);
    assert.equal(tree.prop('disabled'), true);
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
});
