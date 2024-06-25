import {InvalidationContext, LayoutInfo, Rect} from '@react-stately/virtualizer';
import {LayoutNode, ListLayout} from '@react-stately/layout';
import {Node} from '@react-types/shared';

interface ListViewLayoutProps {
  isLoading?: boolean
}

export class ListViewLayout<T> extends ListLayout<T, ListViewLayoutProps> {
  private isLoading: boolean = false;

  validate(invalidationContext: InvalidationContext<ListViewLayoutProps>): void {
    this.isLoading = invalidationContext.layoutOptions?.isLoading || false;
    super.validate(invalidationContext);
  }

  protected buildCollection(): LayoutNode[] {
    let nodes = super.buildCollection();
    let y = this.contentSize.height;

    if (this.isLoading) {
      let rect = new Rect(0, y, this.virtualizer.visibleRect.width, nodes.length === 0 ? this.virtualizer.visibleRect.height : this.estimatedRowHeight);
      let loader = new LayoutInfo('loader', 'loader', rect);
      let node = {
        layoutInfo: loader,
        validRect: loader.rect
      };
      nodes.push(node);
      this.layoutNodes.set(loader.key, node);
      y = loader.rect.maxY;
    }

    if (nodes.length === 0) {
      let rect = new Rect(0, y, this.virtualizer.visibleRect.width, this.virtualizer.visibleRect.height);
      let placeholder = new LayoutInfo('placeholder', 'placeholder', rect);
      let node = {
        layoutInfo: placeholder,
        validRect: placeholder.rect
      };
      nodes.push(node);
      this.layoutNodes.set(placeholder.key, node);
      y = placeholder.rect.maxY;
    }

    this.contentSize.height = y;
    return nodes;
  }

  protected buildItem(node: Node<T>, x: number, y: number): LayoutNode {
    let res = super.buildItem(node, x, y);
    // allow overflow so the focus ring/selection ring can extend outside to overlap with the adjacent items borders
    res.layoutInfo.allowOverflow = true;
    return res;
  }
}
