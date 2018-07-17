import assert from 'assert';
import React from 'react';
import Rule from '../../src/Rule';
import {shallow} from 'enzyme';

describe('Rule', function () {
  it('should render an hr element', function () {
    let tree = shallow(<Rule />);
    assert.equal(tree.type(), 'hr');
    assert.equal(tree.prop('className'), 'spectrum-Rule spectrum-Rule--large');
  });

  it('should render medium size', function () {
    let tree = shallow(<Rule variant="medium" />);
    assert.equal(tree.prop('className'), 'spectrum-Rule spectrum-Rule--medium');
  });

  it('should render small size', function () {
    let tree = shallow(<Rule variant="small" />);
    assert.equal(tree.prop('className'), 'spectrum-Rule spectrum-Rule--small');
  });

  it('should allow custom classes', function () {
    let tree = shallow(<Rule className="custom-class" />);
    assert.equal(tree.prop('className'), 'spectrum-Rule spectrum-Rule--large custom-class');
  });

  it('should allow custom DOM props', function () {
    let tree = shallow(<Rule aria-label="label" />);
    assert.equal(tree.prop('aria-label'), 'label');
  });
});
