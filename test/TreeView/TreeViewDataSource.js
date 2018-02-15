import assert from 'assert';
import {IndexPath} from '@react/collection-view';
import {TreeViewDataSource} from '../../src/TreeView';

var data = [
  {name: 'Root 1', children: [
    {name: 'Child 1', children: [
      {name: 'Child 1 Sub', children: []}
    ]},
    {name: 'Child 2', children: []}
  ]},
  {name: 'Root 2', children: []}
];

class TestDataSource extends TreeViewDataSource {
  async getChildren(parent) {
    return parent ? parent.children : data;
  }

  hasChildren(parent) {
    return parent.children.length > 0;
  }
}

function testEmitter(emitter) {
  emitter.emittedEvents = [];

  emitter.emit = function (...args) {
    emitter.emittedEvents.push(args.map(arg => arg && arg.copy ? arg.copy() : arg));
  };
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
      ['reloadItem', new IndexPath(0, 0), false],
      ['startTransaction'],
      ['insertItem', new IndexPath(0, 1), undefined],
      ['insertItem', new IndexPath(0, 2), undefined],
      ['endTransaction', undefined]
    ]);

    assert.equal(ds.getSectionLength(0), 4);
    assert.equal(ds.getItem(0, 0).isExpanded, true);

    let item = ds.getItem(0, 1);
    assert.equal(item.item, data[0].children[0]);
    assert.equal(item.level, 1);
    assert.equal(item.hasChildren, true);
    assert.equal(item.isExpanded, false);
    assert.equal(ds.getItem(0, 2).hasChildren, false);

    // expand child item
    testEmitter(ds);
    await ds.expandItem(data[0].children[0]);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 1), false],
      ['startTransaction'],
      ['insertItem', new IndexPath(0, 2), undefined],
      ['endTransaction', undefined]
    ]);

    assert.equal(ds.getSectionLength(0), 5);
    assert.equal(ds.getItem(0, 1).isExpanded, true);

    item = ds.getItem(0, 2);
    assert.equal(item.item, data[0].children[0].children[0]);
    assert.equal(item.level, 2);
    assert.equal(item.hasChildren, false);
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
      ['endTransaction', undefined]
    ]);

    assert.equal(ds.getSectionLength(0), 4);
    assert.equal(ds.getItem(0, 1).isExpanded, false);
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
      ['endTransaction', undefined]
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
      ['endTransaction', undefined]
    ]);

    assert.equal(ds.getSectionLength(0), 5);
  });

  it('should toggle an item', async function () {
    testEmitter(ds);
    await ds.toggleItem(data[0]);
    await ds.toggleItem(data[0]);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 0), false],
      ['startTransaction'],
      ['insertItem', new IndexPath(0, 1), undefined],
      ['insertItem', new IndexPath(0, 2), undefined],
      ['endTransaction', undefined],

      ['reloadItem', new IndexPath(0, 0), false],
      ['startTransaction'],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['endTransaction', undefined]
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
    });

    it('should append a child', async function () {
      await ds.expandItem(data[0]);
      await ds.expandItem(data[0].children[0]);

      testEmitter(ds);
      ds.insertChild(data[0], 2, {name: 'Child 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['insertItem', new IndexPath(0, 4), undefined]
      ]);
    });

    it('should insert into an empty item', async function () {
      await ds.expandItem(data[1]);

      testEmitter(ds);
      ds.insertChild(data[1], 0, {name: 'Child 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false],
        ['insertItem', new IndexPath(0, 2), undefined]
      ]);
    });

    it('should append to the root', async function () {
      testEmitter(ds);
      ds.insertChild(null, 2, {name: 'Root 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['insertItem', new IndexPath(0, 2), undefined]
      ]);
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
        ['endTransaction', undefined],
      ]);

      assert.equal(ds.getItem(0, 0).hasChildren, false);
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
    });

    it('should remove from source if destination is not expanded', async function () {
      await ds.expandItem(data[0]);

      testEmitter(ds);
      ds.moveChild(data[0], 1, data[0].children[0], 0);
      assert.deepEqual(ds.emittedEvents, [
        ['removeItem', new IndexPath(0, 2), undefined]
      ]);
    });
  });
});
