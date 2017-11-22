import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import Switch from '../../src/Switch';

describe('Switch', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Switch />);
    assert.equal(tree.prop('inputType'), 'checkbox');
    assert.equal(tree.prop('className'), 'spectrum-ToggleSwitch');
    assert.equal(tree.prop('inputClassName'), 'spectrum-ToggleSwitch-input');
    assert.equal(tree.prop('markClassName'), 'spectrum-ToggleSwitch-content');
    assert.equal(tree.prop('labelClassName'), 'spectrum-ToggleSwitch-label');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Switch className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Switch foo />);
    assert.equal(tree.prop('foo'), true);
  });

  it('supports ab variant', () => {
    const tree = shallow(<Switch variant="ab" />);
    assert.equal(tree.hasClass('spectrum-ToggleSwitch--ab'), true);
  });
});
