import React from 'react';
import assert from 'assert';
import {shallow} from 'enzyme';
import Switch from '../../src/Switch';

describe('Switch', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Switch />);
    assert.equal(tree.prop('inputType'), 'checkbox');
    assert.equal(tree.prop('className'), 'coral3-Switch');
    assert.equal(tree.prop('inputClassName'), 'coral3-Switch-input');
    assert.equal(tree.prop('markClassName'), 'coral3-Switch-label');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Switch className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Switch foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
