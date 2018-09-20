import assert from 'assert';
import {DragTarget, IndexPath, Point, Rect, Size} from '@react/collection-view';
import sinon from 'sinon';
import TableViewLayout from '../../src/TableView/js/TableViewLayout';

describe('TableViewLayout', function () {
  it('should get an empty view if the table is empty', function () {
    let layout = new TableViewLayout({tableView: {}});
    layout.collectionView = {size: new Size(100, 100), getNumberOfSections: () => 1, getSectionLength: () => 0};
    layout.validate();

    let layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 0, 100, 100));
    let emptyView = layoutInfos.find(l => l.type === 'empty-view');
    assert(emptyView);
    assert.deepEqual(emptyView.rect, new Rect(0, 0, 100, 100));

    emptyView = layout.getLayoutInfo('empty-view');
    assert(emptyView);
    assert.deepEqual(emptyView.rect, new Rect(0, 0, 100, 100));
  });

  it('should get a loading indicator if the table is loading and empty', function () {
    let layout = new TableViewLayout({tableView: {isLoading: true}});
    layout.collectionView = {size: new Size(100, 100), getNumberOfSections: () => 1, getSectionLength: () => 0};
    layout.validate();

    let layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 0, 100, 100));
    let loadingIndicator = layoutInfos.find(l => l.type === 'loading-indicator');
    assert(loadingIndicator);
    assert.deepEqual(loadingIndicator.rect, new Rect(0, 0, 100, 100));

    loadingIndicator = layout.getLayoutInfo('loading-indicator');
    assert(loadingIndicator);
    assert.deepEqual(loadingIndicator.rect, new Rect(0, 0, 100, 100));
  });

  it('should get a loading indicator at the bottom if the table is loading more', function () {
    let layout = new TableViewLayout({tableView: {isLoading: true}});
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 100,
      delegate: {
        indentationForItem: () => 0
      }
    };
    layout.validate();

    let layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 0, 100, 100));
    let loadingIndicator = layoutInfos.find(l => l.type === 'loading-indicator');
    assert(loadingIndicator);
    assert.deepEqual(loadingIndicator.rect, new Rect(0, 48 * 100 - 1, 100, 100));

    loadingIndicator = layout.getLayoutInfo('loading-indicator');
    assert(loadingIndicator);
    assert.deepEqual(loadingIndicator.rect, new Rect(0, 48 * 100 - 1, 100, 100));
  });

  it('should get a drop insertion indicator', function () {
    let layout = new TableViewLayout({tableView: {props: {dropPosition: 'between'}}});
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 100,
      delegate: {
        indentationForItem: () => 0
      },
      _dropTarget: new DragTarget('item', new IndexPath(0, 5), DragTarget.DROP_BETWEEN)
    };
    layout.validate();

    let layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 0, 100, 100));
    let insertionIndicator = layoutInfos.find(l => l.type === 'insertion-indicator');
    assert(insertionIndicator);
    assert.deepEqual(insertionIndicator.rect, new Rect(0, 5 * 48 - 1, 100, 2));

    insertionIndicator = layout.getLayoutInfo('insertion-indicator');
    assert(insertionIndicator);
    assert.deepEqual(insertionIndicator.rect, new Rect(0, 5 * 48 - 1, 100, 2));
  });

  it('should not get a drop insertion indicator if the table is empty', function () {
    let layout = new TableViewLayout({tableView: {props: {dropPosition: 'between'}}});
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 0,
      delegate: {
        indentationForItem: () => 0
      },
      _dropTarget: new DragTarget('item', new IndexPath(0, 5), DragTarget.DROP_BETWEEN)
    };
    layout.validate();

    let layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 0, 100, 100));
    let insertionIndicator = layoutInfos.find(l => l.type === 'insertion-indicator');
    assert(!insertionIndicator);

    insertionIndicator = layout.getLayoutInfo('insertion-indicator');
    assert(!insertionIndicator);
  });

  it('should get a drop target with dropPosition="on"', function () {
    let layout = new TableViewLayout({tableView: {props: {dropPosition: 'on'}}});
    let indexPathAtPoint = sinon.stub().returns(new IndexPath(0, 5));
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 100,
      indexPathAtPoint
    };

    let target = layout.getDropTarget(new Point(0, 100));
    assert.deepEqual(indexPathAtPoint.getCall(0).args[0], new Point(0, 100));
    assert.deepEqual(target, new DragTarget('item', new IndexPath(0, 5), DragTarget.DROP_ON));
  });

  it('should get a drop target on the whole table with dropPosition="on"', function () {
    let layout = new TableViewLayout({tableView: {props: {dropPosition: 'on'}}});
    let indexPathAtPoint = sinon.stub().returns(null);
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 100,
      indexPathAtPoint
    };

    let target = layout.getDropTarget(new Point(0, 100));
    assert.deepEqual(indexPathAtPoint.getCall(0).args[0], new Point(0, 100));
    assert.deepEqual(target, new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN));
  });

  it('should get a drop target with dropPosition="between"', function () {
    let layout = new TableViewLayout({tableView: {props: {dropPosition: 'between'}}});
    let indexPathAtPoint = sinon.stub().returns(new IndexPath(0, 5));
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 100,
      indexPathAtPoint
    };

    let target = layout.getDropTarget(new Point(0, 100));
    assert.deepEqual(indexPathAtPoint.getCall(0).args[0], new Point(0, 100 + 24));
    assert.deepEqual(target, new DragTarget('item', new IndexPath(0, 5), DragTarget.DROP_BETWEEN));
  });

  it('should get a drop target at the end with dropPosition="between"', function () {
    let layout = new TableViewLayout({tableView: {props: {dropPosition: 'between'}}});
    let indexPathAtPoint = sinon.stub().returns(null);
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 100,
      indexPathAtPoint
    };

    let target = layout.getDropTarget(new Point(0, 100));
    assert.deepEqual(indexPathAtPoint.getCall(0).args[0], new Point(0, 100 + 24));
    assert.deepEqual(target, new DragTarget('item', new IndexPath(0, 100), DragTarget.DROP_BETWEEN));
  });
});
