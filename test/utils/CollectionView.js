/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import CollectionView from '../../src/utils/CollectionView';
import {DragTarget, EditableCollectionView, IndexPath, Point, Size} from '@react/collection-view';
import GridLayout from '../../src/GridView/js/GridLayout';
import ListDataSource from '../../src/ListDataSource';
import {mount, shallow} from 'enzyme';
import Provider from '../../src/Provider';
import React from 'react';
import sinon, {stub} from 'sinon';
import {sleep} from '../utils';
import Wait from '../../src/Wait';


describe('CollectionView', function () {
  class TableDS extends ListDataSource {
    load() {
      return [
        {active: true, name: 'test'},
        {active: false, name: 'foo'},
        {active: true, name: 'bar'},
        {active: false, name: 'baz'}
      ];
    }
  }

  let layout = new GridLayout();
  let ds;
  beforeEach(function () {
    ds = new TableDS;
  });

  function renderItemView(type, data) {
    return <div>{data.name}</div>;
  }

  it('should pass correct props to EditableCollectionView', function () {
    const collectionView = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        canSelectItems
        selectedIndexPaths={[new IndexPath(0, 0)]}
        allowsMultipleSelection />
    );

    assert.equal(collectionView.type(), EditableCollectionView);
    assert.equal(collectionView.prop('dataSource'), ds);
    assert.equal(collectionView.prop('canSelectItems'), true);
    assert.equal(collectionView.prop('allowsMultipleSelection'), true);
    assert.deepEqual(collectionView.prop('selectedIndexPaths'), [new IndexPath(0, 0)]);
  });

  it('should render an item view using props', function () {
    const table = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );
    let wrapper = table.wrap(table.prop('delegate').renderItemView('foo', {name: 'test'}));
    assert.equal(wrapper.html(), '<div>test</div>');
  });

  it('should render a loading-indicator supplementary view', function () {
    const table = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );
    let wrapper = table.wrap(table.prop('delegate').renderSupplementaryView('loading-indicator'));
    assert.equal(wrapper.type(), Wait);
    assert.equal(wrapper.prop('centered'), true);
    assert.equal(wrapper.prop('size'), 'M');
  });

  it('should render a empty-view supplementary view using renderEmptyView prop', function () {
    const table = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        renderEmptyView={() => <div>empty</div>} />
    );
    let wrapper = table.wrap(table.prop('delegate').renderSupplementaryView('empty-view'));
    assert.equal(wrapper.html(), '<div>empty</div>');
  });

  it('should render other supplementary views using a prop', function () {
    const table = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        renderSupplementaryView={() => <div>test</div>} />
    );
    let wrapper = table.wrap(table.prop('delegate').renderSupplementaryView('foo'));
    assert.equal(wrapper.html(), '<div>test</div>');
  });

  it.skip('should reload an empty-view on update', function () {
    let table = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        renderEmptyView={() => <div>empty</div>} />
    );

    let reload = sinon.spy();
    table.instance().collection = {
      relayout() {},
      reloadSupplementaryViewsOfType: reload
    };

    table.setProps({});
    table.update();
    assert.equal(reload.callCount, 1);
    assert.equal(reload.getCall(0).args[0], 'empty-view');
  });

  it('should call performLoad on mount', async function () {
    let load = sinon.spy(ds, 'performLoad');
    shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );

    await sleep(100);
    assert.equal(load.callCount, 1);

    load.restore();
  });

  it('should call performLoad when the data source changes', async function () {
    const table = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );

    await sleep(100);

    let newDS = new TableDS;
    let load = sinon.spy(newDS, 'performLoad');
    table.setProps({dataSource: newDS});

    await sleep(100);
    assert.equal(load.callCount, 1);

    load.restore();
  });

  it('should call performLoad when the reloadData event is emitted by the data source', async function () {
    let load = sinon.spy(ds, 'performLoad');
    shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );

    await sleep(100);
    assert.equal(load.callCount, 1);

    ds.reloadData();
    await sleep(100);
    assert.equal(load.callCount, 2);

    load.restore();
  });

  it('should only relayout if the finished request is the latest request', async function () {
    let i = 0;
    ds.load = async function () {
      // simulate a request taking a certain length of time and requests are made before previous has finished
      await sleep(++i * 50);
      return [];
    };
    let load = sinon.spy(ds, 'performLoad');
    let tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );
    const tableInstance = tree.instance();
    tableInstance.collection = {relayout: function () {}};

    ds.reloadData();
    ds.reloadData();
    await sleep(105); // after 2nd reloadData
    assert.equal(load.callCount, 3);
    assert.equal(tableInstance.isLoading, true);
    await sleep(50); // after 3rd reloadData
    assert.equal(tableInstance.isLoading, false);
  });

  it('should relayout once last request returns even if previous loads haven\'t', async function () {
    let i = 0;
    ds.load = async function () {
      // simulate earlier requests taking longer than subsequent requests
      await sleep(30 - ++i * 10);
      return [];
    };
    let load = sinon.spy(ds, 'performLoad');
    let tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );
    const tableInstance = tree.instance();
    tableInstance.collection = {relayout: function () {}};
    let relayoutSpy = sinon.spy(tableInstance.collection, 'relayout');

    ds.reloadData();
    assert.equal(relayoutSpy.callCount, 1); // + relayout - show wait
    await sleep(15); // after 2nd load finishes
    assert.equal(relayoutSpy.callCount, 2); // + relayout - show results of 2nd load
    assert.equal(load.callCount, 2);
    assert.equal(tableInstance.isLoading, false);
    await sleep(10); // after 1st load finishes
    assert.equal(relayoutSpy.callCount, 2); // should not call relayout after 1st load finishes
  });

  it('should reset hasMore to true when collection data is reloaded', async function () {
    let collectionView = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );
    collectionView.instance().hasMore = false;
    ds.reloadData();
    assert.equal(collectionView.instance().hasMore, true);
  });

  it('should call performSort on the data source when sortDescriptor prop changes', async function () {
    const load = sinon.spy(ds, 'load');
    const performSort = sinon.spy(ds, 'performSort');
    const onSortChange = sinon.spy();
    const table = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        sortDescriptor={{column: 'foo', direction: -1}}
        onSortChange={onSortChange} />
    );

    await sleep(100);
    assert.equal(load.callCount, 1);
    assert.deepEqual(load.getCall(0).args[0], {column: 'foo', direction: -1});

    // Ensure that setting the sort descriptor to an equal sort descriptor does not do anything
    table.setProps({sortDescriptor: {column: 'foo', direction: -1}});
    await sleep(100);
    assert.equal(load.callCount, 1);
    assert.equal(performSort.callCount, 0);

    // Ensure that changing the sort descriptor causes performSort and load to be called
    table.setProps({sortDescriptor: {column: 'bar', direction: 1}});
    await sleep(100);

    assert.equal(performSort.callCount, 1);
    assert.deepEqual(performSort.getCall(0).args[0], {column: 'bar', direction: 1});

    assert.equal(load.callCount, 2);
    assert.deepEqual(load.getCall(1).args[0], {column: 'bar', direction: 1});

    // Ensure that changing the sort descriptor to null works properly
    table.setProps({sortDescriptor: null});
    await sleep(100);

    assert.equal(performSort.callCount, 2);
    assert.deepEqual(performSort.getCall(1).args[0], null);

    assert.equal(load.callCount, 3);
    assert.deepEqual(load.getCall(2).args[0], null);

    load.restore();
    performSort.restore();
  });

  it('should have collection ref when mounted', () => {
    const table = mount(
      <CollectionView
        layout={layout}
        dataSource={ds} />
    );

    assert(table.instance().collection);
    table.unmount();
  });

  it('should render an infiniteScroll collection view', async function () {
    const loadMoreStub = stub(ds, 'loadMore').callsFake(() => {});
    const tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );
    const tableInstance = tree.instance();

    // shallow doesn't render down far enough to make this, so create the collection instance
    tableInstance.collection = {relayout: () => {}, contentOffset: new Point(0, 0), contentSize: new Size(100, 1000), size: new Size(100, 100), dataSource: ds};
    tree.find(EditableCollectionView).simulate('scroll');
    await sleep(100);

    assert.equal(loadMoreStub.callCount, 0);

    tableInstance.collection.contentOffset = new Point(0, 900);
    tree.find(EditableCollectionView).simulate('scroll');
    await sleep(100);

    assert.equal(loadMoreStub.callCount, 1);
  });

  it('should not scroll when isLoading is true', async function () {
    const loadMoreStub = stub(ds, 'loadMore').callsFake(() => {});
    ds.isLoading = true;
    const tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView} />
    );
    const tableInstance = tree.instance();
    tableInstance.collection = {relayout: () => {}, contentOffset: new Point(0, 900), contentSize: new Size(100, 1000), size: new Size(100, 100), dataSource: ds};
    assert.equal(loadMoreStub.callCount, 0);

    tree.find(EditableCollectionView).simulate('scroll');
    await sleep(100);

    assert.equal(loadMoreStub.callCount, 0);
  });

  it('should support dragging rows', async function () {
    const tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        canDragItems />
    );

    await sleep(100);
    assert.equal(tree.find(EditableCollectionView).prop('canDragItems'), true);

    tree.instance().collection = {
      relayout: () => {},
      getItemView: (indexPath) => ({
        children: [
          tree.prop('delegate').renderItemView('item', ds.getItem(indexPath.section, indexPath.index))
        ],
        layoutInfo: {
          rect: {
            width: 100,
            height: 50
          }
        }
      })
    };

    let Wrapper = (props) => props.children;
    let dragView = shallow(<Wrapper>{tree.prop('delegate').renderDragView(new DragTarget('item', new IndexPath(0, 0)))}</Wrapper>);
    assert.equal(dragView.type(), Provider);
    assert.equal(dragView.prop('theme'), 'light');
    assert.equal(dragView.find('div').length, 1);
  });

  it('should pass the correct theme to the drag view from the context', async function () {
    const tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        canDragItems />
    , {context: {theme: 'dark'}});

    await sleep(100);
    tree.instance().collection = {
      relayout: () => {},
      getItemView: (indexPath) => ({
        children: [
          tree.prop('delegate').renderItemView('item', ds.getItem(indexPath.section, indexPath.index))
        ],
        layoutInfo: {
          rect: {
            width: 100,
            height: 50
          }
        }
      })
    };

    let dragView = tree.wrap(tree.prop('delegate').renderDragView(new DragTarget('item', new IndexPath(0, 0))));
    assert.equal(dragView.type(), Provider);
    assert.equal(dragView.prop('theme'), 'dark');
    assert.deepEqual(dragView.prop('style'), {
      background: 'transparent',
      width: 100,
      height: 50
    });
  });

  it('should support custom drag views', function () {
    const tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        canDragItems
        renderDragView={() => <div>Drag view</div>} />
    );

    tree.instance().collection = {
      relayout: () => {},
      selectedIndexPaths: []
    };

    let Wrapper = (props) => props.children;
    let dragView = shallow(<Wrapper>{tree.prop('delegate').renderDragView(new DragTarget('item', new IndexPath(0, 0)))}</Wrapper>);
    assert.equal(dragView.find('div').length, 1);
    assert.equal(dragView.find('div').text(), 'Drag view');
  });

  it('should support drag and drop onto the collection view with dropPosition="on"', function () {
    const tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        dropPosition="on" />
    );

    tree.instance().collection = {getSectionLength: () => 0, relayout() {}, reloadSupplementaryViewsOfType() {}};
    assert.equal(tree.find(EditableCollectionView).hasClass('is-drop-target'), false);

    tree.instance().dropTargetUpdated(new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN));
    tree.update();
    assert.equal(tree.find(EditableCollectionView).hasClass('is-drop-target'), true);

    tree.instance().dropTargetUpdated(new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_ON));
    tree.update();
    assert.equal(tree.find(EditableCollectionView).hasClass('is-drop-target'), false);
  });

  it('should not highlight the collection view with dropPosition="between"', function () {
    const tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={ds}
        renderItemView={renderItemView}
        dropPosition="between" />
    );

    tree.instance().collection = {getSectionLength: () => 10, relayout() {}};
    assert.equal(tree.find(EditableCollectionView).hasClass('is-drop-target'), false);

    tree.instance().dropTargetUpdated(new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN));
    tree.update();
    assert.equal(tree.find(EditableCollectionView).hasClass('is-drop-target'), false);
  });

  it('should highlight the collection view if empty with dropPosition="between"', function () {
    const tree = shallow(
      <CollectionView
        layout={layout}
        dataSource={new ListDataSource}
        renderItemView={renderItemView}
        dropPosition="between" />
    );

    tree.instance().collection = {getSectionLength: () => 0, relayout() {}, reloadSupplementaryViewsOfType() {}};
    assert.equal(tree.find(EditableCollectionView).hasClass('is-drop-target'), false);

    tree.instance().dropTargetUpdated(new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN));
    tree.update();
    assert.equal(tree.find(EditableCollectionView).hasClass('is-drop-target'), true);
  });
});
