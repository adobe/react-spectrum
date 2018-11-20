import {DragTarget, IndexPath, Layout} from '@react/collection-view';

export default class BaseLayout extends Layout {
  shouldShowDropSpacing() {
    let dropTarget = this.collectionView._dropTarget;
    let dragTarget = this.collectionView._dragTarget;

    // If items are being reordered, don't show the drop spacing if the drop target is right next to the drag target.
    // When dropped, the item will not move since the target is the same as the source.
    if (dropTarget && dragTarget && dragTarget.indexPath.section === dropTarget.indexPath.section && (dragTarget.indexPath.index === dropTarget.indexPath.index || dragTarget.indexPath.index + 1 === dropTarget.indexPath.index)) {
      return false;
    }

    // Only show the drop spacing if dropping between two items.
    // If the default drop position is not "between", then we could be dropping on the entire grid instead of an item.
    return dropTarget
      && dropTarget.dropPosition === DragTarget.DROP_BETWEEN
      && this.component.props.dropPosition === 'between';
  }

  getInitialLayoutInfo(type, section, index) {
    let initial = super.getInitialLayoutInfo(type, section, index);

    initial.opacity = 0;
    initial.transform = 'scale3d(0.8, 0.8, 0.8)';

    return initial;
  }

  getFinalLayoutInfo(type, section, index) {
    let final = super.getFinalLayoutInfo(type, section, index);

    final.opacity = 0;
    final.transform = 'scale3d(0.8, 0.8, 0.8)';

    return final;
  }

  _findClosestLayoutInfo(target, rect) {
    let layoutInfos = this.getVisibleLayoutInfos(rect);
    let best = null;
    let bestDistance = Infinity;

    for (let cur of layoutInfos) {
      if (cur.type === 'item') {
        let dist = Math.pow(target.x - cur.rect.x, 2) + Math.pow(target.y - cur.rect.y, 2);
        if (dist < bestDistance) {
          best = cur;
          bestDistance = dist;
        }
      }
    }

    return best;
  }

  _findClosest(target, rect) {
    let best = this._findClosestLayoutInfo(target, rect);
    if (best) {
      return new IndexPath(best.section, best.index);
    }

    return null;
  }
}
