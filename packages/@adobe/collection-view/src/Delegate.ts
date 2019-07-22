import {Item} from "./types";
import {ReusableView} from "./ReusableView";
import {Rect} from "./Rect";

// These classes are only used for documentation purposes.

/**
 * The collection view delegate is an object with methods that will be called
 * by the {@link CollectionView} to configure its behavior. For example,
 * it has methods to classify item objects, and create instances of views
 * on behalf of the collection view.
 *
 * {@link EditableCollectionView} extends the delegate with more methods
 * related to handling user interaction. See {@link EditableCollectionViewDelegate}.
 *
 * @interface
 */
export interface CollectionViewDelegate {
  /**
   * Returns the type of view to display for the given item
   * @param item An item as returned by the {@link DataSource}
   */
  getType(item: Item): string;

  /**
   * Creates and returns a view for the item with the given parameters.
   * The content, and LayoutInfo for the view will be set subsequently,
   * and should not be set by the delegate.
   *
   * @param type The type of view to create
   * @param key The key of the view to create
   */
  createView(type: string, key: string): ReusableView;

  /**
   * Returns the content to apply to the supplementary view with the
   * given parameters. The view will have been created by a previous
   * call to {@link createView}.
   *
   * @param type The type of supplementary view
   * @param key The key of the supplementary view
   */
  getContentForExtraView(type: string, key: string): any;

  /**
   * Returns a key to use as the anchor of the scroll position
   *
   * @param visibleRect The visible rectangle
   */
  getScrollAnchor(visibleRect: Rect): string
}

/**
 * {@link EditableCollectionView} extends the existing {@link CollectionViewDelegate}
 * with additional methods to allow configuration of its behavior. These methods relate
 * to user interaction, specifically drag and drop. All of the methods are optional,
 * and if not provided, the collection view will use its default behavior.
 *
 * @interface
 */
// interface EditableCollectionViewDelegate extends CollectionViewDelegate {
//   /**
//    * Returns whether the user is allowed to select the given indexPath
//    * @param {IndexPath} indexPath
//    * @return {boolean}
//    */
//   shouldSelectItem(indexPath) {}

//   /**
//    * Returns whether the user is allowed to drag the given DragTarget
//    * @param {DragTarget} dragTarget
//    * @param {IndexPathSet} selectedIndexPaths
//    * @return {boolean}
//    */
//   shouldDrag(dragTarget, selectedIndexPaths) {}

//   /**
//    * Returns a bit mask representing the allowed drop operations for a drag source.
//    * @param {DragTarget} dragTarget
//    * @param {IndexPathSet} selectedIndexPaths
//    * @return {DropOperation}
//    */
//   getAllowedDropOperations(dragTarget, selectedIndexPaths) {}

//   /**
//    * Should set data to be dragged for a given DragTarget on the provided
//    * DataTransfer object. For example, plain text and json versions of the
//    * items to be dragged could be set.
//    * @param {DragTarget} dragTarget - The initial target of the drag
//    * @param {DataTransfer} dataTransfer - The DOM DataTransfer object for the drag
//    * @param {IndexPathSet} selectedIndexPaths
//    */
//   prepareDragData(dragTarget, dataTransfer, selectedIndexPaths) {}

//   /**
//    * Should return a view to display as the image under the cursor during the drag
//    * @param {DragTarget} dragTarget - The initial target of the drag
//    * @param {IndexPathSet} selectedIndexPaths
//    * @return {ReusableView}
//    */
//   getDragView(dragTarget, selectedIndexPaths) {}

//   /**
//    * Called when a drag initiated by this collection view is dropped somewhere.
//    * @param {DragTarget} dragTarget - The initial target of the drag
//    * @param {DataTransfer} dataTransfer - The DOM DataTransfer object for the drag
//    */
//   dropAccepted(dragTarget, dataTransfer) {}

//   /**
//    * Returns whether a drop event should be accepted. Called when the drag enters the
//    * collection view. Usually, you will look at the drag types to determine whether a
//    * drop should be accepted.
//    * @param {Event} event - The DOM event
//    * @return {boolean}
//    */
//   shouldAcceptDrop(event) {}

//   /**
//    * Returns a {@link DragTarget} specifying where a drag should be dropped.
//    * The given target is the {@link DragTarget} returned by the layout.
//    * Use this method if you want to override what the layout returns.
//    * @param {DragTarget} target - The original target from the layout
//    * @param {Point} point - The point on the screen where the drag is
//    * @return {DragTarget}
//    */
//   getDropTarget(target, point) {}

//   /**
//    * Gets the drop operation that will occur when dropping on the given target.
//    * @param {DragTarget} dropTarget - the drop target
//    * @param {DropOperation} allowedOperations - a bit mask representing the allowed drop operations
//    */
//   getDropOperation(dropTarget, allowedOperations) {}

//   /**
//    * Called when the drop target within this collection view changes.
//    * @param {DragTarget} target - The new drop target
//    */
//   dropTargetUpdated(target) {}

//   /**
//    * Returns an array of items or sections to insert for the given drop target.
//    * @param {DragTarget} dropTarget - The target of the drop
//    * @param {DataTransfer} dataTransfer - The DOM DataTransfer object for the drop
//    * @return {Array}
//    */
//   itemsForDrop(dropTarget, dataTransfer) {}

//   /**
//    * Returns whether the user is allowed to delete the items in the given index paths.
//    * @param {IndexPathSet} indexPaths
//    * @return {boolean}
//    */
//   shouldDeleteItems(indexPaths) {}
// }

// /**
//  * {@link ListLayout} calls these methods on the same delegate object as the collection
//  * view uses in order to determine layout information. All of the methods are optional:
//  * if not provided, the default values from the properties of ListLayout are used.
//  * @interface
//  */
// class ListLayoutDelegate extends CollectionViewDelegate {
//   /**
//    * Returns a CSS style object for the header view in the provided section,
//    * or `null` for no header.
//    * @param {string} key - The section the item would be in
//    * @return {number} - The amount of indentation in px
//    */
//   indentationForItem(key) {}
// }

// /** @external {DataTransfer} https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer */
// /** @external {EventEmitter} https://nodejs.org/api/events.html#events_class_events_eventemitter */
