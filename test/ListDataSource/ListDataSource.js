import assert from 'assert';
import {IndexPath} from '@react/collection-view';
import ListDataSource from '../../src/ListDataSource';
import sinon from 'sinon';

class TestDS extends ListDataSource {
  load() {
    return [1, 2, 3, 4];
  }

  loadMore() {
    return [5, 6, 7, 8];
  }
}

describe('ListDataSource', function () {
  it('should trigger a load when calling performLoad', async function () {
    let ds = new TestDS;
    let insertSection = sinon.spy(ds, 'insertSection');

    await ds.performLoad();
    assert.equal(insertSection.callCount, 1);
    assert.deepEqual(ds.sections, [[1, 2, 3, 4]]);
    assert.deepEqual(insertSection.getCall(0).args, [0, [1, 2, 3, 4], false]);
  });

  it('should clear the data before loading', async function () {
    let ds = new TestDS;
    await ds.performLoad();

    let clear = sinon.spy(ds, 'clear');
    let insertSection = sinon.spy(ds, 'insertSection');

    await ds.performLoad();
    assert.equal(clear.callCount, 1);
    assert.deepEqual(ds.sections, [[1, 2, 3, 4]]);
    assert.equal(insertSection.callCount, 1);
    assert.deepEqual(insertSection.getCall(0).args, [0, [1, 2, 3, 4], false]);
  });

  it('should trigger a loadMore when calling performLoadMore', async function () {
    let ds = new TestDS;
    await ds.performLoad();

    let insertItems = sinon.spy(ds, 'insertItems');

    await ds.performLoadMore();
    assert.equal(insertItems.callCount, 1);
    assert.deepEqual(ds.sections, [[1, 2, 3, 4, 5, 6, 7, 8]]);
    assert.deepEqual(insertItems.getCall(0).args, [new IndexPath(0, 4), [5, 6, 7, 8], false]);
  });

  it('should trigger a load when performing a sort', async function () {
    let ds = new TestDS;
    await ds.performLoad();

    let insertSection = sinon.spy(ds, 'insertSection');

    await ds.performSort();
    assert.equal(insertSection.callCount, 1);
    assert.deepEqual(ds.sections, [[1, 2, 3, 4]]);
    assert.deepEqual(insertSection.getCall(0).args, [0, [1, 2, 3, 4], false]);
  });
});
