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
import {data, TestDataSource} from './TreeViewDataSource';
import {DragTarget, IndexPath} from '@react/collection-view';
import sinon from 'sinon';
import TreeViewDelegate from '../../src/TreeView/js/TreeViewDelegate';

describe('TreeViewDelegate', function () {
  let ds;
  beforeEach(async function () {
    ds = new TestDataSource;
    await ds.loadData();
  });

  it('should proxy shouldSelectItem', async function () {    
    let stub = sinon.stub().returns(true);
    let delegate = new TreeViewDelegate(ds, {
      shouldSelectItem: stub
    });

    delegate.shouldSelectItem(new IndexPath(0, 0));
    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, [data[0]]);
  });

  it('should proxy shouldDrag', async function () {    
    let stub = sinon.stub().returns(true);
    let delegate = new TreeViewDelegate(ds, {
      shouldDrag: stub
    });

    delegate.shouldDrag(new DragTarget('item', new IndexPath(0, 0)), [new IndexPath(0, 0)]);
    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, [data[0], [data[0]]]);
  });

  it('should proxy getAllowedDropOperations', async function () {    
    let stub = sinon.stub().returns(true);
    let delegate = new TreeViewDelegate(ds, {
      getAllowedDropOperations: stub
    });

    delegate.getAllowedDropOperations(new DragTarget('item', new IndexPath(0, 0)), [new IndexPath(0, 0)]);
    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, [data[0], [data[0]]]);
  });

  it('should proxy prepareDragData', async function () {    
    let stub = sinon.stub().returns(true);
    let delegate = new TreeViewDelegate(ds, {
      prepareDragData: stub
    });

    let dataTransfer = {
      setData: sinon.stub()
    };

    delegate.prepareDragData(new DragTarget('item', new IndexPath(0, 0)), dataTransfer, [new IndexPath(0, 0)]);
    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, [data[0], dataTransfer, [data[0]]]);
  });

  it('should set default drag data in prepareDragData', async function () {    
    let delegate = new TreeViewDelegate(ds, {});
    let dataTransfer = {
      setData: sinon.stub()
    };

    delegate.prepareDragData(new DragTarget('item', new IndexPath(0, 0)), dataTransfer, [new IndexPath(0, 0)]);
    assert(dataTransfer.setData.calledOnce);
    assert.deepEqual(dataTransfer.setData.getCall(0).args, ['CollectionViewData', JSON.stringify([data[0]])]);
  });

  it('should support shouldAcceptDrop', async function () {    
    let stub = sinon.stub().returns(true);
    let delegate = new TreeViewDelegate(ds, {
      shouldAcceptDrop: stub
    });

    delegate.getDropTarget(new DragTarget('item', new IndexPath(0, 0)));
    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, [data[0]]);
  });

  it('should proxy getDropOperation', async function () {    
    let stub = sinon.stub().returns(true);
    let delegate = new TreeViewDelegate(ds, {
      getDropOperation: stub
    });

    delegate.getDropOperation(new DragTarget('item', new IndexPath(0, 0)), 1);
    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, [data[0], 1]);
  });

  it('should proxy itemsForDrop', async function () {    
    let stub = sinon.stub().returns(true);
    let delegate = new TreeViewDelegate(ds, {
      itemsForDrop: stub
    });

    let dataTransfer = {
      getData: sinon.stub()
    };

    delegate.itemsForDrop(new DragTarget('item', new IndexPath(0, 0)), dataTransfer);
    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, [data[0], dataTransfer]);
  });

  it('should proxy shouldDeleteItems', async function () {    
    let stub = sinon.stub().returns(true);
    let delegate = new TreeViewDelegate(ds, {
      shouldDeleteItems: stub
    });

    delegate.shouldDeleteItems([new IndexPath(0, 0)]);
    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, [[data[0]]]);
  });
});
