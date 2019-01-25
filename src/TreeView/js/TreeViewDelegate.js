const DELEGATE_KEYS = [
  'getAllowedDropOperations',
  'getDropOperation',
  'itemsForDrop',
  'shouldDeleteItems'
];

/*
 * This class wraps the delegate methods available to collection-view
 * so that they accept item objects instead of IndexPaths, which don't
 * make sense in a tree data structure.
 */
export default class TreeViewDelegate {
  constructor(dataSource, delegate = {}) {
    this.dataSource = dataSource;
    this.delegate = delegate;

    // Remove keys that the delegate doesn't have on it
    for (let key of DELEGATE_KEYS) {
      if (typeof delegate[key] !== 'function') {
        this[key] = null;
      }
    }
  }

  _getTarget(target) {
    return this.dataSource.getItem(target.indexPath.section, target.indexPath.index);
  }

  _getItems(indexPaths) {
    return Array.from(indexPaths)
      .map(indexPath => this.dataSource.getItem(indexPath.section, indexPath.index).item);
  }

  shouldSelectItem(indexPath) {
    let node = this.dataSource.getItem(indexPath.section, indexPath.index);
    if (node.isDisabled) {
      return false;
    }

    if (typeof this.delegate.shouldSelectItem === 'function') {
      return this.delegate.shouldSelectItem(node.item);
    }

    return true;
  }

  shouldDrag(dragTarget, selectedIndexPaths) {
    let node = this._getTarget(dragTarget);
    if (node.isDisabled) {
      return false;
    }

    let selectedItems = this._getItems(selectedIndexPaths);

    if (typeof this.delegate.shouldSelectItem === 'function') {
      return this.delegate.shouldDrag(node.item, selectedItems);
    }

    return true;
  }

  getAllowedDropOperations(dragTarget, selectedIndexPaths) {
    let target = this._getTarget(dragTarget).item;
    let selectedItems = this._getItems(selectedIndexPaths);
    return this.delegate.getAllowedDropOperations(target, selectedItems);
  }

  prepareDragData(dragTarget, dataTransfer, selectedIndexPaths) {
    let target = this._getTarget(dragTarget).item;
    let selectedItems = this._getItems(selectedIndexPaths);
    if (typeof this.delegate.prepareDragData === 'function') {
      return this.delegate.prepareDragData(target, dataTransfer, selectedItems);
    }

    dataTransfer.setData('CollectionViewData', JSON.stringify(selectedItems));
  }

  getDropTarget(target) {
    let node = this._getTarget(target);
    if (node.isDisabled) {
      return null;
    }
    
    if (typeof this.delegate.shouldAcceptDrop === 'function' && !this.delegate.shouldAcceptDrop(node.item)) {
      return null;
    }

    return target;
  }

  getDropOperation(dropTarget, allowedOperations) {
    let target = this._getTarget(dropTarget).item;
    return this.delegate.getDropOperation(target, allowedOperations);
  }

  itemsForDrop(dropTarget, dataTransfer) {
    let target = this._getTarget(dropTarget).item;
    return this.delegate.itemsForDrop(target, dataTransfer);
  }

  shouldDeleteItems(indexPaths) {
    let items = this._getItems(indexPaths);
    return this.delegate.shouldDeleteItems(items);
  }
}
