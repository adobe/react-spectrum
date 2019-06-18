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

import {ArrayDataSource, IndexPath} from '@react/collection-view';
import autobind from 'autobind-decorator';
import createId from '../../utils/createId';
import {EventEmitter} from 'events';

@autobind
class ItemNode {
  constructor(item, parent, hasChildren, index) {
    this.id = createId();
    this.item = item;
    this.children = null;
    this.hasChildren = hasChildren;
    this.parent = parent;
    this.isLoading = false;
    this.index = index;
    this.highlightedChild = null;
  }

  getItemId() {
    return `${this.id}-item`;
  }

  getColumnId() {
    return `${this.id}-column`;
  }

  walk(fn) {
    if (!this.children) {
      return;
    }
    
    for (let child of this.children.sections[0]) {
      fn(child);
      child.walk(fn);
    }
  }

  updateChildIndices(start = 0, end) {
    if (!this.children) {
      return;
    }

    if (end == null) {
      end = this.children.sections[0].length;
    }

    for (let i = start; i < end; i++) {
      this.children.sections[0][i].index = i;
    }
  }
}

/*
 * ColumnViewDataSource is the base class for data sources of a ColumnView.
 * There are two required methods that must be implemented by subclasses:
 * `getChildren`, and `hasChildren`.
 */
export default class ColumnViewDataSource extends EventEmitter {
  constructor(dataSource) {
    super();

    this.root = new ItemNode(null, null, false);
    this.navigationStack = [];
    this.lookup = new Map;
    this.selectedItems = new Set;
    this.dataSource = dataSource;

    if (dataSource && typeof dataSource.on === 'function') {
      dataSource.on('insertChild', this.insertChild);
      dataSource.on('removeItem', this.removeItem);
      dataSource.on('moveItem', this.moveItem);
      dataSource.on('reloadItem', this.reloadItem);
    }
  }

  teardown() {
    if (this.dataSource && typeof this.dataSource.removeListener === 'function') {
      this.dataSource.removeListener('insertChild', this.insertChild);
      this.dataSource.removeListener('removeItem', this.removeItem);
      this.dataSource.removeListener('moveItem', this.moveItem);
      this.dataSource.removeListener('reloadItem', this.reloadItem);
    }
  }

  /**
   * Returns an array of children for an item
   * @param {object} item
   * @return {object[]}
   * @abstract
   */
  async getChildren(item) {
    if (this.dataSource) {
      return this.dataSource.getChildren(item);
    }

    throw new Error('Must be implemented by subclass');
  }

  /**
   * Returns whether an item has children
   * @param {object} item
   * @return {boolean}
   * @abstract
   */
  hasChildren(item) {
    if (this.dataSource) {
      return this.dataSource.hasChildren(item);
    }

    throw new Error('Must be implemented by subclass');
  }

  /**
   * Navigates to an item by loading its children and showing them in a new column
   * @param {object} item
   */
  async navigateToItem(item) {
    let parentNode = this._lookupItem(item);
    if (!parentNode || this.navigationStack[this.navigationStack.length - 1] === parentNode) {
      return;
    }

    // Build the new navigation stack and immediately trigger a navigate
    // so that the columns to the right of the selected item are cleared while
    // the new column loads.
    let stack = [];
    let node = parentNode;
    while (node) {
      stack.unshift(node);
      node = node.parent;
    }
    
    // Store the highlighted child so that when we go away and come back from this column,
    // the same item will be highlighted.
    if (parentNode.parent) {
      parentNode.parent.highlightedChild = parentNode.item;
    }

    this.navigationStack = stack;
    this.emit('navigate', stack.slice(1).map(i => i.item));

    // Load children if needed
    if (!parentNode.children) {
      parentNode.isLoading = true;
      this._reloadItem(parentNode);

      let children = await this.getChildren(parentNode.item) || [];

      let childNodes = children.map((child, index) => {
        let node = new ItemNode(child, parentNode, this.hasChildren(child), index);
        this.lookup.set(child, node);
        return node;
      });

      parentNode.hasChildren = childNodes.length > 0;
      parentNode.children = new ArrayDataSource([childNodes]);
      parentNode.isLoading = false;
      this._reloadItem(parentNode);

      this.emit('navigate', stack.slice(1).map(i => i.item));
    }
  }

  /**
   * Navigates to the previous column
   */
  async navigateToPrevious() {
    if (this.navigationStack.length > 2) {
      await this.navigateToItem(this.navigationStack[this.navigationStack.length - 2].item);
    }
  }

  /**
   * Navigates to the first child of the last column
   */
  async navigateToNext() {
    let item = this.navigationStack[this.navigationStack.length - 1];
    if (item && item.hasChildren) {
      await this.navigateToItem(item.highlightedChild || item.children.getItem(0, 0).item);
    }
  }

  async setNavigatedPath(navigationPath) {
    // Load root items if they are not yet loaded
    if (this.navigationStack.length === 0) {
      await this.navigateToItem(null);
    }

    // If last navigated item is the same, there is nothing to update.
    let lastItem = navigationPath.length > 0 ? navigationPath[navigationPath.length - 1] : null;
    if (this.navigationStack[this.navigationStack.length - 1].item === lastItem) {
      return;
    }

    // Find the deepest already loaded item
    let index = navigationPath.length - 1;
    while (index >= 0 && !this._lookupItem(navigationPath[index])) {
      index--;
    }

    for (let item of navigationPath.slice(index)) {
      if (!this._lookupItem(item)) {
        break;
      }
      
      await this.navigateToItem(item);
    }
  }

  _lookupItem(parent) {
    if (!parent) {
      return this.root;
    }

    let node = this.lookup.get(parent);
    if (node) {
      return node;
    }

    // If nothing was found in the lookup, an equivalent object may exist with different object identity.
    // Search through the map to find one that matches the isItemEqual comparator.
    return this._findItem(this.lookup.values(), parent, node => node.item);
  }

  /**
   * Returns whether the given item is in the navigation path
   * @param {object} item
   * @return {boolean}
   */
  isNavigated(item) {
    let node = this._lookupItem(item);
    if (!node) {
      return false;
    }

    return this.navigationStack.includes(node);
  }

  /**
   * Returns the deepest-most leaf node in the navigation path.
   * @return {object}
   */
  getDetailNode() {
    let node = this.navigationStack[this.navigationStack.length - 1];
    if (node && !node.hasChildren) {
      return node;
    }

    return null;
  }

  /**
   * Returns the deepest-most leaf node in the navigation path
   * for display in the detail column.
   * @return {object}
   */
  getDetailItem() {
    let node = this.getDetailNode();
    if (node) {
      return node.item;
    }

    return null;
  }

  reloadItem(item) {
    let node = this._lookupItem(item);
    this._reloadItem(node);
  }

  _reloadItem(node) {
    if (node && node.parent) {
      node.parent.children.emit('reloadItem', new IndexPath(0, node.index), false);
    }
  }

  /**
   * Adds the item to the selection set
   * @param {object} item
   */
  selectItem(item, emit = true) {
    // Do nothing if this item is already selected.
    if (this.isSelected(item)) {
      return;
    }

    this.selectedItems.add(item);

    let node = this._lookupItem(item);
    if (node) {
      // Reload all parents in case they are e.g. displaying the selected child count
      while (node.parent !== null) {
        this._reloadItem(node);
        node = node.parent;
      }
    }

    if (emit) {
      this.emit('selectionChange', this.getSelection());
    }
  }

  /**
   * Removes the item from selection set
   * @param {object} item
   */
  deselectItem(item, emit = true) {
    // Find a selected item that matches this item using the comparator.
    let selectedItem = this._findSelectedItem(item);
    if (!selectedItem) {
      return;
    }

    this.selectedItems.delete(selectedItem);

    let node = this._lookupItem(selectedItem);
    if (node) {
      // Reload all parents in case they are e.g. displaying the selected child count
      while (node.parent !== null) {
        this._reloadItem(node);
        node = node.parent;
      }
    }

    if (emit) {
      this.emit('selectionChange', this.getSelection());
    }
  }

  /**
   * Sets the selection state for the given items
   * @param {object[]} items
   * @param {boolean} selected
   */
  setSelected(items, selected) {
    for (let item of items) {
      if (selected) {
        this.selectItem(item, false);
      } else {
        this.deselectItem(item, false);
      }
    }

    this.emit('selectionChange', this.getSelection());
  }

  /**
   * Replaces the selection with the given items
   * @param {object[]} items
   */
  replaceSelection(items) {
    this.selectedItems = new Set;
    this.setSelected(items, true);
  }

  /**
   * Removes all items from the selection set
   */
  clearSelection() {
    this.setSelected(this.getSelection(), false);
  }

  /**
   * Return an array of selected objects
   * @return {object[]}
   */
  getSelection() {
    return Array.from(this.selectedItems);
  }

  /**
   * Returns whether the item is in the selection set
   * @param {object} item
   * @return {boolean}
   */
  isSelected(item) {
    return !!this._findSelectedItem(item);
  }

  _findSelectedItem(item) {
    // If the selected items set has this item by object equality, just return it
    if (this.selectedItems.has(item)) {
      return item;
    }

    // Otherwise, find an item that matches the comparator
    return this._findItem(this.selectedItems, item);
  }

  _findItem(haystack, needle, getItem) {
    let isItemEqual = this.dataSource ? this.dataSource.isItemEqual : this.isItemEqual;
    if (typeof isItemEqual !== 'function') {
      return null;
    }

    for (let node of haystack) {
      let item = getItem ? getItem(node) : node;
      if (isItemEqual(item, needle)) {
        return node;
      }
    }

    return null;
  }

  /**
   * Inserts a child into the given parent item.
   * @param {object} parent - The parent object to insert into
   * @param {number} index - The child insertion index
   * @param {object} child - The child to insert
   */
  insertChild(parent, index, child) {
    let parentNode = this._lookupItem(parent);
    if (!parentNode) {
      return;
    }

    // Make sure the disclosure indicator is correct
    if (!parentNode.hasChildren) {
      parentNode.hasChildren = true;
      this._reloadItem(parentNode);
    }

    // If the children have been loaded, insert the new child
    if (parentNode.children) {
      parentNode.children.startTransaction();

      let node = new ItemNode(child, parentNode, this.hasChildren(child), index);
      parentNode.children.insertItem(new IndexPath(0, index), node);
      parentNode.updateChildIndices(index + 1);
      this.lookup.set(child, node);

      parentNode.children.endTransaction();
    }
  }

  /**
   * Removes an item from the tree view.
   * @param {object} item - The item to remove
   */
  removeItem(item) {
    let node = this._lookupItem(item);
    if (!node) {
      return;
    }

    let parentNode = node.parent;
    if (!parentNode.children) {
      return;
    }

    // Remove the child
    parentNode.children.startTransaction();
    parentNode.children.removeItem(new IndexPath(0, node.index));
    parentNode.updateChildIndices(node.index);

    this.lookup.delete(node.item);
    node.walk(child => {
      this.lookup.delete(child.item);
    });

    // Make sure the disclosure indicator is correct
    if (parentNode.children.sections[0].length === 0) {
      parentNode.hasChildren = false;
      this._reloadItem(parentNode);
    }

    // If the item is in the navigation path, navigate to the parent
    let stackIndex = this.navigationStack.indexOf(node);
    if (stackIndex >= 1) {
      this.navigateToItem(this.navigationStack[stackIndex - 1].item);
    }

    // Commit changes to UI
    parentNode.children.endTransaction();
  }

  /**
   * Moves an item to a new parent, or to a new index within the same parent
   * @param {object} fromParent - The item to move
   * @param {object} [toParent] - The parent item to move to. If not provided, the item is moved within the same parent.
   * @param {number} toIndex - The index to move the item to
   */
  moveItem(item, toParent, toIndex) {
    let node = this._lookupItem(item);
    if (!node) {
      return;
    }

    let fromNode = node.parent;
    if (!fromNode.children) {
      return;
    }

    // If only an index is provided, move within the same parent.
    if (typeof toParent === 'number') {
      toIndex = toParent;
      toParent = fromNode.item;
    }

    // If the destination node is not loaded, just remove the child from view.
    // It will get re-loaded from the new parent when the user navigates there.
    let toNode = this._lookupItem(toParent);
    if (!toNode) {
      return this.removeItem(item);
    }

    node.parent = toNode;

    // Move items and update indices of changed items
    if (fromNode === toNode) {
      fromNode.children.startTransaction();
      fromNode.children.moveItem(new IndexPath(0, node.index), new IndexPath(0, toIndex));
      fromNode.updateChildIndices(Math.min(node.index, toIndex), Math.max(node.index, toIndex) + 1);
    } else {
      fromNode.children.startTransaction();
      fromNode.children.removeItem(new IndexPath(0, node.index));
      fromNode.updateChildIndices(node.index);

      // If the destination node's children are loaded, insert the item.
      // Otherwise, the item will be re-loaded when the user navigates there.
      if (toNode.children) {
        toNode.children.startTransaction();
        toNode.children.insertItem(new IndexPath(0, toIndex), node);
        toNode.updateChildIndices(toIndex);
      }
    }

    // Reload both parents to ensure the disclosure indicators are correct
    if (fromNode.children.sections[0].length === 0) {
      fromNode.hasChildren = false;
      this._reloadItem(fromNode);
    }

    if (!toNode.hasChildren) {
      toNode.hasChildren = true;
      this._reloadItem(toNode);
    }

    // If the item is in the navigation path, navigate to the parent
    if (fromNode !== toNode) {
      let stackIndex = this.navigationStack.indexOf(node) - 1;
      if (stackIndex >= 0) {
        // If the destination node is a parent of the moved item, navigate to the parent.
        let toStackIndex = this.navigationStack.indexOf(toNode);
        if (toStackIndex >= 0 && toStackIndex < stackIndex) {
          stackIndex = toStackIndex;
        }

        this.navigateToItem(this.navigationStack[stackIndex].item);
      }
    }

    // Commit changes to UI
    fromNode.children.endTransaction();
    if (fromNode !== toNode && toNode.children) {
      toNode.children.endTransaction();
    }
  }
}
