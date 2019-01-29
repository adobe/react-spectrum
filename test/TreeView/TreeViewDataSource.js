import assert from 'assert';
import {IndexPath} from '@react/collection-view';
import sinon from 'sinon';
import TreeDataSource from '../../src/TreeDataSource';
import {TreeViewDataSource} from '../../src/TreeView';

export var data = [
  {name: 'Root 1', children: [
    {name: 'Child 1', children: [
      {name: 'Child 1 Sub', children: []}
    ]},
    {name: 'Child 2', children: []}
  ]},
  {name: 'Root 2', children: [], disabled: true}
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

  getItemState(item) {
    if (item.disabled) {
      return {isDisabled: true};
    }
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
      ['endTransaction', undefined],
      ['itemsInserted']
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
      ['endTransaction', undefined],
      ['itemsInserted']
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
      ['endTransaction', undefined],
      ['itemsInserted']
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
      ['endTransaction', undefined]
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
      ['endTransaction', undefined]
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
      ['endTransaction', undefined],
      ['itemsInserted']
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
      ['endTransaction', undefined],
      ['itemsInserted'],

      ['reloadItem', new IndexPath(0, 0), false],
      ['startTransaction'],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['endTransaction', undefined]
    ]);
  });

  it('should call getItemState to get item states', async function () {
    let treeDS = new TreeDS;
    sinon.spy(treeDS, 'getItemState');
    let ds = new TreeViewDataSource(treeDS);
    await ds.loadData();

    assert(treeDS.getItemState.calledTwice);
    assert.equal(ds.root.children[0].isDisabled, false);
    assert.equal(ds.root.children[1].isDisabled, true);

    await ds.expandItem(data[0]);
    assert.equal(treeDS.getItemState.callCount, 4);
  });

  it('should update item states using getItemState on reloadItem', async function () {
    let treeDS = new TreeDS;
    let ds = new TreeViewDataSource(treeDS);
    await ds.loadData();

    ds.root.children[1].isDisabled = false;
    sinon.spy(treeDS, 'getItemState');

    await ds.reloadItem(data[1]);
    assert(treeDS.getItemState.calledOnce);
    assert.equal(ds.root.children[1].isDisabled, true);
  });

  it('should load children of items that are pre-expanded in getItemState', async function () {
    let treeDS = new TreeDS;
    sinon.stub(treeDS, 'getItemState').returns({isExpanded: true});
    let ds = new TreeViewDataSource(treeDS);
    await ds.loadData();

    assert.equal(ds.sections[0].length, 5);
    assert.equal(treeDS.getItemState.callCount, 5);
  });

  it('should collapse items that are pre-expanded when getItemState changes in reloadItem', async function () {
    let treeDS = new TreeDS;
    sinon.stub(treeDS, 'getItemState').returns({isExpanded: true});
    let ds = new TreeViewDataSource(treeDS);
    await ds.loadData();

    assert.equal(ds.sections[0].length, 5);

    treeDS.getItemState.returns({isExpanded: false});
    await ds.reloadItem(data[0]);

    assert.equal(ds.sections[0].length, 2);
  });

  it('should expand items when getItemState changes in reloadItem', async function () {
    let treeDS = new TreeDS;
    sinon.stub(treeDS, 'getItemState').returns({isExpanded: false});
    let ds = new TreeViewDataSource(treeDS);
    await ds.loadData();

    assert.equal(ds.sections[0].length, 2);

    treeDS.getItemState.returns({isExpanded: true});
    await ds.reloadItem(data[0]);

    assert.equal(ds.sections[0].length, 5);
  });

  it('should get item states from props', async function () {
    let treeDS = new TreeDS;
    let ds = new TreeViewDataSource(treeDS, {
      disabledItems: [data[1]],
      expandedItems: [data[0]]
    });

    await ds.loadData();

    assert.equal(ds.sections[0].length, 4);
    assert.equal(ds.root.children[0].isDisabled, false);
    assert.equal(ds.root.children[1].isDisabled, true);
    assert.equal(ds.root.children[0].isExpanded, true);
    assert.equal(ds.root.children[1].isExpanded, false);
  });

  it('should update item states from props', async function () {
    let treeDS = new TreeDS;
    sinon.stub(treeDS, 'getItemState');
    let ds = new TreeViewDataSource(treeDS, {
      disabledItems: [data[1]],
      expandedItems: [data[0]]
    });

    await ds.loadData();

    assert.equal(ds.sections[0].length, 4);
    assert.equal(ds.root.children[0].isDisabled, false);
    assert.equal(ds.root.children[1].isDisabled, true);
    assert.equal(ds.root.children[0].isExpanded, true);
    assert.equal(ds.root.children[1].isExpanded, false);

    testEmitter(ds);
    await ds.updateItemStates({
      disabledItems: [data[0]],
      expandedItems: []
    });

    assert.equal(ds.sections[0].length, 2);
    assert.equal(ds.root.children[0].isDisabled, true);
    assert.equal(ds.root.children[1].isDisabled, false);
    assert.equal(ds.root.children[0].isExpanded, false);
    assert.equal(ds.root.children[1].isExpanded, false);

    assert.deepEqual(ds.emittedEvents, [
      ['reloadItem', new IndexPath(0, 0), false], // disable item 0
      ['reloadItem', new IndexPath(0, 0), false], // collapse item 0
      ['startTransaction'],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['removeItem', new IndexPath(0, 1), undefined],
      ['endTransaction', undefined],
      ['reloadItem', new IndexPath(0, 1), false], // enable item 1
    ]);
  });

  it('should get a list of expanded items from getExpandedItems', async function () {
    let treeDS = new TreeDS;
    sinon.stub(treeDS, 'getItemState').returns({isExpanded: true});
    let ds = new TreeViewDataSource(treeDS);
    await ds.loadData();

    assert.deepEqual(ds.getExpandedItems(), [data[0], data[0].children[0]]);
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
        ['insertItem', new IndexPath(0, 1), undefined],
        ['itemsInserted']
      ]);

      checkSortedChildren(ds.root);
    });

    it('should append a child', async function () {
      await ds.expandItem(data[0]);
      await ds.expandItem(data[0].children[0]);

      testEmitter(ds);
      ds.insertChild(data[0], 2, {name: 'Child 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['insertItem', new IndexPath(0, 4), undefined],
        ['itemsInserted']
      ]);

      checkSortedChildren(ds.root);
    });

    it('should insert into an empty item', async function () {
      await ds.expandItem(data[1]);

      testEmitter(ds);
      ds.insertChild(data[1], 0, {name: 'Child 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['reloadItem', new IndexPath(0, 1), false],
        ['insertItem', new IndexPath(0, 2), undefined],
        ['itemsInserted']
      ]);

      checkSortedChildren(ds.root);
    });

    it('should append to the root', async function () {
      testEmitter(ds);
      ds.insertChild(null, 2, {name: 'Root 3', children: []});

      assert.deepEqual(ds.emittedEvents, [
        ['insertItem', new IndexPath(0, 2), undefined],
        ['itemsInserted']
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
        ['endTransaction', undefined],
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
