import {LayoutInfo} from './LayoutInfo';
import {Key} from 'react';

let KEY = 0;

/**
 * {@link CollectionView} creates instances of the {@link ReusableView} class to
 * represent views currently being displayed. ReusableViews manage a DOM node, handle
 * applying {@link LayoutInfo} objects to the view, and render content
 * as needed. Subclasses must implement the {@link render} method at a
 * minimum. Other methods can be overrided to customize behavior.
 */
export class ReusableView<T, V> {
  /** The LayoutInfo this view is currently representing. */
  layoutInfo: LayoutInfo | null;

  /** The content currently being displayed by this view, set by the collection view. */
  content: T;

  rendered: V;

  viewType: string;
  key: Key;

  constructor() {
    this.key = ++KEY;
  }

  /**
   * Prepares the view for reuse. Called just before the view is removed from the DOM.
   */
  prepareForReuse() {
    this.content = null;
    this.rendered = null;
    this.layoutInfo = null;
  }
}
