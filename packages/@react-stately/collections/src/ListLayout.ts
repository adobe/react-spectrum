import {Collection, Node} from './types';
import {Key} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {Layout} from './Layout';
import {LayoutInfo} from './LayoutInfo';
// import {Point} from './Point';
import {Rect} from './Rect';
import {Size} from './Size';
// import { DragTarget, DropTarget, DropPosition } from '@react-types/shared';

type ListLayoutOptions<T> = {
  /** the height of a row in px. */
  rowHeight?: number,
  indentationForItem?: (collection: Collection<Node<T>>, key: Key) => number
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
export class ListLayout<T> extends Layout<Node<T>> implements KeyboardDelegate {
  private rowHeight: number;
  private indentationForItem?: (collection: Collection<Node<T>>, key: Key) => number;
  private layoutInfos: {[key: string]: LayoutInfo};
  private contentHeight: number;

  /**
   * Creates a new ListLayout with options. See the list of properties below for a description
   * of the options that can be provided.
   */
  constructor(options: ListLayoutOptions<T> = {}) {
    super();
    this.rowHeight = options.rowHeight || 48;
    this.indentationForItem = options.indentationForItem;
    this.layoutInfos = {};
    this.contentHeight = 0;
  }

  getLayoutInfo(type: string, key: Key) {
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

    let keys = this.collectionManager.collection.getKeys();
    for (let key of keys) {
      let type = this.collectionManager.collection.getItem(key).type;

      let x = 0;
      if (typeof this.indentationForItem === 'function') {
        x = this.indentationForItem(this.collectionManager.collection, key) || 0;
      }

      let rect = new Rect(x, y, this.collectionManager.visibleRect.width - x, this.rowHeight);
      this.layoutInfos[key] = new LayoutInfo(type, key, rect);

      y += this.rowHeight;
    }

    this.contentHeight = y;
  }

  getContentSize() {
    return new Size(this.collectionManager.visibleRect.width, this.contentHeight);
  }

  getKeyAbove(key: Key) {
    return this.collectionManager.collection.getKeyBefore(key);
  }

  getKeyBelow(key: Key) {
    return this.collectionManager.collection.getKeyAfter(key);
  }

  getKeyPageAbove(key: Key) {
    let layoutInfo = this.getLayoutInfo('item', key);
    let pageY = Math.max(0, layoutInfo.rect.y - this.collectionManager.visibleRect.height);
    while (layoutInfo.rect.y > pageY && layoutInfo) {
      let keyAbove = this.getKeyAbove(layoutInfo.key);
      layoutInfo = this.getLayoutInfo('item', keyAbove);
    }

    if (layoutInfo) {
      return layoutInfo.key;
    }

    return this.getFirstKey();
  }

  getKeyPageBelow(key: Key) {
    let layoutInfo = this.getLayoutInfo('item', key);
    let pageY = Math.min(this.collectionManager.contentSize.height, layoutInfo.rect.y + this.collectionManager.visibleRect.height);
    while (layoutInfo && layoutInfo.rect.y < pageY) {
      let keyBelow = this.getKeyBelow(layoutInfo.key);
      layoutInfo = this.getLayoutInfo('item', keyBelow);
    }

    if (layoutInfo) {
      return layoutInfo.key;
    }

    return this.getLastKey();
  }

  getFirstKey() {
    return this.collectionManager.collection.getFirstKey();
  }

  getLastKey() {
    return this.collectionManager.collection.getLastKey();
  }

  // getDragTarget(point: Point): DragTarget {
  //   let visible = this.getVisibleLayoutInfos(new Rect(point.x, point.y, 1, 1));
  //   if (visible.length > 0) {
  //     visible = visible.sort((a, b) => b.zIndex - a.zIndex);
  //     return {
  //       type: 'item',
  //       key: visible[0].key
  //     };
  //   }

  //   return null;
  // }

  // getDropTarget(point: Point): DropTarget {
  //   let key = this.collectionManager.keyAtPoint(point);
  //   if (key) {
  //     return {
  //       type: 'item',
  //       key,
  //       dropPosition: DropPosition.ON
  //     };
  //   }

  //   return null;
  // }

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
