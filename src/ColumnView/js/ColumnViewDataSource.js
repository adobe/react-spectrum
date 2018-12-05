import {ArrayDataSource, IndexPath} from '@react/collection-view';
import createId from '../../utils/createId';
import {EventEmitter} from 'events';

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
}

/**
 * ColumnViewDataSource is the base class for data sources of a ColumnView.
 * There are two required methods that must be implemented by subclasses:
 * `getChildren`, and `hasChildren`.
 */
export default class ColumnViewDataSource extends EventEmitter {
  constructor(opts) {
    super();

    this.root = new ItemNode(null, null, false);
    this.navigationStack = [];
    this.lookup = new WeakMap;
    this.selectedItems = new Set;
    process.nextTick(() => this.navigateToItem(null));
  }

  /**
   * Returns an array of children for an item
   * @param {object} item
   * @return {object[]}
   * @abstract
   */
  async getChildren(item) {
    throw new Error('Must be implemented by subclass');
  }

  /**
   * Returns whether an item has children
   * @param {object} item
   * @return {boolean}
   * @abstract
   */
  hasChildren(item) {
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
      parentNode.parent.highlightedChild = item;
    }

    this.navigationStack = stack;
    this.emit('navigate', stack.slice(1).map(i => i.item));

    // Load children if needed
    if (!parentNode.children) {
      parentNode.isLoading = true;
      this._reloadItem(parentNode);

      let children = await this.getChildren(item) || [];

      let childNodes = children.map((child, index) => {
        let node = new ItemNode(child, parentNode, this.hasChildren(child), index);
        this.lookup.set(child, node);

        // If there is already a selected item that matches this child, map it to the same node.
        // This ensures that passing this item to deselectItem works properly.
        let selectedItem = this._findSelectedItem(child);
        if (selectedItem) {
          this.lookup.set(selectedItem, node);
        }

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

  _lookupItem(parent) {
    return parent ? this.lookup.get(parent) : this.root;
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

  _reloadItem(node) {
    if (node && node.parent) {
      node.parent.children.emit('reloadItem', new IndexPath(0, node.parent.children.sections[0].indexOf(node)), false);
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
    if (typeof this.isItemEqual === 'function') {
      for (let selectedItem of this.selectedItems) {
        if (this.isItemEqual(selectedItem, item)) {
          return selectedItem;
        }
      }
    }

    return null;
  }
}
