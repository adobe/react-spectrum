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
import {DragTarget, IndexPath, Point, Rect, Size} from '@react/collection-view';
import sinon from 'sinon';
import {WaterfallLayout} from '../../src/GridView';

describe('WaterfallLayout', function () {
  let layout;
  beforeEach(function () {
    layout = new WaterfallLayout();
    let items = [
      {size: new Size(6000, 4000)},
      {size: new Size(8745, 3136)},
      {size: new Size(4000, 6000)},
      {size: new Size(6000, 4000)},
      {size: new Size(6000, 4000)},
      {size: new Size(6000, 4000)},
      {size: new Size(8745, 3136)},
      {size: new Size(4000, 6000)},
      {size: new Size(6000, 4000)},
      {size: new Size(6000, 4000)}
    ];

    layout.component = {props: {}};
    layout.collectionView = {
      size: new Size(1000, 1000),
      contentSize: new Size(1000, 1024),
      getNumberOfSections: () => 1,
      getSectionLength: () => items.length,
      incrementIndexPath: (indexPath, inc) => new IndexPath(indexPath.section, indexPath.index + inc),
      getItem: (section, index) => items[index],
      getItemView: () => null
    };

    layout.collectionView.delegate = {
      getItemSize: (item) => item.size
    };

    layout.validate({});
  });

  it('should layout some items', function () {
    let layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 0, 1000, 500));
    assert.equal(layoutInfos.length, 5);

    assert.deepEqual(layoutInfos[0].rect, new Rect(24, 24, 301, 257));
    assert.deepEqual(layoutInfos[1].rect, new Rect(350, 24, 301, 192));
    assert.deepEqual(layoutInfos[4].rect, new Rect(24, 305, 301, 257));

    let layoutInfo = layout.getLayoutInfo('item', 0, 5);
    assert.deepEqual(layoutInfo.rect, new Rect(350, 521, 301, 257));

    assert.deepEqual(layout.getContentSize(), new Size(1000, 1118));
  });

  it('should get a drop target with dropPosition="on"', function () {
    layout.component.props.dropPosition = 'on';
    layout.collectionView.indexPathAtPoint = sinon.stub().returns(new IndexPath(0, 5));

    let target = layout.getDropTarget(new Point(28, 100));
    assert.deepEqual(layout.collectionView.indexPathAtPoint.getCall(0).args[0], new Point(28, 100));
    assert.deepEqual(target, new DragTarget('item', new IndexPath(0, 5), DragTarget.DROP_ON));
  });

  it('should get a drop target on the whole table with dropPosition="on"', function () {
    layout.component.props.dropPosition = 'on';
    layout.collectionView.indexPathAtPoint = sinon.stub().returns(null);

    let target = layout.getDropTarget(new Point(28, 100));
    assert.deepEqual(layout.collectionView.indexPathAtPoint.getCall(0).args[0], new Point(28, 100));
    assert.deepEqual(target, new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN));
  });

  it('should get the indexPathAbove', function () {
    assert.deepEqual(layout.indexPathAbove(new IndexPath(0, 4)), new IndexPath(0, 0));
  });

  it('should get the indexPathBelow', function () {
    assert.deepEqual(layout.indexPathBelow(new IndexPath(0, 0)), new IndexPath(0, 4));
  });

  it('should get the indexPathLeftOf', function () {
    assert.deepEqual(layout.indexPathLeftOf(new IndexPath(0, 5)), new IndexPath(0, 7));
  });

  it('should get the indexPathRightOf', function () {
    assert.deepEqual(layout.indexPathRightOf(new IndexPath(0, 0)), new IndexPath(0, 1));
  });
});
