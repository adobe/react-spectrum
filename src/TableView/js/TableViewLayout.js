import {DragTarget, IndexPath, LayoutInfo, ListLayout, Rect} from '@react/collection-view';

export default class TableViewLayout extends ListLayout {
  constructor(options = {}) {
    super(options);

    this.insertionIndicator = null;
  }

  getLayoutInfo(type, section, index) {

    if (type === 'insertion-indicator') {
      return this.insertionIndicator;
    }

    return super.getLayoutInfo(type, section, index);
  }

  getVisibleLayoutInfos(rect) {
    let layoutInfos = super.getVisibleLayoutInfos(rect);
    
    if (this.insertionIndicator) {
      layoutInfos.push(this.insertionIndicator);
    }

    return layoutInfos;
  }

  validate() {
    super.validate();

    let count = this.collectionView.getSectionLength(0);
    this.contentHeight = count * this.rowHeight - 1;

    // Show the drop insertion indicator if the default drop position of the table view is "between",
    // the target's drop position is also "between", and the table is not empty.
    let dropTarget = this.collectionView._dropTarget;
    let showInsertionIndicator = dropTarget &&
      this.component.props.dropPosition === 'between' &&
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
    let dropPosition = this.component.props.dropPosition === 'on' ? DragTarget.DROP_ON : DragTarget.DROP_BETWEEN;

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
