import React from 'react';
import assert from 'assert';
import {shallow} from 'enzyme';
import Checkbox from '../../src/Checkbox';

describe('Checkbox', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Checkbox />);
    assert.equal(tree.prop('inputType'), 'checkbox');
    assert(!tree.prop('aria-checked'));
    assert.equal(tree.prop('className'), 'coral-Checkbox');
    assert.equal(tree.prop('inputClassName'), 'coral-Checkbox-input');
    assert.equal(tree.prop('markClassName'), 'coral-Checkbox-checkmark');
    assert.equal(tree.prop('labelClassName'), 'coral-Checkbox-description');
  });

  it('supports indeterminate', () => {
    // Render the Checkbox AND it's SwitchBase component and make sure overriding
    // aria-checked happens properly.
    const tree = shallow(<Checkbox indeterminate />);
    let innerTree = tree.shallow();
    assert.equal(tree.prop('aria-checked'), 'mixed');
    assert.equal(innerTree.prop('aria-checked'), 'mixed');

    tree.setProps({indeterminate: false});
    innerTree = tree.shallow();
    assert(!tree.prop('aria-checked'));
    assert.equal(innerTree.prop('aria-checked'), false);

    tree.setProps({checked: true});
    innerTree = tree.shallow();
    assert(!tree.prop('aria-checked'));
    assert.equal(innerTree.prop('aria-checked'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Checkbox className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Checkbox foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
