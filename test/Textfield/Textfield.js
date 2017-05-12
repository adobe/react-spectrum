import React from 'react';
import assert from 'assert';
import {shallow} from 'enzyme';
import Textfield from '../../src/Textfield';

describe('Textfield', () => {
  it('default', () => {
    const tree = shallow(<Textfield />);
    assert.equal(tree.prop('className'), 'coral-Textfield');
    assert.equal(tree.prop('aria-invalid'), false);
  });

  it('supports quiet variation', () => {
    const tree = shallow(<Textfield quiet />);
    assert.equal(tree.prop('className'), 'coral-Textfield coral-Textfield--quiet');
    tree.setProps({quiet: false});
    assert.equal(tree.prop('className'), 'coral-Textfield');
  });

  it('supports name', () => {
    const tree = shallow(<Textfield name="foo" />);
    assert.equal(tree.prop('name'), 'foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<Textfield />);
    assert(!tree.prop('disabled'));
    assert.equal(tree.prop('aria-disabled'), false);
    tree.setProps({disabled: true});
    assert.equal(tree.prop('disabled'), true);
    assert.equal(tree.prop('aria-disabled'), true);
  });

  it('supports required', () => {
    const tree = shallow(<Textfield />);
    assert.equal(tree.prop('aria-required'), false);
    tree.setProps({required: true});
    assert.equal(tree.prop('aria-required'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Textfield />);
    assert.equal(tree.prop('aria-readonly'), false);
    tree.setProps({readOnly: true});
    assert.equal(tree.prop('aria-readonly'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Textfield invalid />);
    assert.equal(tree.prop('className'), 'coral-Textfield is-invalid');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Textfield className="myClass" />);
    assert.equal(tree.prop('className'), 'coral-Textfield myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Textfield foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
