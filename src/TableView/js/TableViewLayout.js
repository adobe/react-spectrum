import {DragTarget, IndexPath, LayoutInfo, ListLayout, Rect} from '@react/collection-view';

export default class TableViewLayout extends ListLayout {
  constructor(options = {}) {
    super(options);

    this.emptyView = null;
    this.loadingIndicator = null;
    this.insertionIndicator = null;
    this.tableView = options.tableView;
  }

  getLayoutInfo(type, section, index) {
    if (type === 'empty-view') {
      return this.emptyView;
    }

    if (type === 'loading-indicator') {
      return this.loadingIndicator;
    }

    if (type === 'insertion-indicator') {
      return this.insertionIndicator;
    }

    return super.getLayoutInfo(type, section, index);
  }

  getVisibleLayoutInfos(rect) {
    let layoutInfos = super.getVisibleLayoutInfos(rect);
    if (this.emptyView) {
      layoutInfos.push(this.emptyView);
    }

    if (this.loadingIndicator) {
      layoutInfos.push(this.loadingIndicator);
    }
    
    if (this.insertionIndicator) {
      layoutInfos.push(this.insertionIndicator);
    }

    return layoutInfos;
  }

  validate() {
    super.validate();

    let count = this.collectionView.getSectionLength(0);
    this.contentHeight = count * this.rowHeight - 1;

    let isLoading = this.tableView.isLoading;
    if (isLoading) {
      this.loadingIndicator = new LayoutInfo('loading-indicator');

      if (count === 0) {
        this.loadingIndicator.rect = new Rect(0, 0, this.collectionView.size.width, this.collectionView.size.height);
      } else {
        this.loadingIndicator.rect = new Rect(0, this.contentHeight, this.collectionView.size.width, 100);
        this.contentHeight += this.loadingIndicator.rect.height;
      }
    } else {
      this.loadingIndicator = null;

      if (count === 0) {
        this.emptyView = new LayoutInfo('empty-view');
        this.emptyView.rect = new Rect(0, 0, this.collectionView.size.width, this.collectionView.size.height);
      } else {
        this.emptyView = null;
      }
    }

    // Show the drop insertion indicator if the default drop position of the table view is "between",
    // the target's drop position is also "between", and the table is not empty.
    let dropTarget = this.collectionView._dropTarget;
    let showInsertionIndicator = dropTarget &&
      this.tableView.props.dropPosition === 'between' &&
      dropTarget.dropPosition === DragTarget.DROP_BETWEEN &&
      count > 0;

    if (showInsertionIndicator) {
      let l = new LayoutInfo('insertion-indicator');
      l.rect = new Rect(0, Math.max(0, Math.min(this.contentHeight - 3, dropTarget.indexPath.index * this.rowHeight - 1)), this.collectionView.size.width, 2);
      l.zIndex = 10;
      this.insertionIndicator = l;
    } else {
      this.insertionIndicator = null;
    }
  }

  getDropTarget(point) {
    let dropPosition = this.tableView.props.dropPosition === 'on' ? DragTarget.DROP_ON : DragTarget.DROP_BETWEEN;

    // If we are dropping between rows, the target should move to the
    // next item halfway through a row.
    if (dropPosition === DragTarget.DROP_BETWEEN) {
      point = point.copy();
      point.y += this.rowHeight / 2;
    }

    let indexPath = this.collectionView.indexPathAtPoint(point);
    if (indexPath) {
      return new DragTarget('item', indexPath, dropPosition);
    } else {
      let index = dropPosition === DragTarget.DROP_ON ? 0 : this.collectionView.getSectionLength(0);
      return new DragTarget('item', new IndexPath(0, index), DragTarget.DROP_BETWEEN);
    }
  }
}
