import assert from 'assert';
import {data, TestDS} from './utils';
import {IndexPath} from '@react/collection-view';
import sinon from 'sinon';
import {sleep} from '../utils';

describe('ColumnViewDataSource', function () {
  let ds;

  function testEmitter(emitter) {
    emitter.emittedEvents = [];

    emitter.emit = function (...args) {
      emitter.emittedEvents.push(args.map(arg => arg && arg.copy ? arg.copy() : arg));
    };
  }

  beforeEach(function (done) {
    ds = new TestDS;
    setTimeout(done, 0); // initial navigateToItem is async
  });

  it('should navigate to the root by default', function () {
    assert.equal(ds.navigationStack.length, 1);
    assert.equal(ds.navigationStack[0].item, null);
    assert.equal(ds.navigationStack[0].hasChildren, true);
    assert.equal(ds.navigationStack[0].children.sections[0][0].item, data[0]);
  });

  it('should navigate to an item', async function () {
    let spy = sinon.spy();
    ds.on('navigate', spy);

    await ds.navigateToItem(data[0]);
    assert.equal(ds.navigationStack.length, 2);
    assert.equal(ds.navigationStack[0].item, null);
    assert.equal(ds.navigationStack[1].item, data[0]);
    assert.equal(ds.navigationStack[1].hasChildren, true);
    assert.equal(ds.navigationStack[1].children.sections[0][0].item, data[0].children[0]);

    assert(spy.calledTwice);
    assert.deepEqual(spy.getCall(0).args[0], [data[0]]);
  });

  it('should navigate further down the tree', async function () {
    let spy = sinon.spy();
    ds.on('navigate', spy);

    await ds.navigateToItem(data[0]);
    await ds.navigateToItem(data[0].children[1]);
    assert.equal(ds.navigationStack.length, 3);
    assert.equal(ds.navigationStack[0].item, null);
    assert.equal(ds.navigationStack[1].item, data[0]);
    assert.equal(ds.navigationStack[2].item, data[0].children[1]);
    assert.equal(ds.navigationStack[2].hasChildren, false);

    assert.equal(spy.callCount, 4);
    assert.deepEqual(spy.getCall(2).args[0], [data[0], data[0].children[1]]);
  });

  it('should navigate to the next column', async function () {
    await ds.navigateToNext();
    assert.equal(ds.navigationStack.length, 2);
    assert.equal(ds.navigationStack[0].item, null);
    assert.equal(ds.navigationStack[1].item, data[0]);
    assert.equal(ds.navigationStack[1].hasChildren, true);
    assert.equal(ds.navigationStack[1].children.sections[0][0].item, data[0].children[0]);
  });

  it('should navigate to the previous column', async function () {
    await ds.navigateToItem(data[0]);
    await ds.navigateToNext();
    await ds.navigateToPrevious();
    assert.equal(ds.navigationStack.length, 2);
    assert.equal(ds.navigationStack[0].item, null);
  });

  it('should not navigate to the next column if there are no children', async function () {
    await ds.navigateToItem(data[0]);
    await ds.navigateToNext();
    await ds.navigateToNext();
    await ds.navigateToNext();
    await ds.navigateToNext();
    assert.equal(ds.navigationStack.length, 4);
  });

  it('should not navigate to the previous column if already at the first', async function () {
    await ds.navigateToItem(data[0]);
    await ds.navigateToPrevious();
    assert.equal(ds.navigationStack.length, 2);
    assert.equal(ds.navigationStack[0].item, null);
  });

  it('should return whether an item in the navigation path', async function () {
    await ds.navigateToItem(data[0]);
    await ds.navigateToItem(data[0].children[1]);
    assert.equal(ds.isNavigated(data[0]), true);
    assert.equal(ds.isNavigated(data[0].children[1]), true);
    assert.equal(ds.isNavigated(data[1]), false);
  });

  it('should get the detail item if no children', async function () {
    await ds.navigateToItem(data[0]);
    await ds.navigateToItem(data[0].children[1]);
    assert.equal(ds.getDetailItem(), data[0].children[1]);
  });

  it('should not get a detail item if there are children', async function () {
    await ds.navigateToItem(data[0]);
    assert.equal(ds.getDetailItem(), null);
  });

  it('should select an item and reloadItems items up to parent level', async function () {
    let spy = sinon.spy();
    let parentValue = ds._lookupItem(data[0]);

    ds.on('selectionChange', spy);
    testEmitter(parentValue.parent.children);

    ds.selectItem(data[0]);
    assert.deepEqual(parentValue.parent.children.emittedEvents[0], ['reloadItem', new IndexPath(0, 0), false]);
    assert.equal(ds.selectedItems.size, 1);
    assert(spy.calledOnce);
    assert.deepEqual(spy.getCall(0).args[0], [data[0]]);

    await ds.navigateToItem(data[0]);
    let childValue = ds._lookupItem(data[0].children[0]);
    testEmitter(childValue.parent.children);

    ds.selectItem(data[0].children[0]);
    assert.deepEqual(parentValue.parent.children.emittedEvents[0], ['reloadItem', new IndexPath(0, 0), false]);
    assert.deepEqual(childValue.parent.children.emittedEvents[0], ['reloadItem', new IndexPath(0, 0), false]);
    assert.equal(ds.selectedItems.size, 2);
    assert(spy.calledTwice);
    assert.deepEqual(spy.getCall(1).args[0], [data[0], data[0].children[0]]);
  });

  it('should deselect an item and reloadItems items up to parent level', async function () {
    ds.selectItem(data[0]);
    assert.equal(ds.selectedItems.size, 1);

    await ds.navigateToItem(data[0]);
    ds.selectItem(data[0].children[0]);
    assert.equal(ds.selectedItems.size, 2);

    let spy = sinon.spy();
    let parentValue = ds._lookupItem(data[0]);
    ds.on('selectionChange', spy);
    testEmitter(parentValue.parent.children);

    ds.deselectItem(data[0]);
    assert.deepEqual(parentValue.parent.children.emittedEvents[0], ['reloadItem', new IndexPath(0, 0), false]);
    assert.equal(ds.selectedItems.size, 1);
    assert(spy.calledOnce);
    assert.deepEqual(spy.getCall(0).args[0], [data[0].children[0]]);

    let childValue = ds._lookupItem(data[0].children[0]);
    testEmitter(childValue.parent.children);

    ds.deselectItem(data[0].children[0]);
    assert.deepEqual(parentValue.parent.children.emittedEvents[0], ['reloadItem', new IndexPath(0, 0), false]);
    assert.deepEqual(childValue.parent.children.emittedEvents[0], ['reloadItem', new IndexPath(0, 0), false]);
    assert.equal(ds.selectedItems.size, 0);
    assert(spy.calledTwice);
    assert.deepEqual(spy.getCall(1).args[0], []);
  });

  it('should set multiple items selected or deselected', async function () {
    let spy = sinon.spy();
    ds.on('selectionChange', spy);

    await ds.navigateToItem(data[0]);
    ds.setSelected([data[0], data[0].children[0]], true);
    assert.equal(ds.selectedItems.size, 2);
    assert(spy.calledOnce);
    assert.deepEqual(spy.getCall(0).args[0], [data[0], data[0].children[0]]);

    ds.setSelected([data[0], data[0].children[0]], false);
    assert.equal(ds.selectedItems.size, 0);
    assert(spy.calledTwice);
    assert.deepEqual(spy.getCall(1).args[0], []);
  });

  it('should clear the selection', async function () {
    let spy = sinon.spy();
    ds.on('selectionChange', spy);

    await ds.navigateToItem(data[0]);
    ds.setSelected([data[0], data[0].children[0]], true);
    assert.equal(ds.selectedItems.size, 2);
    assert(spy.calledOnce);
    assert.deepEqual(spy.getCall(0).args[0], [data[0], data[0].children[0]]);

    ds.clearSelection();
    assert.equal(ds.selectedItems.size, 0);
    assert(spy.calledTwice);
    assert.deepEqual(spy.getCall(1).args[0], []);
  });

  it('should get the selected items', async function () {
    let spy = sinon.spy();
    ds.on('selectionChange', spy);

    await ds.navigateToItem(data[0]);
    ds.setSelected([data[0], data[0].children[0]], true);
    assert.deepEqual(ds.getSelection(), [data[0], data[0].children[0]]);
  });

  it('should check if an item is selected', async function () {
    await ds.navigateToItem(data[0]);
    ds.setSelected([data[0], data[0].children[0]], true);
    assert.equal(ds.isSelected(data[0]), true);
    assert.equal(ds.isSelected(data[0].children[0]), true);
    assert.equal(ds.isSelected(data[1]), false);
  });

  it('should select items by object reference by default', async function () {
    await ds.navigateToItem(data[0]);

    assert.equal(ds.isSelected({label: 'Child 1'}), false);
    assert.equal(ds.isSelected(data[0].children[0]), false);
    ds.selectItem(data[0].children[0]);

    assert.equal(ds.isSelected({label: 'Child 1'}), false);
    assert.equal(ds.isSelected(data[0].children[0]), true);

    ds.deselectItem(data[0].children[0]);
    assert.equal(ds.isSelected({label: 'Child 1'}), false);
    assert.equal(ds.isSelected(data[0].children[0]), false);
  });

  it('should support selecting objects equivalent by isItemEqual comparator', async function () {
    class Test extends TestDS {
      isItemEqual(a, b) {
        return a.label === b.label;
      }
    }

    let ds = new Test;
    await sleep(10);
    await ds.navigateToItem(data[0]);

    assert.equal(ds.isSelected({label: 'Child 1'}), false);
    assert.equal(ds.isSelected(data[0].children[0]), false);
    ds.selectItem(data[0].children[0]);

    assert.equal(ds.isSelected({label: 'Child 1'}), true);
    assert.equal(ds.isSelected(data[0].children[0]), true);

    ds.deselectItem({label: 'Child 1'});
    assert.equal(ds.isSelected({label: 'Child 1'}), false);
    assert.equal(ds.isSelected(data[0].children[0]), false);
  });
});
