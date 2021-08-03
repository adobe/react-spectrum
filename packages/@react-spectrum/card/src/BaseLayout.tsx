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

import {KeyboardDelegate, Node} from '@react-types/shared';
import {Layout} from '@react-stately/virtualizer';

// TODO: Perhaps this doesn't extend Layout? Perhaps all the other layouts (Waterfall, Grid, Gallery) should extend Layout instead?
export class BaseLayout<T> extends Layout<Node<T>> implements KeyboardDelegate {
  // shouldShowDropSpacing() {
  //   let dropTarget = this.collectionView._dropTarget;
  //   let dragTarget = this.collectionView._dragTarget;

  //   // If items are being reordered, don't show the drop spacing if the drop target is right next to the drag target.
  //   // When dropped, the item will not move since the target is the same as the source.
  //   if (dropTarget && dragTarget && dragTarget.indexPath.section === dropTarget.indexPath.section && (dragTarget.indexPath.index === dropTarget.indexPath.index || dragTarget.indexPath.index + 1 === dropTarget.indexPath.index)) {
  //     return false;
  //   }

  //   // Only show the drop spacing if dropping between two items.
  //   // If the default drop position is not "between", then we could be dropping on the entire grid instead of an item.
  //   return dropTarget
  //     && dropTarget.dropPosition === DragTarget.DROP_BETWEEN
  //     && this.component.props.dropPosition === 'between';
  // }

  // getInitialLayoutInfo(type, section, index) {
  //   let initial = super.getInitialLayoutInfo(type, section, index);

  //   initial.opacity = 0;
  //   initial.transform = 'scale3d(0.8, 0.8, 0.8)';

  //   return initial;
  // }

  // getFinalLayoutInfo(type, section, index) {
  //   let final = super.getFinalLayoutInfo(type, section, index);

  //   final.opacity = 0;
  //   final.transform = 'scale3d(0.8, 0.8, 0.8)';

  //   return final;
  // }

  // _findClosestLayoutInfo(target, rect) {
  //   let layoutInfos = this.getVisibleLayoutInfos(rect);
  //   let best = null;
  //   let bestDistance = Infinity;

  //   for (let cur of layoutInfos) {
  //     if (cur.type === 'item') {
  //       let dist = Math.pow(target.x - cur.rect.x, 2) + Math.pow(target.y - cur.rect.y, 2);
  //       if (dist < bestDistance) {
  //         best = cur;
  //         bestDistance = dist;
  //       }
  //     }
  //   }

  //   return best;
  // }

  // _findClosest(target, rect) {
  //   let best = this._findClosestLayoutInfo(target, rect);
  //   if (best) {
  //     return new IndexPath(best.section, best.index);
  //   }

  //   return null;
  // }
}
