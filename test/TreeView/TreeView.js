import assert from 'assert';
import {data, TestDataSource, TreeDS} from './TreeViewDataSource';
import {DragTarget, EditableCollectionView, IndexPath} from '@react/collection-view';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';
import TreeItem from '../../src/TreeView/js/TreeItem';
import {TreeView} from '../../src/TreeView';

describe('TreeView', function () {
  it('should render an EditableCollectionView', function () {
    let ds = new TreeDS;
    let wrapper = shallow(<TreeView dataSource={ds} />);
    let collection = wrapper.find(EditableCollectionView);

    assert.equal(wrapper.length, 1);
    assert.equal(collection.length, 1);
  });

  it('should render some items', async () => {
    let ds = new TestDataSource;
    let renderItem = (item) => <span>{item.name}</span>;
    let wrapper = shallow(
      <TreeView
        dataSource={ds}
        renderItem={renderItem} />
    );
    await sleep(100);
    let collection = wrapper.find(EditableCollectionView);
    assert.equal(collection.prop('dataSource').getSectionLength(0), 2);
    wrapper.unmount();
  });

  it('should work with a TreeDataSource', async () => {
    let ds = new TreeDS;
    let renderItem = (item) => <span>{item.name}</span>;
    let wrapper = shallow(
      <TreeView
        dataSource={ds}
        renderItem={renderItem} />
    );
    await sleep(100);
    let collection = wrapper.find(EditableCollectionView);
    assert.equal(collection.prop('dataSource').getSectionLength(0), 2);
    wrapper.unmount();
  });

  describe('Accessibility implementation', () => {
    it('should have role="tree"', function () {
      let ds = new TreeDS;
      let wrapper = shallow(<TreeView dataSource={ds} />);

      assert.equal(wrapper.prop('role'), 'tree');
    });

    it('should include aria-multiselectable prop when allowsSelection and allowsMultipleSelection are true', function () {
      let ds = new TreeDS;
      let wrapper = shallow(<TreeView dataSource={ds} />);

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
      let wrapper = mount(
        <TreeView
          dataSource={dataSource}
          renderItem={renderItem}
          allowsSelection />
      );
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
      let ds = new TreeDS;
      let renderItem = (item) => <span>{item.name}</span>;
      let wrapper = shallow(<TreeView dataSource={ds} renderItem={renderItem} />);
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

      assert.equal(wrapper.prop('delegate').getDropTarget(target), target);
      assert.equal(wrapper.prop('delegate').getDropTarget(new DragTarget('item', new IndexPath(0, 1))), null);
    });
  });

  describe('onToggleItem event callback', function () {
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

    it('should not call toggleItem on the data source if controlled', async function () {
      let dataSource = new TreeDS;
      let onToggleItem = sinon.spy();

      let wrapper = shallow(<TreeView dataSource={dataSource} onToggleItem={onToggleItem} expandedItems={[data[0]]} />);
      await sleep(100);
      let item = wrapper.wrap(wrapper.instance().renderItemView('item', wrapper.state('dataSource').getItem(0, 0)));

      sinon.stub(wrapper.state('dataSource'), 'toggleItem');

      // collapse
      item.simulate('toggle');
      assert.equal(wrapper.state('dataSource').toggleItem.called, false);
      assert.equal(onToggleItem.calledOnce, true);
      assert.deepEqual(onToggleItem.getCall(0).args, [data[0], false, []]);

      wrapper.setProps({expandedItems: []});
      await sleep(100);

      // expand
      item.simulate('toggle');
      assert.equal(wrapper.state('dataSource').toggleItem.called, false);
      assert.equal(onToggleItem.calledTwice, true);
      assert.deepEqual(onToggleItem.getCall(1).args, [data[0], true, [data[0]]]);
    });
  });

  describe('selection', function () {
    it('should trigger onSelectionChange when the selection changes (uncontrolled)', async function () {
      let dataSource = new TreeDS;
      let onSelectionChange = sinon.spy();
      let wrapper = shallow(<TreeView dataSource={dataSource} onSelectionChange={onSelectionChange} />);
      await sleep(100);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), []);

      wrapper.simulate('selectionChanged', [new IndexPath(0, 0)]);
      assert(onSelectionChange.calledOnce);
      assert.deepEqual(onSelectionChange.getCall(0).args[0], [data[0]]);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 0)]);
    });

    it('should trigger onSelectionChange when the selection changes with defaultSelectedItems (uncontrolled)', async function () {
      let dataSource = new TreeDS;
      let onSelectionChange = sinon.spy();
      let wrapper = shallow(<TreeView dataSource={dataSource} onSelectionChange={onSelectionChange} defaultSelectedItems={[data[0]]} />);
      await sleep(100);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 0)]);

      wrapper.simulate('selectionChanged', [new IndexPath(0, 0), new IndexPath(0, 1)]);
      assert(onSelectionChange.calledOnce);
      assert.deepEqual(onSelectionChange.getCall(0).args[0], [data[0], data[1]]);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 0), new IndexPath(0, 1)]);
    });

    it('should trigger onSelectionChange when the selection changes (controlled)', async function () {
      let dataSource = new TreeDS;
      let onSelectionChange = sinon.spy();
      let wrapper = shallow(<TreeView dataSource={dataSource} onSelectionChange={onSelectionChange} selectedItems={[data[0]]} />);
      await sleep(100);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 0)]);

      wrapper.simulate('selectionChanged', [new IndexPath(0, 0), new IndexPath(0, 1)]);
      assert(onSelectionChange.calledOnce);
      assert.deepEqual(onSelectionChange.getCall(0).args[0], [data[0], data[1]]);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 0)]);
    });

    it('should update selectedIndexPaths when items are expanded', async function () {
      let dataSource = new TreeDS;
      let onSelectionChange = sinon.spy();
      let wrapper = shallow(<TreeView dataSource={dataSource} onSelectionChange={onSelectionChange} selectedItems={[data[0].children[0]]} />);
      await sleep(100);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), []);

      await wrapper.instance().expandItem(data[0]);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 1)]);
    });

    it('should retain invisible defaultSelectedItems on expand', async function () {
      let dataSource = new TreeDS;
      let onSelectionChange = sinon.spy();
      let wrapper = shallow(<TreeView dataSource={dataSource} onSelectionChange={onSelectionChange} defaultSelectedItems={[data[0], data[0].children[0]]} />);
      await sleep(100);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 0)]);

      wrapper.simulate('selectionChanged', [new IndexPath(0, 1)]);
      assert(onSelectionChange.calledOnce);
      assert.deepEqual(onSelectionChange.getCall(0).args[0], [data[0].children[0], data[1]]);

      await wrapper.instance().expandItem(data[0]);

      assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 1), new IndexPath(0, 3)]);
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
