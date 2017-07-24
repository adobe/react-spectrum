import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import Wait from '../../src/Wait';

describe('Wait', () => {
  it('default', () => {
    const tree = shallow(<Wait />);
    assert.equal(tree.prop('className'), 'spectrum-Wait');
    assert.equal(tree.type(), 'div');
  });

  it('supports size L', () => {
    const tree = shallow(<Wait size="L" />);
    assert.equal(tree.prop('className'), 'spectrum-Wait spectrum-Wait--large');
  });

  it('supports size M', () => {
    const tree = shallow(<Wait size="M" />);
    assert.equal(tree.prop('className'), 'spectrum-Wait spectrum-Wait--medium');
  });

  it('supports dots variant', () => {
    const tree = shallow(<Wait variant="dots" />);
    assert.equal(tree.prop('className'), 'spectrum-Wait spectrum-Wait--dots');
  });

  it('supports centered', () => {
    const tree = shallow(<Wait centered />);
    assert.equal(tree.prop('className'), 'spectrum-Wait spectrum-Wait--centered');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Wait className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Wait myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Wait foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
