import assert from 'assert';
import sinon from 'sinon';
import {TableViewDataSource} from '../../src/TableView';

class TestGetNumberOfRowsDS extends TableViewDataSource {
  getColumns() {
    return [{title: 'Test'}, {title: 'Foo'}];
  }

  getCell(column, rowIndex) {
    return column.title + ' ' + rowIndex;
  }

  sort() {}
}

class TestGetCellDS extends TableViewDataSource {
  getColumns() {
    return [{title: 'Test'}, {title: 'Foo'}];
  }

  getNumberOfRows() {
    return 5;
  }

  sort() {}
}

class TestSortDS extends TableViewDataSource {
  getColumns() {
    return [{title: 'Test'}, {title: 'Foo'}];
  }

  getNumberOfRows() {
    return 5;
  }

  getCell(column, rowIndex) {
    return column.title + ' ' + rowIndex;
  }
}

class TestDS extends TableViewDataSource {
  getColumns() {
    return [{title: 'Test'}, {title: 'Foo'}];
  }

  getNumberOfRows() {
    return 5;
  }

  getCell(column, rowIndex) {
    return column.title + ' ' + rowIndex;
  }

  sort() {}
}

describe('TableViewDataSource', function () {
  it('should require getColumns to be implemented', function () {
    assert.throws(() => new TableViewDataSource, /getColumns must be implemented by subclasses/);
  });

  it('should require getNumberOfRows to be implemented', function () {
    assert.throws(() => (new TestGetNumberOfRowsDS).getNumberOfRows(), /getNumberOfRows must be implemented by subclasses/);
  });

  it('should require getCell to be implemented', function () {
    assert.throws(() => (new TestGetCellDS).getCell(0, 0), /getCell must be implemented by subclasses/);
  });

  it('should require sort to be implemented', function () {
    assert.throws(() => (new TestSortDS).sort(), /sort must be implemented by subclasses/);
  });

  it('should getColumns during initialization', function () {
    let ds = new TestDS;
    assert.deepEqual(ds.columns, [{title: 'Test'}, {title: 'Foo'}]);
  });

  it('getNumberOfSections should return 1 by default', function () {
    let ds = new TestDS;
    assert.equal(ds.getNumberOfSections(), 1);
  });

  it('getSectionLength should return the number of rows', function () {
    let ds = new TestDS;
    assert.equal(ds.getSectionLength(0), 5);
  });

  it('getSectionHeader should return null by default', function () {
    let ds = new TestDS;
    assert.equal(ds.getSectionHeader(0), null);
  });

  it('getItem should return data for all cells in a row', function () {
    let ds = new TestDS;
    assert.deepEqual(ds.getItem(0, 0), ['Test 0', 'Foo 0']);
    assert.deepEqual(ds.getItem(0, 1), ['Test 1', 'Foo 1']);
  });

  it('should call the sort method when sorting by a column', function () {
    let ds = new TestDS;
    let spy = sinon.spy(ds, 'sort');

    ds._sortByColumn(ds.columns[0]);
    assert.deepEqual(spy.getCall(0).args, [ds.columns[0], -1]);

    ds._sortByColumn(ds.columns[0]);
    assert.deepEqual(spy.getCall(1).args, [ds.columns[0], 1]);

    ds._sortByColumn(ds.columns[1]);
    assert.deepEqual(spy.getCall(2).args, [ds.columns[1], -1]);
  });

  it('reloadData should emit reloadSection', function (done) {
    let ds = new TestDS;
    ds.once('reloadSection', (section, animated) => {
      assert.equal(section, 0);
      assert.equal(animated, false);
      done();
    });

    ds.reloadData();
  });
});
