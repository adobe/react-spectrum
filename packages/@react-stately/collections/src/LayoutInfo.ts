import {Key} from 'react';
import {Rect} from './Rect';

/**
 * Instances of this lightweight class are created by {@link Layout} subclasses
 * to represent each view in the {@link CollectionView}. LayoutInfo objects describe 
 * various properties of a view, such as its position and size, and style information.
 * The collection view uses this information when creating actual views to display.
 */
export class LayoutInfo {
  /**
   * A string representing the view type. Should be `'item'` for item views.
   * Other types are used by supplementary views.
   */
  type: string;

  /**
   * A unique key for this view. For item views, it should match the content key.
   */
  key: Key;

  /**
   * The rectangle describing the size and position of this view.
   */
  rect: Rect;

  /**
   * Whether the size is estimated. `false` by default.
   */
  estimatedSize: boolean;

  /**
   * The view's opacity. 1 by default.
   */
  opacity: number;

  /**
   * A CSS transform string to apply to the view. `null` by default.
   */
  transform: string | null;

  /**
   * The z-index of the view. 0 by default.
   */
  zIndex: number;

  /**
   * @param type A string representing the view type. Should be `'item'` for item views. 
                            Other types are used by supplementary views.
   * @param key The unique key for this view.
   * @param rect The rectangle describing the size and position of this view.
   */
  constructor(type: string, key: Key, rect: Rect) {
    this.type = type;
    this.key = key;
    this.rect = rect;
    this.estimatedSize = false;
    this.opacity = 1;
    this.transform = null;
    this.zIndex = 0;
  }
  
  /**
   * Returns a copy of the LayoutInfo.
   */
  copy(): LayoutInfo {
    let res = new LayoutInfo(this.type, this.key, this.rect.copy());
    res.estimatedSize = this.estimatedSize;
    res.opacity = this.opacity;
    res.transform = this.transform;
    return res;
  }
}
