import {Layout, LayoutInfo, Rect} from '@react/collection-view';

export default class TableViewLayout extends Layout {
  constructor(options = {}) {
    super();

    this.rowHeight = options.rowHeight || 48;
  }

  getLayoutInfo(type, section, index) {
    let y = this.rowHeight * index;

    let layoutInfo = new LayoutInfo(type, section, index);
    layoutInfo.rect = new Rect(0, y, this.collectionView.size.width, this.rowHeight);
    return layoutInfo;
  }

  getVisibleLayoutInfos(rect) {
    let firstVisibleIndex = Math.floor(rect.y / this.rowHeight);
    let lastVisibleIndex = Math.min(Math.ceil(rect.maxY / this.rowHeight), this.collectionView.getSectionLength(0));
    let layoutInfos = [];

    for (let index = firstVisibleIndex; index < lastVisibleIndex; index++) {
      let layoutInfo = this.getLayoutInfo('item', 0, index);
      layoutInfos.push(layoutInfo);
    }

    return layoutInfos;
  }

  validate() {
    this.contentHeight = this.collectionView.getSectionLength(0) * this.rowHeight;
  }
}
