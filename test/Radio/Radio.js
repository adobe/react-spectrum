import assert from 'assert';
import Radio from '../../src/Radio';
import React from 'react';
import {shallow} from 'enzyme';

describe('Radio', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Radio />);
    assert.equal(tree.prop('inputType'), 'radio');
    assert.equal(tree.prop('className'), 'coral-Radio');
    assert.equal(tree.prop('inputClassName'), 'coral-Radio-input');
    assert.equal(tree.prop('markClassName'), 'coral-Radio-checkmark');
    assert.equal(tree.prop('labelClassName'), 'coral-Radio-description');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Radio className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Radio foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
