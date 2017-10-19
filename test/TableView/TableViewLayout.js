import assert from 'assert';
import {Rect, Size} from '@react/collection-view';
import TableViewLayout from '../../src/TableView/js/TableViewLayout';

describe('TableViewLayout', function () {
  let layout = new TableViewLayout;
  layout.collectionView = {size: new Size(100, 100), getSectionLength: () => 100};

  it('should get a layout info for a row at the correct offset', function () {
    assert.deepEqual(layout.getLayoutInfo('item', 0, 0).rect, new Rect(0, 0, 100, 48));
    assert.deepEqual(layout.getLayoutInfo('item', 0, 1).rect, new Rect(0, 48, 100, 48));
  });

  it('should get all visible layout infos', function () {
    let layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 0, 100, 500));
    assert.equal(layoutInfos.length, 11);
    assert.equal(layoutInfos[0].rect.y, 0);
    assert.equal(layoutInfos[1].rect.y, 48);

    layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 500, 100, 500));
    assert.equal(layoutInfos[0].rect.y, 480);
    assert.equal(layoutInfos[1].rect.y, 528);
  });

  it('should calculate the content height', function () {
    layout.validate();
    assert.equal(layout.contentHeight, 4800);
  });
});
