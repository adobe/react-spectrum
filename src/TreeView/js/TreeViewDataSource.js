import {ArrayDataSource, IndexPath} from '@react/collection-view';
import autobind from 'autobind-decorator';

/**
 * Represents a node in the tree
 * @private
 */
class TreeItem {
  constructor(item, parent, hasChildren, index) {
    this.item = item;
    this.hasChildren = hasChildren;
    this.children = null;
    this.isToggleable = true;
    this.isExpanded = false;
    this.isVisible = false;
    this.isLoading = false;
    this.parent = parent;
    this.level = parent ? parent.level + 1 : -1;
    this.index = index;
  }

  walk(fn, all = false) {
    if (!this.children) {
      return;
    }

    for (let child of this.children) {
      fn(child);
      if (child.isExpanded || all) {
        child.walk(fn);
      }
    }
  }

  get nextSibling() {
    if (!this.parent || !this.parent.children) {
      return null;
    }

    let siblings = this.parent.children;
    return siblings[this.index + 1];
  }

  updateChildIndices(start = 0, end) {
    if (!this.children) {
      return;
    }

    if (end == null) {
      end = this.children.length;
    }

    for (let i = start; i < end; i++) {
      this.children[i].index = i;
    }
  }
}

/*
 * TreeViewDataSource is the super class for all data sources used
 * by TreeView. It manages expanding and collapsing items, loading
 * children on demand, and manipulation of that data. Because it
 * uses content objects as the keys for many of its methods, all
 * items in the tree must be unique.
 */
export default class TreeViewDataSource extends ArrayDataSource {
  constructor(dataSource) {
    super([[]]);

    this.root = new TreeItem(null, null, false);
    this.root.isExpanded = true;
    this.lookup = new Map;
    this.dataSource = dataSource;

    if (dataSource && typeof dataSource.on === 'function') {
      // Bind methods that come from ArrayDataSource
      this.startTransaction = this.startTransaction.bind(this);
      this.endTransaction = this.endTransaction.bind(this);

      // Setup event handlers
      dataSource.on('startTransaction', this.startTransaction);
      dataSource.on('endTransaction', this.endTransaction);
      dataSource.on('insertChild', this.insertChild);
      dataSource.on('removeItem', this.removeItem);
      dataSource.on('moveItem', this.moveItem);
      dataSource.on('reloadItem', this.reloadItem);
    }

    process.nextTick(() => this.loadData());
  }

  teardown() {
    if (this.dataSource && typeof this.dataSource.removeListener === 'function') {
      this.dataSource.removeListener('startTransaction', this.startTransaction);
      this.dataSource.removeListener('endTransaction', this.endTransaction);
      this.dataSource.removeListener('insertChild', this.insertChild);
      this.dataSource.removeListener('removeItem', this.removeItem);
      this.dataSource.removeListener('moveItem', this.moveItem);
      this.dataSource.removeListener('reloadItem', this.reloadItem);
    }
  }

  async loadData() {
    this.lookup = new Map;
    await this.loadChildren(this.root);

    let items = [];
    this.root.walk(child => {
      child.isVisible = true;
      items.push(child);
    });

    this.replaceSection(0, items, false);
    this.emit('load');
  }

  async loadChildren(parent) {
    parent.isLoading = true;
    this.reloadItem(parent.item);

    let items = await this.getChildren(parent.item);
    let res = [];
    let index = 0;

    for (let item of items) {
      let node = this.getTreeItem(item, parent, index++);

      if (node.isExpanded) {
        await this.loadChildren(node);
      }

      res.push(node);
      this.lookup.set(item, node);
    }

    parent.children = res;
    parent.hasChildren = res.length > 0;
    parent.isLoading = false;
    this.reloadItem(parent.item);
  }

  getTreeItem(item, parent, index) {
    return new TreeItem(item, parent, this.hasChildren(item), index);
  }

  /**
   * Loads and returns the child items for the given parent.
   * The parent will be `null` if it is the root.
   * @param {object} parent
   * @return {object[]}
   * @abstract
   */
  async getChildren(parent) {
    if (this.dataSource) {
      return this.dataSource.getChildren(parent);
    }

    throw new Error('getChildren must be implemented by subclasses');
  }

  /**
   * Returns whether the given parent item has children
   * @param {object} parent
   * @return {boolean}
   * @abstract
   */
  hasChildren(parent) {
    if (this.dataSource) {
      return this.dataSource.hasChildren(parent);
    }

    throw new Error('hasChildren must be implemented by subclasses');
  }

  _getItem(parent) {
    if (!parent) {
      return this.root;
    }

    let node = this.lookup.get(parent);
    if (node) {
      return node;
    }

    // If nothing was found in the lookup, an equivalent object may exist with different object identity.
    // Search through the map to find one that matches the isItemEqual comparator.
    return this._findItem(this.lookup.values(), parent);
  }

  _findItem(haystack, needle) {
    let isItemEqual = this.dataSource && this.dataSource.isItemEqual;
    if (typeof isItemEqual !== 'function') {
      return null;
    }

    for (let node of haystack) {
      if (isItemEqual(node.item, needle)) {
        return node;
      }
    }

    return null;
  }

  /**
   * Returns the row IndexPath for the provided item, and optionally
   * increments it by the given number of rows.
   * @param {object} item
   * @param {number?} inc
   * @returns {IndexPath}
   */
  indexPathForItem(item, inc = 0) {
    let content = this._getItem(item);
    if (!content) {
      return null;
    }

    let index = this.sections[0].indexOf(content);
    if (index === -1) {
      return null;
    }

    return new IndexPath(0, index + inc);
  }

  /**
   * Reloads the given item
   * @param {object} item
   */
  @autobind
  reloadItem(item) {
    let indexPath = this.indexPathForItem(item);
    if (indexPath) {
      this.emit('reloadItem', indexPath, false);
    }
  }

  /**
   * Returns an array of children that are currently
   * loaded for the given parent item, or null if the
   * children have not been loaded for that parent.
   * @param {object} parent
   * @return {object[]}
   */
  getLoadedChildren(parent) {
    let item = this._getItem(parent);
    if (!item || !item.children) {
      return null;
    }

    return item.children.map(child => child.item);
  }

  /**
   * Returns whether the given content item is expanded
   * @param {object} item
   * @return {boolean}
   */
  isExpanded(item) {
    let node = this._getItem(item);
    return node && node.isExpanded;
  }

  /**
   * Expands or collapses the given item depending on its current state.
   * @param {object} item
   */
  async toggleItem(item) {
    let node = this._getItem(item);
    if (!node) {
      return;
    }

    if (node.isExpanded) {
      this.collapseItem(node.item);
    } else {
      await this.expandItem(node.item);
    }
  }

  /**
   * Expands the given item, displaying all of its children.
   * @param {object} item
   */
  async expandItem(item) {
    let node = this._getItem(item);
    if (!node || node.isExpanded) {
      return;
    }

    // Update parent
    node.isExpanded = true;
    this.reloadItem(node.item);

    // Load children if needed.
    if (!node.children) {
      await this.loadChildren(node);
    }

    // Add all children to the visible set
    this.startTransaction();

    let indexPath = this.indexPathForItem(node.item);
    node.walk(child => {
      indexPath.index++;
      if (!child.isVisible) {
        child.isVisible = true;
        this.insertItem(indexPath, child);
      }
    });

    this.endTransaction();
  }

  /**
   * Collapses the given item, hiding all of its children.
   * @param {object} item
   */
  collapseItem(item) {
    let node = this._getItem(item);
    if (!node || !node.isExpanded) {
      return;
    }

    // Update parent
    node.isExpanded = false;
    this.reloadItem(node.item);

    // Remove all children from visible
    this.startTransaction();

    let indexPath = this.indexPathForItem(node.item, +1);
    node.walk(child => {
      if (child.isVisible) {
        child.isVisible = false;
        super.removeItem(indexPath);
      }
    });

    this.endTransaction();
  }

  _findInsertionIndex(parent, index) {
    let parentItem = this._getItem(parent);
    if (!parentItem.isExpanded) {
      return null;
    }

    // If there are no children, insert after the parent item.
    if (parentItem.children.length === 0) {
      return this.indexPathForItem(parentItem.item, +1);
    }

    // Check if appending to the parent
    if (index >= parentItem.children.length) {
      // Insert before the next sibling.
      let nextSibling = parentItem.nextSibling;
      if (nextSibling) {
        return this.indexPathForItem(nextSibling.item);
      } else {
        return new IndexPath(0, this.sections[0].length);
      }
    }

    // Otherwise, insert before the current item at the given index.
    return this.indexPathForItem(parentItem.children[index].item);
  }

  /**
   * Inserts a child into the given parent item.
   * @param {object} parent - The parent object to insert into
   * @param {number} index - The child insertion index
   * @param {object} child - The child to insert
   */
  @autobind
  insertChild(parent, index, child) {
    let parentItem = this._getItem(parent);
    if (!parentItem) {
      return;
    }

    // Make sure the disclosure indicator is correct
    if (!parentItem.hasChildren) {
      parentItem.hasChildren = true;
      this.reloadItem(parentItem.item);
    }

    // If the children have been loaded, insert the new child
    if (parentItem.children) {
      let insertionIndex = this._findInsertionIndex(parentItem.item, index);
      let childItem = new TreeItem(child, parentItem, this.hasChildren(child), index);
      parentItem.children.splice(index, 0, childItem);
      parentItem.updateChildIndices(index + 1);
      this.lookup.set(child, childItem);

      // Add to the visible items if the parent is expanded
      if (parentItem.isExpanded) {
        childItem.isVisible = true;
        this.insertItem(insertionIndex, childItem);
      }
    }
  }

  /**
   * Removes a child index from the given parent item.
   * @param {object} parent - The parent item to remove from
   * @param {number} index - The child index to remove
   */
  removeChild(parent, index) {
    let parentItem = this._getItem(parent);
    if (!parentItem || !parentItem.children) {
      return;
    }

    // Remove the child
    let child = parentItem.children[index];
    parentItem.children.splice(index, 1);
    parentItem.updateChildIndices(index);

    // Make sure the disclosure indicator is correct
    if (parentItem.children.length === 0) {
      parentItem.hasChildren = false;
      this.reloadItem(parentItem.item);
    }

    // Remove from the visible items if the parent is expanded
    if (parentItem.isExpanded) {
      this.startTransaction();

      let indexPath = this.indexPathForItem(child.item);
      child.isVisible = false;
      super.removeItem(indexPath);

      // Remove all children
      if (child.isExpanded) {
        child.walk(child => {
          child.isVisible = false;
          super.removeItem(indexPath);
        });
      }

      this.endTransaction();
    }

    // Remove all children from the lookup map
    child.walk(child => {
      this.lookup.delete(child.item);
    }, true);

    this.lookup.delete(child.item);
  }

  /**
   * Removes an item from the tree view.
   * @param {object} item - The item to remove
   */
  @autobind
  removeItem(item) {
    let node = this._getItem(item);
    if (!node) {
      return;
    }

    this.removeChild(node.parent.item, node.index);
  }

  /**
   * Moves an item from one parent to another
   * @param {object} fromParent - The parent item to move from
   * @param {number} fromIndex - The index of the child item to move
   * @param {object} toParent - The parent item to move to
   * @param {number} toIndex - The index to move the item to
   */
  moveChild(fromParent, fromIndex, toParent, toIndex) {
    let fromItem = this._getItem(fromParent);
    let toItem = this._getItem(toParent);
    if (!fromItem || !fromItem.children || !toItem) {
      return;
    }

    // Find the visible indexes to update
    let child = fromItem.children[fromIndex];
    let fromVisibleIndex = this.indexPathForItem(child.item);
    let toVisibleIndex = this._findInsertionIndex(toItem.item, toIndex);

    // Move the child to the new parent
    child.parent = toItem;
    child.level = toItem.level + 1;

    fromItem.children.splice(fromIndex, 1);
    if (toItem.children) {
      toItem.children.splice(toIndex, 0, child);
    }

    // Update indices of changed items
    if (fromItem === toItem) {
      fromItem.updateChildIndices(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex) + 1);
    } else {
      fromItem.updateChildIndices(fromIndex);
      toItem.updateChildIndices(toIndex);
    }

    // Reload both parents to ensure the disclosure indicators are correct
    if (fromItem.children.length === 0) {
      fromItem.hasChildren = false;
      this.reloadItem(fromItem.item);
    }

    if (!toItem.hasChildren) {
      toItem.hasChildren = true;
      this.reloadItem(toItem.item);
    }

    // Move, remove, or insert the item from visible depending on whether parents are expanded
    if (fromItem.isExpanded && toItem.isExpanded) {
      if (toVisibleIndex.index > fromVisibleIndex.index) {
        toVisibleIndex.index--;
      }

      super.moveItem(fromVisibleIndex, toVisibleIndex);
    } else if (fromItem.isExpanded) {
      child.isVisible = false;
      super.removeItem(fromVisibleIndex);
    } else if (toItem.isExpanded) {
      child.isVisible = true;
      this.insertItem(toVisibleIndex, child);
    }
  }

  /**
   * Moves an item to a new parent, or to a new index within the same parent
   * @param {object} fromParent - The item to move
   * @param {object} [toParent] - The parent item to move to. If not provided, the item is moved within the same parent.
   * @param {number} toIndex - The index to move the item to
   */
  @autobind
  moveItem(item, toParent, toIndex) {
    let node = this._getItem(item);
    if (!node) {
      return;
    }

    if (typeof toParent === 'number') {
      toIndex = toParent;
      toParent = node.parent.item;
    }

    this.moveChild(node.parent.item, node.index, toParent, toIndex);
  }

  performDrop(dropTarget, dropOperation, items) {
    if (this.dataSource && typeof this.dataSource.performDrop === 'function') {
      let target = this.getItem(dropTarget.indexPath.section, dropTarget.indexPath.index);
      if (dropTarget.dropPosition === 'DROP_ON') {
        this.dataSource.performDrop(target.item, 0, dropOperation, items);
      } else {
        this.dataSource.performDrop(target.parent.item, target.index, dropOperation, items);
      }
    }
  }

  performReorder(dragTarget, dropTarget, dropOperation, indexPaths) {
    if (this.dataSource && typeof this.dataSource.performMove === 'function') {
      let target = this.getItem(dropTarget.indexPath.section, dropTarget.indexPath.index);
      let items = Array.from(indexPaths)
        .map(indexPath => this.getItem(indexPath.section, indexPath.index).item)
        .filter(item => item !== target.item);
      if (items.length === 0) {
        return;
      }
      
      if (dropTarget.dropPosition === 'DROP_ON') {
        this.dataSource.performMove(target.item, 0, dropOperation, items);
      } else {
        this.dataSource.performMove(target.parent.item, target.index, dropOperation, items);
      }
    }
  }
}
