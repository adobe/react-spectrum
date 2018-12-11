const DELEGATE_KEYS = [
  'shouldSelectItem',
  'shouldDrag',
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
    return this.dataSource.getItem(target.indexPath.section, target.indexPath.index).item;
  }

  _getItems(indexPaths) {
    return Array.from(indexPaths)
      .map(indexPath => this.dataSource.getItem(indexPath.section, indexPath.index).item);
  }

  shouldSelectItem(indexPath) {
    let item = this.dataSource.getItem(indexPath.section, indexPath.index).item;
    return this.delegate.shouldSelectItem(item);
  }

  shouldDrag(dragTarget, selectedIndexPaths) {
    let target = this._getTarget(dragTarget);
    let selectedItems = this._getItems(selectedIndexPaths);
    return this.delegate.shouldDrag(target, selectedItems);
  }

  getAllowedDropOperations(dragTarget, selectedIndexPaths) {
    let target = this._getTarget(dragTarget);
    let selectedItems = this._getItems(selectedIndexPaths);
    return this.delegate.getAllowedDropOperations(target, selectedItems);
  }

  prepareDragData(dragTarget, dataTransfer, selectedIndexPaths) {
    let target = this._getTarget(dragTarget);
    let selectedItems = this._getItems(selectedIndexPaths);
    if (typeof this.delegate.prepareDragData === 'function') {
      return this.delegate.prepareDragData(target, dataTransfer, selectedItems);
    }

    dataTransfer.setData('CollectionViewData', JSON.stringify(selectedItems));
  }

  getDropTarget(target) {
    let item = this._getTarget(target);
    if (typeof this.delegate.shouldAcceptDrop === 'function' && !this.delegate.shouldAcceptDrop(item)) {
      return null;
    }

    return target;
  }

  getDropOperation(dropTarget, allowedOperations) {
    let target = this._getTarget(dropTarget);
    return this.delegate.getDropOperation(target, allowedOperations);
  }

  itemsForDrop(dropTarget, dataTransfer) {
    let target = this._getTarget(dropTarget);
    return this.delegate.itemsForDrop(target, dataTransfer);
  }

  shouldDeleteItems(indexPaths) {
    let items = this._getItems(indexPaths);
    return this.delegate.shouldDeleteItems(items);
  }
}
