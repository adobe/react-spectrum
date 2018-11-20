import BaseLayout from './BaseLayout';
import {DragTarget, IndexPath, LayoutInfo, Rect, Size} from '@react/collection-view';

const DEFAULT_OPTIONS = {
  S: {
    itemPadding: 20,
    minItemSize: new Size(96, 96),
    maxItemSize: new Size(Infinity, Infinity),
    margin: 8,
    minSpace: new Size(8, 16),
    maxColumns: Infinity,
    dropSpacing: 50
  },
  L: {
    itemPadding: 52,
    minItemSize: new Size(208, 208),
    maxItemSize: new Size(Infinity, Infinity),
    margin: 24,
    minSpace: new Size(24, 48),
    maxColumns: Infinity,
    dropSpacing: 100
  }
};

/**
 * A GridLayout displays equal-sized items in a grid.
 * It works with data in a single section.
 */
export default class GridLayout extends BaseLayout {
  constructor(options = {}) {
    super();
    let cardSize = options.cardSize || 'L';
    /**
     * The minimum item size
     * @type {Size}
     * @default 208 x 208
     */
    this.minItemSize = options.minItemSize || DEFAULT_OPTIONS[cardSize].minItemSize;

    /**
     * The maximum item size.
     * @type {Size}
     * @default Infinity
     */
    this.maxItemSize = options.maxItemSize || DEFAULT_OPTIONS[cardSize].maxItemSize;

    /**
     * The margin around the grid view between the edges and the items
     * @type {Size}
     * @default 24
     */
    this.margin = options.margin != null ? options.margin : DEFAULT_OPTIONS[cardSize].margin;

    /**
     * The minimum space required between items
     * @type {Size}
     * @default 24 x 48
     */
    this.minSpace = options.minSpace || DEFAULT_OPTIONS[cardSize].minSpace;

    /**
     * The maximum number of columns. Default is infinity.
     * @type {number}
     * @default Infinity
     */
    this.maxColumns = options.maxColumns || DEFAULT_OPTIONS[cardSize].maxColumns;

    /**
     * The vertical padding for an item
     * @type {number}
     * @default 52
     */
    this.itemPadding = options.itemPadding != null ? options.itemPadding : DEFAULT_OPTIONS[cardSize].itemPadding;

    /**
     * The space between items created when dragging between them
     * @type {number}
     * @default 100
     */
    this.dropSpacing = options.dropSpacing != null ? options.dropSpacing : DEFAULT_OPTIONS[cardSize].dropSpacing;

    this.itemSize = null;
    this.numColumns = 0;
    this.numRows = 0;
    this.horizontalSpacing = 0;
    this.cardType = 'quiet'; // Better name?
  }

  getLayoutInfo(type, section, index) {
    let row = Math.floor(index / this.numColumns);
    let column = index % this.numColumns;
    let x = this.margin + column * (this.itemSize.width + this.horizontalSpacing);
    let y = this.margin + row * (this.itemSize.height + this.minSpace.height);

    if (this.shouldShowDropSpacing()) {
      let dropTarget = this.collectionView._dropTarget;
      let dropRow = Math.floor(dropTarget.indexPath.index / this.numColumns);
      if (dropRow === row) {
        x -= this.dropSpacing / 2;

        if (index >= dropTarget.indexPath.index) {
          x += this.dropSpacing;
        }
      }
    }

    let layoutInfo = new LayoutInfo(type, section, index);
    layoutInfo.rect = new Rect(x, y, this.itemSize.width, this.itemSize.height);
    layoutInfo.estimatedSize = false;

    return layoutInfo;
  }

  getIndexAtPoint(x, y, allowInsertingAtEnd = false) {
    let itemHeight = this.itemSize.height + this.minSpace.height;
    let itemWidth = this.itemSize.width + this.horizontalSpacing;
    return Math.max(0,
      Math.min(
        this.collectionView.getSectionLength(0) - (allowInsertingAtEnd ? 0 : 1),
        Math.floor(y / itemHeight) * this.numColumns + Math.floor((x - this.horizontalSpacing) / itemWidth)
      )
    );
  }

  getVisibleLayoutInfos(rect) {
    let res = [];
    let numItems = this.collectionView.getSectionLength(0) - 1;
    if (numItems < 0 || !this.itemSize) {
      return res;
    }

    let firstVisibleItem = this.getIndexAtPoint(rect.x, rect.y);
    let lastVisibleItem = this.getIndexAtPoint(rect.maxX, rect.maxY);

    for (let index = firstVisibleItem; index <= lastVisibleItem; index++) {
      let layoutInfo = this.getLayoutInfo('item', 0, index);
      if (rect.intersects(layoutInfo.rect)) {
        res.push(layoutInfo);
      }
    }

    return res;
  }

  validate() {
    // Compute the number of rows and columns needed to display the content
    let availableWidth = this.collectionView.size.width - this.margin * 2;
    let columns = Math.floor(availableWidth / (this.minItemSize.width + this.minSpace.width));
    this.numColumns = Math.max(1, Math.min(this.maxColumns, columns));
    this.numRows = Math.ceil(this.collectionView.getSectionLength(0) / this.numColumns);

    // Compute the available width (minus the space between items)
    let width = availableWidth - (this.minSpace.width * Math.max(0, this.numColumns - 1));

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / this.numColumns);
    itemWidth = Math.max(this.minItemSize.width, Math.min(this.maxItemSize.width, itemWidth));

    // Compute the item height, which is proportional to the item width
    let t = ((itemWidth - this.minItemSize.width) / this.minItemSize.width);
    let itemHeight = this.minItemSize.height + this.minItemSize.height * t;
    itemHeight = Math.max(this.minItemSize.height, Math.min(this.maxItemSize.height, itemHeight)) + this.itemPadding;

    this.itemSize = new Size(itemWidth, itemHeight);

    // Compute the horizontal spacing and content height
    this.horizontalSpacing = Math.floor((this.collectionView.size.width - this.numColumns * this.itemSize.width) / (this.numColumns + 1));
    this.contentHeight = this.margin * 2 + (this.numRows * this.itemSize.height) + ((this.numRows - 1) * this.minSpace.height);
  }

  getDropTarget(point) {
    let dropPosition = this.component.props.dropPosition === 'on' && !this.collectionView._dragTarget
      ? DragTarget.DROP_ON
      : DragTarget.DROP_BETWEEN;

    // If we are dropping between rows, the target should move to the
    // next item halfway through a row.
    if (dropPosition === DragTarget.DROP_BETWEEN) {
      point = point.copy();
      point.x += (this.itemSize.width + this.horizontalSpacing) / 2;
    }

    let indexPath;
    if (dropPosition === DragTarget.DROP_ON) {
      indexPath = this.collectionView.indexPathAtPoint(point);
    } else {
      let index = this.getIndexAtPoint(point.x, point.y, true);
      indexPath = new IndexPath(0, index);
    }

    if (indexPath) {
      return new DragTarget('item', indexPath, dropPosition);
    }

    let index = dropPosition === DragTarget.DROP_ON ? 0 : this.collectionView.getSectionLength(0);
    return new DragTarget('item', new IndexPath(0, index), DragTarget.DROP_BETWEEN);
  }

  getContentSize() {
    return new Size(this.collectionView.size.width, this.contentHeight);
  }

  indexPathAbove(indexPath) {
    return this.collectionView.incrementIndexPath(indexPath, -this.numColumns);
  }

  indexPathBelow(indexPath) {
    return this.collectionView.incrementIndexPath(indexPath, this.numColumns);
  }

  indexPathLeftOf(indexPath) {
    return this.collectionView.incrementIndexPath(indexPath, -1);
  }

  indexPathRightOf(indexPath) {
    return this.collectionView.incrementIndexPath(indexPath, 1);
  }
}
