/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {InvalidationContext, LayoutInfo, Rect} from '@react-stately/virtualizer';
import {LayoutNode, ListLayout} from '@react-stately/layout';
import {Node} from '@react-types/shared';

interface ListViewLayoutProps {
  isLoading?: boolean
}

export class ListViewLayout<T> extends ListLayout<T, ListViewLayoutProps> {
  private isLoading: boolean = false;

  update(invalidationContext: InvalidationContext<ListViewLayoutProps>): void {
    this.isLoading = invalidationContext.layoutOptions?.isLoading || false;
    super.update(invalidationContext);
  }

  protected buildCollection(): LayoutNode[] {
    let nodes = super.buildCollection();
    let y = this.contentSize.height;

    if (this.isLoading) {
      let rect = new Rect(0, y, this.virtualizer!.visibleRect.width, nodes.length === 0 ? this.virtualizer!.visibleRect.height : this.estimatedRowHeight ?? 48);
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
      let rect = new Rect(0, y, this.virtualizer!.visibleRect.width, this.virtualizer!.visibleRect.height);
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
