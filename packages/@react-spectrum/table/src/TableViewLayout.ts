import {GridNode} from '@react-types/grid';
import {LayoutInfo, Rect} from '@react-stately/virtualizer';
import {LayoutNode, TableLayout} from '@react-stately/layout';

export class TableViewLayout<T> extends TableLayout<T> {
  private isLoading: boolean = false;

  protected buildCollection(): LayoutNode[] {
    let loadingState = this.collection.body.props.loadingState;
    this.isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
    return super.buildCollection();
  }

  protected buildColumn(node: GridNode<T>, x: number, y: number): LayoutNode {
    let res = super.buildColumn(node, x, y);
    res.layoutInfo.allowOverflow = true; // for resizer nubbin
    return res;
  }

  protected buildBody(): LayoutNode {
    let node = super.buildBody(0);
    let {children, layoutInfo} = node;
    let width = node.layoutInfo.rect.width;

    if (this.isLoading) {
      // Add some margin around the loader to ensure that scrollbars don't flicker in and out.
      let rect = new Rect(40, 40, (width || this.virtualizer.visibleRect.width) - 80, children.length === 0 ? this.virtualizer.visibleRect.height - 80 : 60);
      let loader = new LayoutInfo('loader', 'loader', rect);
      loader.parentKey = layoutInfo.key;
      loader.isSticky = children.length === 0;
      let node = {
        layoutInfo: loader,
        validRect: loader.rect
      };
      children.push(node);
      this.layoutNodes.set(loader.key, node);
      layoutInfo.rect.height = loader.rect.maxY;
      width = Math.max(width, rect.width);
    } else if (children.length === 0) {
      let rect = new Rect(40, 40, this.virtualizer.visibleRect.width - 80, this.virtualizer.visibleRect.height - 80);
      let empty = new LayoutInfo('empty', 'empty', rect);
      empty.parentKey = layoutInfo.key;
      empty.isSticky = true;
      let node = {
        layoutInfo: empty,
        validRect: empty.rect
      };
      children.push(node);
      layoutInfo.rect.height = empty.rect.maxY;
      width = Math.max(width, rect.width);
    }

    return node;
  }

  protected buildRow(node: GridNode<T>, x: number, y: number): LayoutNode {
    let res = super.buildRow(node, x, y);
    res.layoutInfo.rect.height += 1; // for bottom border
    return res;
  }

  protected getEstimatedRowHeight(): number {
    return super.getEstimatedRowHeight() + 1; // for bottom border
  }

  protected isStickyColumn(node: GridNode<T>) {
    return node.props?.isDragButtonCell || node.props?.isSelectionCell;
  }
}
