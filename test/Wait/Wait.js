import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import Wait from '../../src/Wait';

describe('Wait', () => {
  it('default', () => {
    const tree = shallow(<Wait />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate');
    assert.equal(tree.type(), 'div');
  });

  it('supports size L', () => {
    const tree = shallow(<Wait size="L" />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate spectrum-Loader--large');
  });

  it('supports size S', () => {
    const tree = shallow(<Wait size="S" />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate spectrum-Loader--small');
  });

  it('supports centered', () => {
    const tree = shallow(<Wait centered />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate react-spectrum-Wait--centered');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Wait className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Wait foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
