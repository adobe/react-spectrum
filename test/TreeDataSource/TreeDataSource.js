import assert from 'assert';
import sinon from 'sinon';
import TreeDataSource from '../../src/TreeDataSource';

function testEvent(event, ...args) {
  let ds = new TreeDataSource;
  sinon.spy(ds, 'emit');

  ds[event](...args);
  assert(ds.emit.calledOnce);
  assert.equal(ds.emit.getCall(0).args[0], event);
  assert.deepEqual(ds.emit.getCall(0).args.slice(1), args);
}

describe('TreeDataSource', function () {
  it('should emit startTransaction', function () {
    testEvent('startTransaction');
  });

  it('should emit endTransaction', function () {
    testEvent('endTransaction', true);
  });

  it('should emit insertChild', function () {
    testEvent('insertChild', 'foo', 2, 'bar');
  });

  it('should emit removeItem', function () {
    testEvent('removeItem', 'foo');
  });

  it('should emit moveItem', function () {
    testEvent('moveItem', 'foo', 'bar', 2);
  });

  it('should emit reloadItem', function () {
    testEvent('reloadItem', 'foo');
  });

  it('should insert items by default on drop', function () {
    let ds = new TreeDataSource;
    sinon.spy(ds, 'emit');
  
    ds.performDrop('foo', 2, null, ['bar', 'baz']);
    assert.deepEqual(ds.emit.getCall(0).args, ['startTransaction']);
    assert.deepEqual(ds.emit.getCall(1).args, ['insertChild', 'foo', 2, 'bar']);
    assert.deepEqual(ds.emit.getCall(2).args, ['insertChild', 'foo', 3, 'baz']);
    assert.deepEqual(ds.emit.getCall(3).args, ['endTransaction', undefined]);
  });

  it('should move items by default on drag and drop move', function () {
    let ds = new TreeDataSource;
    sinon.spy(ds, 'emit');
  
    ds.performMove('foo', 2, null, ['bar', 'baz']);
    assert.deepEqual(ds.emit.getCall(0).args, ['startTransaction']);
    assert.deepEqual(ds.emit.getCall(1).args, ['moveItem', 'bar', 'foo', 2]);
    assert.deepEqual(ds.emit.getCall(2).args, ['moveItem', 'baz', 'foo', 3]);
    assert.deepEqual(ds.emit.getCall(3).args, ['endTransaction', undefined]);
  });
});
