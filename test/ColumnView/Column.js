import {ArrayDataSource, EditableCollectionView, IndexPath} from '@react/collection-view';
import assert from 'assert';
import Column from '../../src/ColumnView/js/Column';
import {data, renderItem, TestDS} from './utils';
import React from 'react';
import {shallow} from 'enzyme';
import {sleep} from '../utils';

describe('Column', function () {
  let ds;
  beforeEach(function (done) {
    ds = new TestDS;
    setTimeout(done, 0); // initial navigateToItem is async
  });

  it('should render a collection view', function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} />);
    assert.equal(wrapper.type(), EditableCollectionView);
    assert(wrapper.prop('dataSource') instanceof ArrayDataSource);
    assert.deepEqual(wrapper.prop('selectedIndexPaths'), []);
  });

  it('should allow multiple highlighting if selection is enabled', function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} allowsSelection />);
    assert.equal(wrapper.prop('allowsMultipleSelection'), true);
  });

  it('should render an item view', function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} renderItem={renderItem} />);
    let itemNode = ds.navigationStack[0].children.getItem(0, 0);
    let item = wrapper.wrap(wrapper.instance().renderItemView('item', itemNode));
    assert.equal(item.prop('item'), itemNode);
    assert.equal(item.prop('renderItem'), renderItem);
    assert.equal(item.prop('isSelected'), false);
  });

  it('should select an item', function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} renderItem={renderItem} allowsSelection />);
    let itemNode = ds.navigationStack[0].children.getItem(0, 0);
    let item = wrapper.wrap(wrapper.instance().renderItemView('item', itemNode));
    assert.equal(item.prop('allowsSelection'), true);

    assert.deepEqual(ds.getSelection(), []);
    item.simulate('select', data[0]);
    assert.deepEqual(ds.getSelection(), [data[0]]);
  });

  it('should highlight a navigated item', async function () {
    await ds.navigateToItem(data[1]);
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} />);
    assert.deepEqual(wrapper.prop('selectedIndexPaths'), [new IndexPath(0, 1)]);
  });

  it('should trigger a navigate when highlighting an item', async function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} />);
    wrapper.instance().collection = {
      selectedIndexPaths: [new IndexPath(0, 1)],
      getItem: (indexPath) => ds.navigationStack[0].children.getItem(indexPath.section, indexPath.index)
    };

    wrapper.simulate('selectionChanged');
    await sleep(0); // navigate is async
    assert.equal(ds.navigationStack.length, 2);
    assert.deepEqual(ds.navigationStack[1].item, data[1]);
  });

  it('should navigate to the parent if no items are selected', async function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} />);
    wrapper.instance().collection = {
      selectedIndexPaths: []
    };

    wrapper.simulate('selectionChanged');
    await sleep(0); // navigate is async
    assert.equal(ds.navigationStack.length, 1);
    assert.deepEqual(ds.navigationStack[0].item, null);
  });

  it('should not navigate if multiple items are selected', async function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} />);
    wrapper.instance().collection = {
      selectedIndexPaths: [new IndexPath(0, 0), new IndexPath(0, 1)]
    };

    wrapper.simulate('selectionChanged');
    await sleep(0); // navigate is async
    assert.equal(ds.navigationStack.length, 1);
    assert.deepEqual(ds.navigationStack[0].item, null);
  });

  it('should commit the selection when pressing enter', function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} allowsSelection />);
    wrapper.instance().collection = {
      selectedIndexPaths: [new IndexPath(0, 1)],
      getItem: (indexPath) => ds.navigationStack[0].children.getItem(indexPath.section, indexPath.index)
    };

    assert.deepEqual(ds.getSelection(), []);
    wrapper.simulate('keyDown', {key: 'Enter'});
    assert.deepEqual(ds.getSelection(), [data[1]]);
  });

  it('should not commit the selection when pressing enter if selection is not enabled', function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} />);
    wrapper.instance().collection = {
      selectedIndexPaths: [new IndexPath(0, 1)],
      getItem: (indexPath) => ds.navigationStack[0].children.getItem(indexPath.section, indexPath.index)
    };

    assert.deepEqual(ds.getSelection(), []);
    wrapper.simulate('keyDown', {key: 'Enter'});
    assert.deepEqual(ds.getSelection(), []);
  });

  it('should commit the selection when pressing enter for branch items if enabled', function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} allowsSelection allowsBranchSelection />);
    wrapper.instance().collection = {
      selectedIndexPaths: [new IndexPath(0, 0), new IndexPath(0, 1)],
      getItem: (indexPath) => ds.navigationStack[0].children.getItem(indexPath.section, indexPath.index)
    };

    assert.deepEqual(ds.getSelection(), []);
    wrapper.simulate('keyDown', {key: 'Enter'});
    assert.deepEqual(ds.getSelection(), [data[0], data[1]]);
  });

  it('should not commit the selection when pressing enter for branch items if not enabled', function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} allowsSelection />);
    wrapper.instance().collection = {
      selectedIndexPaths: [new IndexPath(0, 0), new IndexPath(0, 1)],
      getItem: (indexPath) => ds.navigationStack[0].children.getItem(indexPath.section, indexPath.index)
    };

    assert.deepEqual(ds.getSelection(), []);
    wrapper.simulate('keyDown', {key: 'Enter'});
    assert.deepEqual(ds.getSelection(), [data[1]]);
  });

  it('should unselect the highlighted items when pressing enter if they are all already selected', function () {
    ds.setSelected([data[0], data[1]], true);
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} allowsSelection allowsBranchSelection />);
    wrapper.instance().collection = {
      selectedIndexPaths: [new IndexPath(0, 0), new IndexPath(0, 1)],
      getItem: (indexPath) => ds.navigationStack[0].children.getItem(indexPath.section, indexPath.index)
    };

    assert.deepEqual(ds.getSelection(), [data[0], data[1]]);
    wrapper.simulate('keyDown', {key: 'Enter'});
    assert.deepEqual(ds.getSelection(), []);
  });

  it('should select the highlighted items when pressing enter if there are mixed selected and unselected items', function () {
    ds.setSelected([data[0]], true);
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} allowsSelection allowsBranchSelection />);
    wrapper.instance().collection = {
      selectedIndexPaths: [new IndexPath(0, 0), new IndexPath(0, 1)],
      getItem: (indexPath) => ds.navigationStack[0].children.getItem(indexPath.section, indexPath.index)
    };

    assert.deepEqual(ds.getSelection(), [data[0]]);
    wrapper.simulate('keyDown', {key: 'Enter'});
    assert.deepEqual(ds.getSelection(), [data[0], data[1]]);
  });

  it('should navigate to the next column when pressing the right arrow key', async function () {
    let wrapper = shallow(<Column item={ds.navigationStack[0]} dataSource={ds} />);

    wrapper.simulate('keyDown', {key: 'ArrowRight'});

    await sleep(0); // navigate is async
    assert.equal(ds.navigationStack.length, 2);
    assert.equal(ds.navigationStack[0].item, null);
    assert.equal(ds.navigationStack[1].item, data[0]);
  });

  it('should navigate to the previous column when pressing the left arrow key', async function () {
    await ds.navigateToItem(data[0]);
    await ds.navigateToNext();
    let wrapper = shallow(<Column item={ds.navigationStack[1]} dataSource={ds} />);

    assert.equal(ds.navigationStack.length, 3);
    wrapper.simulate('keyDown', {key: 'ArrowLeft'});
    await sleep(10);

    assert.equal(ds.navigationStack.length, 2);
    assert.equal(ds.navigationStack[0].item, null);
    assert.equal(ds.navigationStack[1].item, data[0]);
  });
});
