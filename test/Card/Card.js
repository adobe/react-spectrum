import assert from 'assert';
import {Card} from '../../src/Card';
import Checkbox from '../../src/Checkbox/js/Checkbox';
import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('Card', () => {
  let tree;
  afterEach(() => {
    if (tree) {
      tree.unmount();
    }
  });
  it('should display a checkbox on hover', () => {
    tree = mount(<Card><div style={{height: 136 + 'px', width: 280 + 'px'}} /></Card>);
    tree.simulate('mouseover');
    const checkboxDiv = tree.find('.spectrum-Card-quickActions');
    const checkbox = checkboxDiv.find(Checkbox);
    assert.equal(checkbox.exists(), true);
  });

  it('should support selection', () => {
    tree = mount(<Card selected><div style={{height: 136 + 'px', width: 280 + 'px'}} /></Card>);
    const checkboxDiv = tree.find('.spectrum-Card-quickActions');
    const checkbox = checkboxDiv.find(Checkbox);
    assert.equal(checkbox.prop('checked'), true);
  });

  it('should allow selection to be disabled', () => {
    tree = mount(<Card allowsSelection={false}><div style={{height: 136 + 'px', width: 280 + 'px'}} /></Card>);
    const checkboxDiv = tree.find('.spectrum-Card-quickActions');
    assert.equal(checkboxDiv.exists(), false);
  });

  it('should fire event onSelectionChange when supplied', () => {
    let onSelectionChange = sinon.spy();

    tree = mount(<Card onSelectionChange={onSelectionChange}><div style={{height: 136 + 'px', width: 280 + 'px'}} /></Card>);
    let checkbox = tree.find(Checkbox);
    // have to explicitly call the onChange prop, enzyme adapter 15 won't call it for some reason
    checkbox.instance().props.onChange();

    assert(onSelectionChange.called);
  });
});
