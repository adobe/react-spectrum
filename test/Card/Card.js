import assert from 'assert';
import {Card} from '../../src/Card';
import Checkbox from '../../src/Checkbox/js/Checkbox';
import React from 'react';
import {shallow} from 'enzyme';

describe('Card', () => {
  it('should display a checkbox on hover', () => {
    const tree = shallow(<Card><div style={{height: 136 + 'px', width: 280 + 'px'}} /></Card>);
    tree.simulate('mouseover');
    const checkboxDiv = tree.find('.spectrum-Card-quickActions');
    const checkbox = checkboxDiv.find(Checkbox);
    assert.equal(checkbox.exists(), true);
  });

  it('should support selection', () => {
    const tree = shallow(<Card selected><div style={{height: 136 + 'px', width: 280 + 'px'}} /></Card>);
    const checkboxDiv = tree.find('.spectrum-Card-quickActions');
    const checkbox = checkboxDiv.find(Checkbox);
    assert.equal(checkbox.prop('checked'), true);
  });

  it('should allow selection to be disabled', () => {
    const tree = shallow(<Card allowsSelection={false}><div style={{height: 136 + 'px', width: 280 + 'px'}} /></Card>);
    const checkboxDiv = tree.find('.spectrum-Card-quickActions');
    assert.equal(checkboxDiv.exists(), false);
  });
});
