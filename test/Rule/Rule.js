import assert from 'assert';
import React from 'react';
import Rule from '../../src/Rule';
import {shallow} from 'enzyme';

describe('Rule', function () {
  it('should render an hr element', function () {
    let tree = shallow(<Rule />);
    assert.equal(tree.type(), 'hr');
    assert.equal(tree.prop('className'), 'spectrum-Rule');
  });

  it('should allow custom classes', function () {
    let tree = shallow(<Rule className="custom-class" />);
    assert.equal(tree.prop('className'), 'spectrum-Rule custom-class');
  });

  it('should allow custom DOM props', function () {
    let tree = shallow(<Rule aria-label="label" />);
    assert.equal(tree.prop('aria-label'), 'label');
  });
});
