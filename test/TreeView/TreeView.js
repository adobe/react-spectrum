import assert from 'assert';
import {DragTarget, EditableCollectionView, IndexPath} from '@react/collection-view';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';
import {TestDataSource} from './TreeViewDataSource';
import TreeItem from '../../src/TreeView/js/TreeItem';
import {TreeView} from '../../src/TreeView';

describe('TreeView', function () {
  it('should render an EditableCollectionView', function () {
    let wrapper = shallow(<TreeView />);
    let collection = wrapper.find(EditableCollectionView);

    assert.equal(wrapper.length, 1);
    assert.equal(collection.length, 1);
  });

  describe('Accessibility implementation', () => {
    it('should have role="tree"', function () {
      let wrapper = shallow(<TreeView />);

      assert.equal(wrapper.prop('role'), 'tree');
    });

    it('should include aria-multiselectable prop when allowsSelection and allowsMultipleSelection are true', function () {
      let wrapper = shallow(<TreeView />);

      assert(!wrapper.prop('aria-multiselectable'));

      wrapper.setProps({allowsSelection: true});

      assert(!wrapper.prop('aria-multiselectable'));

      wrapper.setProps({allowsMultipleSelection: true});

      assert.equal(wrapper.prop('aria-multiselectable'), true);
    });

    it('should render items when mounted', async () => {
      let dataSource = new TestDataSource;
      await dataSource.loadData();
      let renderItem = (item) => <span>{item.name}</span>;
      let wrapper = mount(<TreeView
        dataSource={dataSource}
        renderItem={renderItem}
        allowsSelection />);
      wrapper.update();
      await sleep(1);
      await dataSource.expandItem(dataSource.getItem(0, 0).item);
      let collection = wrapper.find(EditableCollectionView);
      let node = collection.render().find('a').first();
      assert(node.hasClass('spectrum-TreeView-itemLink'));
      assert.equal(node.attr('aria-expanded'), 'true');
      assert.equal(node.attr('aria-setsize'), '2');
      assert.equal(node.attr('aria-posinset'), '1');
      assert.equal(node.attr('aria-level'), '1');
      assert.equal(node.attr('role'), 'treeitem');
      assert.equal(node.attr('tabindex'), '0');
      assert.equal(node.attr('id'), wrapper.instance().treeId + '-0-0');
      wrapper.unmount();
    });
  });

  describe('renderItemView', function () {
    it('should render a toggleable tree item', function () {
      let renderItem = (item) => <span>{item.name}</span>;
      let wrapper = shallow(<TreeView renderItem={renderItem} />);
      let item = wrapper.wrap(wrapper.instance().renderItemView('item', {hasChildren: true, isToggleable: true, item: 'world'}));

      assert.equal(item.type(), TreeItem);
      assert.deepEqual(item.prop('content'), {hasChildren: true, isToggleable: true, item: 'world'});
      assert.equal(item.prop('renderItem'), renderItem);
    });
  });

  describe('getDropTarget', function () {
    it('should call the delegate shouldAcceptDrop function', async function () {
      let delegate = {
        shouldAcceptDrop(item) {
          return item.name === 'Root 1';
        }
      };

      let dataSource = new TestDataSource;
      await dataSource.loadData();

      let wrapper = shallow(<TreeView delegate={delegate} dataSource={dataSource} />);
      wrapper.instance().collection = {
        getItem(indexPath) {
          return dataSource.getItem(indexPath.section, indexPath.index);
        }
      };

      let target = new DragTarget('item', new IndexPath(0, 0));

      assert.equal(wrapper.instance().getDropTarget(target), target);
      assert.equal(wrapper.instance().getDropTarget(new DragTarget('item', new IndexPath(0, 1))), null);
    });
  });

  describe('onToggle event callback', function () {
    it('should fire for items with isToggleable: true && hasChildren: true', async function () {
      let dataSource = new TestDataSource;
      await dataSource.loadData();

      let onToggleItem = sinon.spy();
      sinon.stub(dataSource, 'toggleItem');

      let wrapper = shallow(<TreeView dataSource={dataSource} onToggleItem={onToggleItem} />);
      let item = wrapper.wrap(wrapper.instance().renderItemView('item', dataSource.getItem(0, 0)));

      item.simulate('toggle');
      assert.equal(dataSource.toggleItem.calledOnce, true);
      assert.equal(onToggleItem.calledOnce, true);
    });

    it('should not fire for items with isToggleable: false || hasChildren: false', async function () {
      let dataSource = new TestDataSource;
      await dataSource.loadData();

      let onToggleItem = sinon.spy();
      sinon.stub(dataSource, 'toggleItem');

      let wrapper = shallow(<TreeView dataSource={dataSource} onToggleItem={onToggleItem} />);
      let item = wrapper.wrap(wrapper.instance().renderItemView('item', dataSource.getItem(0, 1)));

      item.simulate('toggle');
      assert.equal(dataSource.toggleItem.calledOnce, true);
      assert.equal(onToggleItem.called, false);

      let content = dataSource.getItem(0, 0);
      content.isToggleable = false;
      item = wrapper.wrap(wrapper.instance().renderItemView('item', content));

      item.simulate('toggle');
      assert.equal(dataSource.toggleItem.calledTwice, true);
      assert.equal(onToggleItem.called, false);
    });
  });

  describe('onKeyDown event callback', function () {
    it('should fire for items', async function () {
      let dataSource = new TestDataSource;
      await dataSource.loadData();

      let onKeyDown = sinon.spy();
      let keydownCalls = 0;
      sinon.spy(dataSource, 'expandItem');
      sinon.spy(dataSource, 'collapseItem');

      let renderItem = (item) => <span>{item.name}</span>;

      let wrapper = shallow(<TreeView dataSource={dataSource} renderItem={renderItem} onKeyDown={onKeyDown} />);
      let focusItem = sinon.stub();
      let scrollToItem = sinon.stub();
      wrapper.instance().collection = {
        scrollToItem,
        focusItem
      };

      let focusedItem = dataSource.getItem(0, 0);
      wrapper.wrap(wrapper.instance().renderItemView('item', focusedItem));

      let focusedItemStub = sinon.stub(wrapper.instance(), 'focusedItem');
      focusedItemStub.get(() => focusedItem.item);

      wrapper.simulate('keydown', {key: 'ArrowRight', preventDefault: () => {}});
      assert.equal(dataSource.expandItem.calledOnce, true);
      assert.deepEqual(dataSource.expandItem.getCall(0).args[0], focusedItem.item);
      assert.equal(onKeyDown.callCount, ++keydownCalls);

      await sleep(100);

      wrapper.simulate('keydown', {key: 'ArrowRight', preventDefault: () => {}});
      assert.equal(focusItem.callCount, 1);
      assert.deepEqual(focusItem.getCall(0).args[0], new IndexPath(0, 1));
      assert.equal(scrollToItem.callCount, 1);
      assert.deepEqual(scrollToItem.getCall(0).args[0], new IndexPath(0, 1));
      assert.equal(onKeyDown.callCount, ++keydownCalls);

      wrapper.simulate('keydown', {key: 'ArrowLeft', preventDefault: () => {}});
      assert.equal(dataSource.collapseItem.calledOnce, true);
      assert.deepEqual(dataSource.collapseItem.getCall(0).args[0], focusedItem.item);
      assert.equal(onKeyDown.callCount, ++keydownCalls);

      await dataSource.expandItem(focusedItem.item);
      focusedItemStub.get(() => dataSource.getItem(0, 2).item);

      wrapper.simulate('keydown', {key: 'ArrowLeft', preventDefault: () => {}});
      assert.equal(focusItem.callCount, 2);
      assert.deepEqual(focusItem.getCall(1).args[0], new IndexPath(0, 0));
      assert.equal(scrollToItem.callCount, 2);
      assert.deepEqual(scrollToItem.getCall(1).args[0], new IndexPath(0, 0));
      assert.equal(onKeyDown.callCount, ++keydownCalls);

      wrapper.simulate('keydown', {key: 'End', preventDefault: () => {}});
      assert.equal(focusItem.callCount, 3);
      assert.deepEqual(focusItem.getCall(2).args[0], new IndexPath(0, 3));
      assert.equal(scrollToItem.callCount, 3);
      assert.deepEqual(scrollToItem.getCall(2).args[0], new IndexPath(0, 3));
      assert.equal(onKeyDown.callCount, ++keydownCalls);

      wrapper.simulate('keydown', {key: 'Home', preventDefault: () => {}});
      assert.equal(focusItem.callCount, 4);
      assert.deepEqual(focusItem.getCall(3).args[0], new IndexPath(0, 0));
      assert.equal(scrollToItem.callCount, 4);
      assert.deepEqual(scrollToItem.getCall(3).args[0], new IndexPath(0, 0));
      assert.equal(onKeyDown.callCount, ++keydownCalls);
    });
  });
});
