import {Collection, DropTarget, DropTargetDelegate, Node} from '@react-types/shared';
import {RefObject} from 'react';

export class ListDropTargetDelegate implements DropTargetDelegate {
  private collection: Collection<Node<unknown>>;
  private ref: RefObject<HTMLElement>;

  constructor(collection: Collection<Node<unknown>>, ref: RefObject<HTMLElement>) {
    this.collection = collection;
    this.ref = ref;
  }

  getDropTargetFromPoint(x: number, y: number, isValidDropTarget: (target: DropTarget) => boolean): DropTarget {
    if (this.collection.size === 0) {
      return;
    }

    let rect = this.ref.current.getBoundingClientRect();
    x += rect.x;
    y += rect.y;

    let elements = this.ref.current.querySelectorAll('[data-key]');
    let elementMap = new Map<string, HTMLElement>();
    for (let item of elements) {
      if (item instanceof HTMLElement) {
        elementMap.set(item.dataset.key, item);
      }
    }

    let items = [...this.collection];
    let low = 0;
    let high = items.length;
    let allowsRootDrop = isValidDropTarget({type: 'root'});

    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      let item = items[mid];
      let element = elementMap.get(String(item.key));
      let rect = element.getBoundingClientRect();

      if (y < rect.top) {
        high = mid;
      } else if (y > rect.bottom) {
        low = mid + 1;
      } else {
        let target: DropTarget = {
          type: 'item',
          key: item.key,
          dropPosition: 'on'
        };

        let allowsOnItemDrop = isValidDropTarget(target);
        // If before/after is a valid drop position, before/after should always be the drop position if the drop is within 5px of the item's top/bottom
        // regardless of whether or not the list allows root or on item drops. If none of the below cases are hit, then it is a valid on item drop
        if (y <= rect.y + 10 && isValidDropTarget({...target, dropPosition: 'before'})) {
          target.dropPosition = 'before';
        } else if (y >= rect.maxY - 10 && isValidDropTarget({...target, dropPosition: 'after'})) {
          target.dropPosition = 'after';
        } else if (!allowsOnItemDrop) {
          if (allowsRootDrop) {
            // If the list doesn't allow on item drops but allows root drops then the target is the root
            target = {type: 'root'};
          } else {
            // If the list doesn't allow root or item drops, determine if the drop position is before/after. If neither are allowed
            // then there isn't a valid drop target
            let midY = rect.y + rect.height / 2;
            // eslint-disable-next-line max-depth
            if (y <= midY && isValidDropTarget({...target, dropPosition: 'before'})) {
              target.dropPosition = 'before';
            } else if (y >= midY && isValidDropTarget({...target, dropPosition: 'after'})) {
              target.dropPosition = 'after';
            } else {
              target = null;
            }
          }
        }

        return target;
      }
    }

    let item = items[Math.min(low, items.length - 1)];
    let element = elementMap.get(String(item.key));
    rect = element.getBoundingClientRect();

    if (Math.abs(y - rect.top) < Math.abs(y - rect.bottom)) {
      return {
        type: 'item',
        key: item.key,
        dropPosition: 'before'
      };
    }

    return {
      type: 'item',
      key: item.key,
      dropPosition: 'after'
    };
  }
}
