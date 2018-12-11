import assert from 'assert';
import {ColumnViewDataSource} from '../../src/ColumnView';
import {data, TestDS, TreeDS} from './utils';
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

  function checkSortedChildren(node) {
    for (let i = 0; i < node.children.length; i++) {
      assert.equal(node.children[i].index, i);
  
      if (node.children[i].children) {
        checkSortedChildren(node.children[i]);
      }
    }
  }  

  beforeEach(async function () {
    ds = new TestDS;
    await ds.navigateToItem(null);
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
    ds.isItemEqual = null;
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

  it('should support selecting objects equivalent by isItemEqual comparator with TreeDataSource', async function () {
    let ds = new ColumnViewDataSource(new TreeDS);
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

  describe('insertChild', function () {
    it('should do nothing if children not yet loaded', async function () {
      testEmitter(ds.root.children);
      ds.insertChild(data[1], 0, {name: 'Child 0', children: []});
      assert.deepEqual(ds.root.children.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false]
      ]);
    });

    it('should insert a child', async function () {
      await ds.navigateToItem(data[0]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);
      ds.insertChild(data[0], 0, {name: 'Child 0', children: []});

      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['insertItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should append a child', async function () {
      await ds.navigateToItem(data[0]);
      await ds.navigateToItem(data[0].children[0]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);
      ds.insertChild(data[0], 2, {name: 'Child 3', children: []});

      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['insertItem', new IndexPath(0, 2), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should insert into an empty item', async function () {
      await ds.navigateToItem(data[1]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);
      testEmitter(ds.root.children);

      ds.insertChild(data[1], 0, {name: 'Child 3', children: []});

      assert.deepEqual(ds.root.children.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false]
      ]);

      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['insertItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should append to the root', async function () {
      testEmitter(ds.root.children);
      ds.insertChild(null, 2, {name: 'Root 3', children: []});

      assert.deepEqual(ds.root.children.emittedEvents, [
        ['startTransaction'],
        ['insertItem', new IndexPath(0, 2), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });
  });

  describe('removeItem', function () {
    it('should do nothing if children not yet loaded', async function () {
      testEmitter(ds.root.children);
      ds.removeItem(data[0].children[0]);
      assert.deepEqual(ds.root.children.emittedEvents, []);
    });

    it('should remove a child', async function () {
      await ds.navigateToItem(data[0]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);

      ds.removeItem(data[0].children[0]);
      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should update disclosure indicator if removing last child', async function () {
      await ds.navigateToItem(data[0]);
      await ds.removeItem(data[0].children[0]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);
      testEmitter(ds.root.children);

      ds.removeItem(data[0].children[1]);

      assert.deepEqual(ds.root.children.emittedEvents, [
        ['reloadItem', new IndexPath(0, 0), false]
      ]);

      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined],
      ]);

      assert.equal(ds.navigationStack[1].hasChildren, false);
      checkSortedChildren(ds.root);
    });

    it('should update the navigation stack if removing a navigated item', async function () {
      await ds.navigateToItem(data[0]);
      ds.removeItem(data[0]);

      assert.equal(ds.navigationStack.length, 1);
    });
  });

  describe('moveItem', function () {
    it('should do nothing if the parent is not loaded', async function () {
      testEmitter(ds.root.children);
      ds.moveItem(data[0].children[0], data[0], 1);
      assert.deepEqual(ds.root.children.emittedEvents, []);
    });

    it('should remove an item if the destination is not loaded', async function () {
      await ds.navigateToItem(data[0]);
      let children = ds.navigationStack[1].children;

      testEmitter(children);
      testEmitter(ds.root.children);

      ds.moveItem(data[0].children[0], data[0].children[0].children[0], 0);
      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should move an item within the same parent', async function () {
      await ds.navigateToItem(data[0]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);

      ds.moveItem(data[0].children[0], 1);
      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['moveItem', new IndexPath(0, 0), new IndexPath(0, 1), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should move an item up the tree', async function () {
      await ds.navigateToItem(data[0]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);
      testEmitter(ds.root.children);

      ds.moveItem(data[0].children[0], null, 1);
      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      assert.deepEqual(ds.root.children.emittedEvents, [
        ['startTransaction'],
        ['insertItem', new IndexPath(0, 1), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should move an item down the tree', async function () {
      await ds.navigateToItem(data[0]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);
      testEmitter(ds.root.children);

      ds.moveItem(data[0], data[0], 1);
      assert.deepEqual(ds.root.children.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['insertItem', new IndexPath(0, 1), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should reload source parent when moving the last item', async function () {
      await ds.navigateToItem(data[0]);
      ds.removeItem(data[0].children[0]);

      let children = ds.navigationStack[1].children;
      testEmitter(children);
      testEmitter(ds.root.children);

      ds.moveItem(data[0].children[1], null, 1);
      assert.deepEqual(children.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      assert.deepEqual(ds.root.children.emittedEvents, [
        ['startTransaction'],
        ['insertItem', new IndexPath(0, 1), undefined],
        ['reloadItem', new IndexPath(0, 0), false],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should reload destination parent when inserting the first item', async function () {
      await ds.navigateToItem(data[1]);
      let dest = ds.navigationStack[1].children;

      await ds.navigateToItem(data[0]);
      let source = ds.navigationStack[1].children;

      testEmitter(dest);
      testEmitter(source);
      testEmitter(ds.root.children);

      ds.moveItem(data[0].children[0], data[1], 0);
      assert.deepEqual(source.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      assert.deepEqual(dest.emittedEvents, [
        ['startTransaction'],
        ['insertItem', new IndexPath(0, 0), undefined],
        ['endTransaction', undefined]
      ]);

      assert.deepEqual(ds.root.children.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false],
      ]);

      checkSortedChildren(ds.root);
    });

    it('should update the navigation stack if moving a navigated item up the tree', async function () {
      await ds.navigateToItem(data[0]);
      await ds.navigateToItem(data[0].children[0]);
      ds.moveItem(data[0].children[0], null, 1);

      assert.deepEqual(ds.navigationStack, [ds.root]);
    });

    it('should update the navigation stack if moving a navigated item down the tree', async function () {
      await ds.navigateToItem(data[0]);
      await ds.navigateToItem(data[0].children[0]);
      ds.moveItem(data[0].children[0], data[0].children[1], 1);

      assert.deepEqual(ds.navigationStack, [ds.root, ds.root.children.sections[0][0]]);
    });
  });

  describe('setNavigatedPath', function () {
    it('should navigate to a nested item', async function () {
      await ds.setNavigatedPath([data[0], data[0].children[0]]);
      assert.deepEqual(ds.navigationStack, [ds.root, ds.root.children.sections[0][0], ds.root.children.sections[0][0].children.sections[0][0]]);
    });

    it('should navigate to a nested item using isItemEqual comparator', async function () {
      await ds.setNavigatedPath([{label: 'Test 1'}, {label: 'Child 1'}]);
      assert.deepEqual(ds.navigationStack, [ds.root, ds.root.children.sections[0][0], ds.root.children.sections[0][0].children.sections[0][0]]);
    });
  });
});
