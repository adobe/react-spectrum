import {EventEmitter} from 'events';

/**
 * TreeDataSource is a common data source used by views that render heirarchical data,
 * such as [TreeView](/components/TreeView) and [ColumnView](/components/ColumnView). 
 * It supports async loading, drag and drop, and has methods to update data in connected components.
 */
export default class TreeDataSource extends EventEmitter {
  /**
   * Loads and returns the child items for the given parent.
   * The parent will be `null` if it is the root.
   * @param {object} item
   * @return {object[]}
   * @abstract
   */
  async getChildren(item) {
    throw new Error('getChildren must be implemented by subclasses');
  }

  /**
   * Returns whether the given parent item has children
   * @param {object} parent
   * @return {boolean}
   * @abstract
   */
  hasChildren(parent) {
    throw new Error('hasChildren must be implemented by subclasses');
  }

  /**
   * Starts a transaction. All changes until `endTransaction` is called
   * are batched together and applied at once.
   */
  startTransaction() {
    this.emit('startTransaction');
  }

  /**
   * Ends a transaction. All changes since the last `startTransaction` call
   * are applied together.
   * @param {boolean} [animated=true] whether the changes should be animated
   */
  endTransaction(animated) {
    this.emit('endTransaction', animated);
  }

  /**
   * Inserts a child into the given parent item.
   * @param {object} parent - The parent object to insert into
   * @param {number} index - The child insertion index
   * @param {object} child - The child to insert
   */
  insertChild(parent, index, child) {
    this.emit('insertChild', parent, index, child);
  }

  /**
   * Removes an item from its parent.
   * @param {object} item - The item to remove
   */
  removeItem(item) {
    this.emit('removeItem', item);
  }

  /**
   * Moves an item to a new parent, or to a new index within the same parent
   * @param {object} fromParent - The item to move
   * @param {object} [toParent] - The parent item to move to. If not provided, the item is moved within the same parent.
   * @param {number} toIndex - The index to move the item to
   */
  moveItem(item, toParent, toIndex) {
    this.emit('moveItem', item, toParent, toIndex);
  }

  /**
   * Reloads the given item
   * @param {object} item
   */
  reloadItem(item) {
    this.emit('reloadItem', item);
  }

  /**
   * Performs a drop operation on an item in the tree. By default,
   * it inserts all of the items into the target at the start.
   * @param {object} target - the target item of the drop
   * @param {object} index - the index within the target to insert the items at
   * @param {DropOperation} dropOperation - the operation to perform
   * @param {Array} items - the items being dropped
   */
  performDrop(target, index, dropOperation, items) {
    this.startTransaction();

    for (let item of items) {
      this.insertChild(target, index++, item);
    }

    this.endTransaction();
  }

  /**
   * Performs a drag and drop move operation. By default,
   * it inserts all of the items into the target at the start.
   * @param {object} target - the target item of the drop
   * @param {object} index - the index within the target to move the items to
   * @param {DropOperation} dropOperation - the operation to perform
   * @param {Array} items - the items being moved
   */
  performMove(target, index, dropOperation, items) {
    this.startTransaction();

    for (let item of items) {
      this.moveItem(item, target, index++);
    }

    this.endTransaction();
  }
}
