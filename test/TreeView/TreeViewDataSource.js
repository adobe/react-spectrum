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
import {IndexPath} from '@react/collection-view';
import TreeDataSource from '../../src/TreeDataSource';
import {TreeViewDataSource} from '../../src/TreeView';

export var data = [
  {name: 'Root 1', children: [
    {name: 'Child 1', children: [
      {name: 'Child 1 Sub', children: []}
    ]},
    {name: 'Child 2', children: []}
  ]},
  {name: 'Root 2', children: []}
];

export class TestDataSource extends TreeViewDataSource {
  async getChildren(parent) {
    return parent ? parent.children : data;
  }

  hasChildren(parent) {
    return parent.children.length > 0;
  }
}

export class TreeDS extends TreeDataSource {
  async getChildren(parent) {
    return parent ? parent.children : data;
  }

  hasChildren(parent) {
    return parent.children.length > 0;
  }

  isItemEqual(a, b) {
    return a.name === b.name;
  }
}

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

describe('TreeViewDataSource', function () {
  var ds;
  beforeEach(async function () {
    ds = new TestDataSource;
    await ds.loadData();
  });

  it('should load data from a datasource', function (done) {
    var ds = new TestDataSource;
    ds.once('reloadSection', function (section, animated) {
      assert.equal(section, 0);
      assert.equal(animated, false);

      assert.equal(ds.getNumberOfSections(), 1);
      assert.equal(ds.getSectionLength(0), data.length);

      var item = ds.getItem(0, 0);
      assert.equal(item.item, data[0]);
      assert.equal(item.hasChildren, true);
      assert.equal(item.children, null);
      assert.equal(item.isExpanded, false);
      assert.equal(item.level, 0);
      checkSortedChildren(ds.root);
      done();
    });
  });

  it('should emit event after load', function (done) {
    var ds = new TestDataSource;
    ds.once('load', function (section, animated) {

      assert.equal(ds.getNumberOfSections(), 1);
      assert.equal(ds.getSectionLength(0), data.length);

      var item = ds.getItem(0, 0);
      assert.equal(item.item, data[0]);
      assert.equal(item.hasChildren, true);
      assert.equal(item.children, null);
      assert.equal(item.isExpanded, false);
      assert.equal(item.level, 0);
      done();
    });
  });

  it('should getTreeItem', function (done) {
    class NewTestDataSource extends TestDataSource {
      getTreeItem(item, parent) {
        let newItem = super.getTreeItem(item, parent);
        newItem.isExpanded = true;
        return newItem;
      }
    }
    var ds = new NewTestDataSource;
    ds.once('reloadSection', function (section, animated) {
      assert.equal(section, 0);
      assert.equal(animated, false);

      assert.equal(ds.getNumberOfSections(), 1);
      assert.equal(ds.getSectionLength(0), 5);

      var item = ds.getItem(0, 0);
      assert.equal(item.item, data[0]);
      assert.equal(item.hasChildren, true);
      assert.deepEqual([item.children[0].item, item.children[1].item], data[0].children);
      assert.equal(item.isExpanded, true);
      assert.equal(item.level, 0);
      done();
    });
  });

  it('should expand an item', async function () {
    // expand root item
    testEmitter(ds);
    await ds.expandItem(data[0]);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 0), false], // isExpanded = true
      ['reloadItem', new IndexPath(0, 0), false], // isLoading = true
      ['reloadItem', new IndexPath(0, 0), false], // isLoading = false
      ['startTransaction'],
      ['insertItem', new IndexPath(0, 1), undefined],
      ['insertItem', new IndexPath(0, 2), undefined],
      ['endTransaction', true]
    ]);

    assert.equal(ds.getSectionLength(0), 4);
    assert.equal(ds.getItem(0, 0).isExpanded, true);

    let item = ds.getItem(0, 1);
    assert.equal(item.item, data[0].children[0]);
    assert.equal(item.level, 1);
    assert.equal(item.hasChildren, true);
    assert.equal(item.isExpanded, false);
    assert.equal(ds.getItem(0, 2).hasChildren, false);
    checkSortedChildren(ds.root);

    // expand child item
    testEmitter(ds);
    await ds.expandItem(data[0].children[0]);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 1), false], // isExpanded = true
      ['reloadItem', new IndexPath(0, 1), false], // isLoading = true
      ['reloadItem', new IndexPath(0, 1), false], // isLoading = false
      ['startTransaction'],
      ['insertItem', new IndexPath(0, 2), undefined],
      ['endTransaction', true]
    ]);

    assert.equal(ds.getSectionLength(0), 5);
    assert.equal(ds.getItem(0, 1).isExpanded, true);

    item = ds.getItem(0, 2);
    assert.equal(item.item, data[0].children[0].children[0]);
    assert.equal(item.level, 2);
    assert.equal(item.hasChildren, false);
  });

  it('should expand an item using isItemEqual comparator', async function () {
    let ds = new TreeViewDataSource(new TreeDS);
    await ds.loadData();

    testEmitter(ds);
    await ds.expandItem({name: 'Root 1'});

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 0), false], // isExpanded = true
      ['reloadItem', new IndexPath(0, 0), false], // isLoading = true
      ['reloadItem', new IndexPath(0, 0), false], // isLoading = false
      ['startTransaction'],
      ['insertItem', new IndexPath(0, 1), undefined],
      ['insertItem', new IndexPath(0, 2), undefined],
      ['endTransaction', true]
    ]);
  });

  it('should collapse an item', async function () {
    await ds.expandItem(data[0]);
    await ds.expandItem(data[0].children[0]);

    testEmitter(ds);
    ds.collapseItem(data[0].children[0]);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 1), false],
      ['startTransaction'],
      ['removeItem', new IndexPath(0, 2), undefined],
      ['endTransaction', true]
    ]);

    assert.equal(ds.getSectionLength(0), 4);
    assert.equal(ds.getItem(0, 1).isExpanded, false);
  });

  it('should collapse an item using isItemEqual comparator', async function () {
    let ds = new TreeViewDataSource(new TreeDS);
    await ds.loadData();

    await ds.expandItem(data[0]);
    await ds.expandItem(data[0].children[0]);

    testEmitter(ds);
    ds.collapseItem({name: 'Child 1'});

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 1), false],
      ['startTransaction'],
      ['removeItem', new IndexPath(0, 2), undefined],
      ['endTransaction', true]
    ]);
  });

  it('should show expanded children when parent is collapsed and expanded', async function () {
    await ds.expandItem(data[0]);
    await ds.expandItem(data[0].children[0]);

    testEmitter(ds);
    ds.collapseItem(data[0]);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 0), false],
      ['startTransaction'],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['endTransaction', true]
    ]);

    assert.equal(ds.getSectionLength(0), 2);
    assert.equal(ds.getItem(0, 0).isExpanded, false);

    testEmitter(ds);
    await ds.expandItem(data[0]);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 0), false],
      ['startTransaction'],
      ['insertItem', new IndexPath(0, 1), undefined],
      ['insertItem', new IndexPath(0, 2), undefined],
      ['insertItem', new IndexPath(0, 3), undefined],
      ['endTransaction', true]
    ]);

    assert.equal(ds.getSectionLength(0), 5);
  });

  it('should toggle an item', async function () {
    testEmitter(ds);
    await ds.toggleItem(data[0]);
    await ds.toggleItem(data[0]);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 0), false], // isExpanded = true
      ['reloadItem', new IndexPath(0, 0), false], // isLoading = true
      ['reloadItem', new IndexPath(0, 0), false], // isLoading = false
      ['startTransaction'],
      ['insertItem', new IndexPath(0, 1), undefined],
      ['insertItem', new IndexPath(0, 2), undefined],
      ['endTransaction', true],

      ['reloadItem', new IndexPath(0, 0), false],
      ['startTransaction'],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['endTransaction', true]
    ]);
  });

  describe('insertChild', function () {
    it('should do nothing if children not yet loaded', async function () {
      testEmitter(ds);
      ds.insertChild(data[1], 0, {name: 'Child 0', children: []});
      assert.deepEqual(ds.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false]
      ]);
    });

    it('should insert a child', async function () {
      await ds.expandItem(data[0]);

      testEmitter(ds);
      ds.insertChild(data[0], 0, {name: 'Child 0', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['insertItem', new IndexPath(0, 1), undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should append a child', async function () {
      await ds.expandItem(data[0]);
      await ds.expandItem(data[0].children[0]);

      testEmitter(ds);
      ds.insertChild(data[0], 2, {name: 'Child 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['insertItem', new IndexPath(0, 4), undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should insert into an empty item', async function () {
      await ds.expandItem(data[1]);

      testEmitter(ds);
      ds.insertChild(data[1], 0, {name: 'Child 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false],
        ['insertItem', new IndexPath(0, 2), undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should append to the root', async function () {
      testEmitter(ds);
      ds.insertChild(null, 2, {name: 'Root 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['insertItem', new IndexPath(0, 2), undefined]
      ]);

      checkSortedChildren(ds.root);
    });
  });

  describe('removeChild', function () {
    it('should do nothing if children not yet loaded', async function () {
      testEmitter(ds);
      ds.removeChild(data[0], 0, {name: 'Child 0', children: []});
      assert.deepEqual(ds.emittedEvents, []);
    });

    it('should remove a child', async function () {
      await ds.expandItem(data[0]);

      testEmitter(ds);
      ds.removeChild(data[0], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 1), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should remove all nested children', async function () {
      await ds.expandItem(data[0]);
      await ds.expandItem(data[0].children[0]);

      testEmitter(ds);
      ds.removeChild(data[0], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 1), undefined],
        ['removeItem', new IndexPath(0, 1), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });

    it('should update disclosure indicator if removing last child', async function () {
      await ds.expandItem(data[0]);
      await ds.removeChild(data[0], 0);

      testEmitter(ds);
      ds.removeChild(data[0], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['reloadItem', new IndexPath(0, 0), false],
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 1), undefined],
        ['endTransaction', undefined]
      ]);

      assert.equal(ds.getItem(0, 0).hasChildren, false);
    });
  });

  describe('removeItem', function () {
    it('should remove an item', async function () {
      await ds.expandItem(data[0]);

      testEmitter(ds);
      ds.removeItem(data[0].children[0]);
      assert.deepEqual(ds.emittedEvents, [
        ['startTransaction'],
        ['removeItem', new IndexPath(0, 1), undefined],
        ['endTransaction', undefined]
      ]);

      checkSortedChildren(ds.root);
    });
  });

  describe('moveChild', function () {
    it('should move an item', async function () {
      await ds.expandItem(data[0]);
      await ds.expandItem(data[0].children[0]);

      testEmitter(ds);
      ds.moveChild(data[0], 1, data[0].children[0], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['moveItem', new IndexPath(0, 3), new IndexPath(0, 2), undefined]
      ]);

      assert.equal(ds.getItem(0, 2).level, 2);
      checkSortedChildren(ds.root);
    });

    it('should reload source parent when moving the last item', async function () {
      await ds.expandItem(data[0]);
      await ds.expandItem(data[0].children[0]);

      testEmitter(ds);
      ds.moveChild(data[0].children[0], 0, data[0], 2);
      assert.deepEqual(ds.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false],
        ['moveItem', new IndexPath(0, 2), new IndexPath(0, 3), undefined]
      ]);

      assert.equal(ds.getItem(0, 3).level, 1);
      checkSortedChildren(ds.root);
    });

    it('should reload destination parent when inserting the first item', async function () {
      await ds.expandItem(data[0]);
      await ds.expandItem(data[1]);

      testEmitter(ds);
      ds.moveChild(data[0], 1, data[1], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['reloadItem', new IndexPath(0, 3), false],
        ['moveItem', new IndexPath(0, 2), new IndexPath(0, 3), undefined]
      ]);
      checkSortedChildren(ds.root);
    });

    it('should insert into destination if source is not expanded', async function () {
      await ds.expandItem(data[0]);
      ds.collapseItem(data[0]);
      await ds.expandItem(data[1]);

      testEmitter(ds);
      ds.moveChild(data[0], 1, data[1], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false],
        ['insertItem', new IndexPath(0, 2), undefined]
      ]);
      checkSortedChildren(ds.root);
    });

    it('should remove from source if destination is not expanded', async function () {
      await ds.expandItem(data[0]);

      testEmitter(ds);
      ds.moveChild(data[0], 1, data[0].children[0], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['removeItem', new IndexPath(0, 2), undefined]
      ]);
      checkSortedChildren(ds.root);
    });
  });

  describe('moveItem', function () {
    it('should move an item', async function () {
      await ds.expandItem(data[0]);
      await ds.expandItem(data[0].children[0]);

      testEmitter(ds);
      ds.moveItem(data[0].children[1], data[0].children[0], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['moveItem', new IndexPath(0, 3), new IndexPath(0, 2), undefined]
      ]);

      assert.equal(ds.getItem(0, 2).level, 2);
      checkSortedChildren(ds.root);
    });
  });
});
