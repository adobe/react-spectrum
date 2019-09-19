import {DragTarget, DropPosition} from './DragTarget';
import {Layout} from './Layout';
import {LayoutInfo} from './LayoutInfo';
import {Rect} from './Rect';
import {Size} from './Size';
import {Collection} from './types';
import {Point} from './Point';

type ListLayoutOptions = {
  /** the height of a row in px. */
  rowHeight?: number,
  indentationForItem?: (collection: Collection, key: string) => number
};

/**
 * The ListLayout class is an implementation of a collection view {@link Layout}
 * it is used for creating lists and lists with indented sub-lists
 *
 * To configure a ListLayout, you can use the properties to define the
 * layouts and/or use the method for defining indentation.
 * The {@link ListLayoutDelegate} extends the existing collection view
 * delegate with an additional method to do this (it uses the same delegate object as
 * the collection view itself).
 */
export class ListLayout extends Layout {
  private rowHeight: number;
  private indentationForItem?: (collection: Collection, key: string) => number;
  private layoutInfos: {[key: string]: LayoutInfo};
  private contentHeight: number;

  /**
   * Creates a new ListLayout with options. See the list of properties below for a description
   * of the options that can be provided.
   */
  constructor(options: ListLayoutOptions = {}) {
    super();
    this.rowHeight = options.rowHeight || 48;
    this.indentationForItem = options.indentationForItem;
    this.layoutInfos = {};
    this.contentHeight = 0;
  }

  getLayoutInfo(type: string, key: string) {
    return this.layoutInfos[key];
  }

  getVisibleLayoutInfos(rect: Rect) {
    let res: LayoutInfo[] = [];
    for (let key in this.layoutInfos) {
      let layoutInfo = this.layoutInfos[key];
      if (layoutInfo.rect.intersects(rect)) {
        res.push(layoutInfo);
      }
    }

    return res;
  }

  validate() {
    this.layoutInfos = {};

    let y = 0;

    let keys = this.collectionView.data.getKeys();
    for (let key of keys) {
      let x = 0;
      if (typeof this.indentationForItem === 'function') {
        x = this.indentationForItem(this.collectionView.data, key) || 0;
      }

      let rect = new Rect(x, y, this.collectionView.visibleRect.width - x, this.rowHeight);
      this.layoutInfos[key] = new LayoutInfo('item', key, rect);

      y += this.rowHeight;
    }

    this.contentHeight = y;
  }

  getContentSize() {
    return new Size(this.collectionView.visibleRect.width, this.contentHeight);
  }

  getKeyAbove(key: string) {
    return this.collectionView.incrementKey(key, -1);
  }

  getKeyBelow(key: string) {
    return this.collectionView.incrementKey(key, 1);
  }

  getDragTarget(point: Point) {
    let visible = this.getVisibleLayoutInfos(new Rect(point.x, point.y, 1, 1));
    if (visible.length > 0) {
      visible = visible.sort((a, b) => b.zIndex - a.zIndex);
      return new DragTarget('item', visible[0].key);
    }

    return null;
  }

  getDropTarget(point: Point) {
    let key = this.collectionView.keyAtPoint(point);
    if (key) {
      return new DragTarget('item', key, DropPosition.ON);
    }

    return null;
  }

  getInitialLayoutInfo(layoutInfo: LayoutInfo) {
    layoutInfo.opacity = 0;
    layoutInfo.transform = 'scale3d(0.8, 0.8, 0.8)';
    return layoutInfo;
  }

  getFinalLayoutInfo(layoutInfo: LayoutInfo) {
    layoutInfo.opacity = 0;
    layoutInfo.transform = 'scale3d(0.8, 0.8, 0.8)';
    return layoutInfo;
  }
}
