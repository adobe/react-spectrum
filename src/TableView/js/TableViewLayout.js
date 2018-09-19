import {DragTarget, IndexPath, LayoutInfo, ListLayout, Rect} from '@react/collection-view';

export default class TableViewLayout extends ListLayout {
  constructor(options = {}) {
    super(options);

    this.emptyView = null;
    this.loadingIndicator = null;
    this.tableView = options.tableView;
  }

  getLayoutInfo(type, section, index) {
    if (type === 'empty-view') {
      return this.emptyView;
    }

    if (type === 'loading-indicator') {
      return this.loadingIndicator;
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
  }

  getDropTarget(point) {
    let indexPath = this.collectionView.indexPathAtPoint(point);
    if (indexPath) {
      return new DragTarget('item', indexPath, DragTarget.DROP_ON);
    } else {
      return new DragTarget('section', new IndexPath(0, 0), DragTarget.DROP_ON);
    }
  }
}
