/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {LayoutInfo, Rect, Size} from '@react-stately/virtualizer';
import {LayoutNode, ListLayout} from './ListLayout';

export class ListViewLayout<T> extends ListLayout<T> {
  buildCollection(): LayoutNode[] {
    let y = this.padding;
    let nodes = [];
    for (let node of this.collection) {
      let layoutNode = this.buildChild(node, 0, y);
      y = layoutNode.layoutInfo.rect.maxY;
      nodes.push(layoutNode);
    }

    // TODO: if supporting infinite scroll, will need to not take up the whole list
    if (this.isLoading) {
      let rect = new Rect(0, y, this.virtualizer.visibleRect.width, this.virtualizer.visibleRect.height);
      let loader = new LayoutInfo('loader', 'loader', rect);
      this.layoutInfos.set('loader', loader);
      nodes.push({layoutInfo: loader});
      y = loader.rect.maxY;
    }

    if (nodes.length === 0) {
      let rect = new Rect(0, y, this.virtualizer.visibleRect.width, this.virtualizer.visibleRect.height);
      let placeholder = new LayoutInfo('empty', 'empty', rect);
      this.layoutInfos.set('empty', placeholder);
      nodes.push({layoutInfo: placeholder});
      y = placeholder.rect.maxY;
    }

    this.contentSize = new Size(this.virtualizer.visibleRect.width, y + this.padding);
    return nodes;
  }
}
