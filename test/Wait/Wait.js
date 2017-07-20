import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import Wait from '../../src/Wait';

describe('Wait', () => {
  it('default', () => {
    const tree = shallow(<Wait />);
    assert.equal(tree.prop('className'), 'coral-Wait');
    assert.equal(tree.type(), 'div');
  });

  it('supports size L', () => {
    const tree = shallow(<Wait size="L" />);
    assert.equal(tree.prop('className'), 'coral-Wait coral-Wait--large');
  });

  it('supports size M', () => {
    const tree = shallow(<Wait size="M" />);
    assert.equal(tree.prop('className'), 'coral-Wait coral-Wait--medium');
  });

  it('supports dots variant', () => {
    const tree = shallow(<Wait variant="dots" />);
    assert.equal(tree.prop('className'), 'coral-Wait coral-Wait--dots');
  });

  it('supports centered', () => {
    const tree = shallow(<Wait centered />);
    assert.equal(tree.prop('className'), 'coral-Wait coral-Wait--centered');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Wait className="myClass" />);
    assert.equal(tree.prop('className'), 'coral-Wait myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Wait foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
