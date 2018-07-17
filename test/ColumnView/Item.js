import assert from 'assert';
import Item from '../../src/ColumnView/js/Item';
import React from 'react';
import {shallow} from 'enzyme';

describe('Column Item', () => {
  let renderItem, item;

  before(function () {
    item = {
      item: {label: 'Test 1', children: []},
      hasChildren: true
    };
    renderItem = function () { <span />; };
  });

  it('sets the correct branch classes based on props', () => {
    const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection allowsSelection={false} selected isSelected={false} />);
    assert(tree.hasClass('spectrum-AssetList-item'));
    assert(tree.hasClass('is-branch-selectable'));
    assert(tree.hasClass('is-branch'));
    assert(tree.hasClass('is-navigated'));
    assert(!tree.hasClass('is-selected'));
    assert.equal(tree.find('Checkbox').length, 0);
  });

  it('sets the correct selected classes based on props', () => {
    const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection={false} allowsSelection={false} isSelected selected />);
    assert(tree.hasClass('spectrum-AssetList-item'));
    assert(!tree.hasClass('is-branch-selectable'));
    assert(tree.hasClass('is-branch'));
    assert(!tree.hasClass('is-navigated'));
    assert(tree.hasClass('is-selected'));
  });

  it('renders a checkbox when with branch selection', async () => {
    const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection allowsSelection isSelected selected />);
    assert.equal(tree.find('Checkbox').length, 1);
  });

  it('renders a checkbox without branch selection', async () => {
    item.hasChildren = false;
    const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection={false} allowsSelection />);
    assert.equal(tree.find('Checkbox').length, 1);
    item.hasChildren = true;
  });
});
