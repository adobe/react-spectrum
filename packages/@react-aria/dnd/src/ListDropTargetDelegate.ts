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
      return {type: 'root'};
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

        if (isValidDropTarget(target)) {
          // Otherwise, if dropping on the item is accepted, try the before/after positions if within 5px
          // of the top or bottom of the item.
          if (y <= rect.top + 5 && isValidDropTarget({...target, dropPosition: 'before'})) {
            target.dropPosition = 'before';
          } else if (y >= rect.bottom - 5 && isValidDropTarget({...target, dropPosition: 'after'})) {
            target.dropPosition = 'after';
          }
        } else {
          // If dropping on the item isn't accepted, try the target before or after depending on the y position.
          let midY = rect.top + rect.height / 2;
          if (y <= midY && isValidDropTarget({...target, dropPosition: 'before'})) {
            target.dropPosition = 'before';
          } else if (y >= midY && isValidDropTarget({...target, dropPosition: 'after'})) {
            target.dropPosition = 'after';
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
