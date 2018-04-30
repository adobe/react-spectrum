import assert from 'assert';
import {DragTarget, EditableCollectionView, IndexPath} from '@react/collection-view';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
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

  describe('renderItemView', function () {
    it('should render a toggleable tree item', function () {
      let renderItem = (item) => <span>{item}</span>;
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
});
