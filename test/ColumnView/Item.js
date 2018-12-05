import {ArrayDataSource} from '@react/collection-view';
import assert from 'assert';
import Item from '../../src/ColumnView/js/Item';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('Column Item', () => {
  let renderItem, item;

  before(function () {
    item = {
      item: {label: 'Test 1', children: []},
      hasChildren: true,
      getItemId: () => 'test-1-item',
      getColumnId: () => 'test-1-column',
      index: 1
    };

    item.parent = {children: new ArrayDataSource([[item, item, item, item, item]])};
    renderItem = function () { <span />; };
  });

  it('sets the correct branch classes based on props', () => {
    const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection allowsSelection={false} selected isSelected={false} />);
    assert(tree.hasClass('spectrum-AssetList-item'));
    assert(tree.hasClass('is-selectable'));
    assert(tree.hasClass('is-branch'));
    assert(tree.hasClass('is-navigated'));
    assert(!tree.hasClass('is-selected'));
    assert.equal(tree.find('Checkbox').length, 0);
  });

  it('sets the correct selected classes based on props', () => {
    const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection={false} allowsSelection={false} isSelected selected />);
    assert(tree.hasClass('spectrum-AssetList-item'));
    assert(!tree.hasClass('is-selectable'));
    assert(tree.hasClass('is-branch'));
    assert(!tree.hasClass('is-navigated'));
    assert(tree.hasClass('is-selected'));
  });

  it('renders a checkbox when with branch selection', () => {
    const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection allowsSelection isSelected selected />);
    assert.equal(tree.find('Checkbox').length, 1);
  });

  it('renders a checkbox without branch selection', () => {
    item.hasChildren = false;
    const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection={false} allowsSelection />);
    assert.equal(tree.find('Checkbox').length, 1);
    item.hasChildren = true;
  });

  it('has ref when mounted', () => {
    const tree = mount(<Item item={item} renderItem={renderItem} allowsBranchSelection allowsSelection isSelected selected />);
    assert(tree.instance().itemRef);
    tree.unmount();
  });

  describe('Accessibility', () => {
    it('should have role=treeitem', () => {
      const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection allowsSelection />);
      assert.equal(tree.prop('role'), 'treeitem');
      assert.equal(tree.prop('aria-labelledby'), 'test-1-item-label');
      assert.equal(tree.find('Checkbox').first().prop('aria-labelledby'), 'test-1-item-label');
    });

    it('supports tabIndex', () => {
      const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection={false} allowsSelection={false} column={{props: {focused: true}}} focused />);
      assert.equal(tree.prop('tabIndex'), 0);
      tree.setProps({focused: false});
      assert.equal(tree.prop('tabIndex'), -1);
      tree.setProps({column: {props: {focused: false}}, focused: true});
      assert.equal(tree.prop('tabIndex'), -1);
      tree.setProps({
        column: {props: {focused: true}},
        focused: false,
        collectionView: {
          focusedIndexPath: null,
          getSectionLength: () => 1
        }
      });
      assert.equal(tree.prop('tabIndex'), 0);
    });

    it('supports aria-selected', () => {
      const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection allowsSelection isSelected selected />);
      assert.equal(tree.prop('aria-selected'), true);
      tree.setProps({selected: false, isSelected: false});
      assert.equal(tree.prop('aria-selected'), false);
      tree.setProps({allowsBranchSelection: false});
      assert(!tree.prop('aria-selected'));
    });

    it('supports aria-level, aria-posinset and aria-setsize', () => {
      const tree = shallow(<Item
        item={item}
        renderItem={renderItem}
        level={3} />
      );
      assert.equal(tree.prop('aria-level'), 4);
      assert.equal(tree.prop('aria-posinset'), 2);
      assert.equal(tree.prop('aria-setsize'), 5);
    });

    it('clicking checkbox should set focus to item', () => {
      const tree = shallow(<Item item={item} renderItem={renderItem} allowsBranchSelection allowsSelection />);
      tree.instance().itemRef = {
        focus: sinon.spy()
      };
      const stopPropagation = sinon.spy();
      const preventDefault = sinon.spy();
      tree.find('Checkbox').simulate('mousedown', {stopPropagation, preventDefault});
      tree.find('Checkbox').simulate('focus', {stopPropagation, preventDefault});
      assert(stopPropagation.calledOnce);
      assert(preventDefault.calledOnce);
      assert(tree.instance().itemRef.focus.calledOnce);
    });

    it('should add aria-owns and aria-describedby for detail view when renderDetail is true', () => {
      const tree = shallow(<Item item={item} detailNode={item} renderItem={renderItem} allowsBranchSelection={false} allowsSelection />);
      assert.equal(tree.prop('aria-owns'), 'test-1-column');
      assert.equal(tree.prop('aria-describedby'), 'test-1-column');
    });
  });
});
