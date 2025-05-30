import {Direction, DropTarget, ItemDropTarget, Key, Node, RefObject} from '@react-types/shared';
import {ListDropTargetDelegate} from './ListDropTargetDelegate';

interface TreeDropTargetDelegateOptions {
  /**
   * The horizontal layout direction.
   * @default 'ltr'
   */
  direction?: Direction
}

interface TreeCollection<T> extends Iterable<Node<T>> {
  getItem(key: Key): Node<T> | null,
  getChildren?(key: Key): Iterable<Node<T>>,
  getKeyAfter(key: Key): Key | null,
  getKeyBefore(key: Key): Key | null
}

interface TreeState<T> {
  collection: TreeCollection<T>,
  expandedKeys: Set<Key>
}

interface PointerTracking {
  lastY: number,
  lastX: number,
  yDirection: 'up' | 'down' | null,
  xDirection: 'left' | 'right' | null,
  boundaryContext: {
    parentKey: Key,
    lastChildKey: Key,
    lastSwitchY: number,
    lastSwitchX: number,
    entryDirection: 'up' | 'down' | null,
    preferredTargetIndex?: number
  } | null
}

const X_SWITCH_THRESHOLD = 3;
const Y_SWITCH_THRESHOLD = 2;

export class TreeDropTargetDelegate<T> extends ListDropTargetDelegate {
  private state: TreeState<T>;
  private pointerTracking: PointerTracking = {
    lastY: 0,
    lastX: 0,
    yDirection: null,
    xDirection: null,
    boundaryContext: null
  };

  constructor(state: TreeState<T>, ref: RefObject<HTMLElement | null>, options?: TreeDropTargetDelegateOptions) {
    super(state.collection as Iterable<Node<unknown>>, ref, {
      direction: options?.direction || 'ltr',
      orientation: 'vertical',
      layout: 'stack'
    });
    this.state = state;
  }

  getDropTargetFromPoint(x: number, y: number, isValidDropTarget: (target: DropTarget) => boolean): DropTarget {
    let baseTarget = super.getDropTargetFromPoint(x, y, isValidDropTarget);
    
    if (!baseTarget || baseTarget.type === 'root') {
      return baseTarget;
    }

    let target = this.resolveDropTarget(baseTarget, x, y, isValidDropTarget);
    console.log(target);
    
    return target;
  }

  private resolveDropTarget(
    target: ItemDropTarget, 
    x: number, 
    y: number, 
    isValidDropTarget: (target: DropTarget) => boolean
  ): ItemDropTarget {
    let tracking = this.pointerTracking;
    
    // Calculate movement directions
    let deltaY = y - tracking.lastY;
    let deltaX = x - tracking.lastX;
    let currentYMovement: 'up' | 'down' | null = null;
    let currentXMovement: 'left' | 'right' | null = null;
    
    if (Math.abs(deltaY) > 2) {
      currentYMovement = deltaY > 0 ? 'down' : 'up';
      tracking.yDirection = currentYMovement;
      tracking.lastY = y;
    }
    
    if (Math.abs(deltaX) > 2) {
      currentXMovement = deltaX > 0 ? 'right' : 'left';
      tracking.xDirection = currentXMovement;
      tracking.lastX = x;
    }

    let potentialTargets = this.getPotentialTargets(target, isValidDropTarget);

    if (potentialTargets.length > 1) {
      target = this.selectTarget(potentialTargets, target, x, y, currentYMovement, currentXMovement);
    } else {
      target = potentialTargets[0];
      // Reset boundary context since we're not in a boundary case
      tracking.boundaryContext = null;
    }

    return target;
  }

  // Returns potential targets for an ambiguous drop position (e.g. after the last child of a parent, or after the parent itself)
  // Ordered by level, from innermost to outermost.
  private getPotentialTargets(originalTarget: ItemDropTarget, isValidDropTarget: (target: DropTarget) => boolean): ItemDropTarget[] {
    if (originalTarget.dropPosition === 'on') {
      return [originalTarget];
    }
    
    let target = originalTarget;

    // Normalize to 'after'
    if (originalTarget.dropPosition === 'before') {
      let keyBefore = this.state.collection.getKeyBefore(originalTarget.key);
      if (keyBefore == null) {
        return [originalTarget];
      }
      target = {
        type: 'item',
        key: keyBefore,
        dropPosition: 'after'
      } as const;
    }

    let currentItem = this.state.collection.getItem(target.key);
    while (currentItem && currentItem?.type !== 'item' && currentItem.nextKey != null) {
      target.key = currentItem.nextKey;
      currentItem = this.state.collection.getItem(currentItem.nextKey);
    }

    let potentialTargets = [target];

    // If target has children and is expanded, use "before first child"
    if (currentItem && currentItem.hasChildNodes && this.state.expandedKeys.has(currentItem.key) && this.state.collection.getChildren) {
      let firstChildItemNode: Node<any> | null = null;
      for (let child of this.state.collection.getChildren(currentItem.key)) {
        if (child.type === 'item') {
          firstChildItemNode = child;
          break;
        }
      }

      if (firstChildItemNode) {
        const beforeFirstChildTarget = {
          type: 'item',
          key: firstChildItemNode.key,
          dropPosition: 'before'
        } as const;

        if (isValidDropTarget(beforeFirstChildTarget)) {
          return [beforeFirstChildTarget];
        }
      }
    }

    if (currentItem?.nextKey != null) {
      return [originalTarget];
    }

    // Walk up the parent chain to find ancestors that are the last child at their level
    let parentKey = currentItem?.parentKey;
    let ancestorTargets: ItemDropTarget[] = [];
    
    while (parentKey) {
      let parentItem = this.state.collection.getItem(parentKey);                
      let nextItem = parentItem?.nextKey ? this.state.collection.getItem(parentItem.nextKey) : null;
      let isLastChildAtLevel = !nextItem || nextItem.parentKey !== parentKey;
      
      if (isLastChildAtLevel) {
        let afterParentTarget = {
          type: 'item',
          key: parentKey,
          dropPosition: 'after'
        } as const;

        if (isValidDropTarget(afterParentTarget)) {
          ancestorTargets.push(afterParentTarget);
        }
        if (nextItem) {
          break;
        }
      }
      
      parentKey = parentItem?.parentKey;
    }

    if (ancestorTargets.length > 0) {
      potentialTargets.push(...ancestorTargets);
    }

    // Handle converting "after" to "before next" for non-ambiguous cases
    if (potentialTargets.length === 1) {
      let nextKey = this.state.collection.getKeyAfter(target.key);
      let nextNode = nextKey ? this.state.collection.getItem(nextKey) : null;
      if (nextKey != null && nextNode && currentItem && nextNode.level != null && currentItem.level != null && nextNode.level > currentItem.level) {
        let beforeTarget = {
          type: 'item',
          key: nextKey,
          dropPosition: 'before'
        } as const;
        if (isValidDropTarget(beforeTarget)) {
          return [beforeTarget];
        }
      }
    }

    return potentialTargets;
  }

  private selectTarget(
    potentialTargets: ItemDropTarget[],
    originalTarget: ItemDropTarget,
    x: number,
    y: number,
    currentYMovement: 'up' | 'down' | null,
    currentXMovement: 'left' | 'right' | null
  ): ItemDropTarget {
    if (potentialTargets.length < 2) {
      return potentialTargets[0];
    }
    
    let tracking = this.pointerTracking;
    let currentItem = this.state.collection.getItem(originalTarget.key);
    let parentKey = currentItem?.parentKey;

    if (!parentKey) {
      return potentialTargets[0];
    }

    // Case 1: Exactly 2 potential targets - use Y movement only
    if (potentialTargets.length === 2) {
      // Initialize boundary context if needed
      if (!tracking.boundaryContext || tracking.boundaryContext.parentKey !== parentKey) {
        let initialTargetIndex = currentYMovement === 'up' ? 1 : 0;
        
        tracking.boundaryContext = {
          parentKey,
          lastChildKey: originalTarget.key,
          preferredTargetIndex: initialTargetIndex,
          lastSwitchY: y,
          lastSwitchX: x,
          entryDirection: tracking.yDirection
        };
      }
      
      let boundaryContext = tracking.boundaryContext;
      let distanceFromLastYSwitch = Math.abs(y - boundaryContext.lastSwitchY);
      
      // Toggle between targets based on Y movement
      if (distanceFromLastYSwitch > Y_SWITCH_THRESHOLD && currentYMovement) {
        let currentIndex = boundaryContext.preferredTargetIndex || 0;
        
        if (currentYMovement === 'down' && currentIndex === 0) {
          // Moving down from inner-most, switch to outer-most
          boundaryContext.preferredTargetIndex = 1;
          boundaryContext.lastSwitchY = y;
        } else if (currentYMovement === 'down' && currentIndex === 1) {
          // Moving down from outer-most, switch back to inner-most
          boundaryContext.preferredTargetIndex = 0;
          boundaryContext.lastSwitchY = y;
        } else if (currentYMovement === 'up' && currentIndex === 1) {
          // Moving up from outer-most, switch to inner-most
          boundaryContext.preferredTargetIndex = 0;
          boundaryContext.lastSwitchY = y;
        } else if (currentYMovement === 'up' && currentIndex === 0) {
          // Moving up from inner-most, switch to outer-most
          boundaryContext.preferredTargetIndex = 1;
          boundaryContext.lastSwitchY = y;
        }
      }
      
      return potentialTargets[boundaryContext.preferredTargetIndex || 0];
    }
    
    // Case 2: More than 2 potential targets - use Y for initial target, then X for switching levels
    // Initialize boundary context if needed
    if (!tracking.boundaryContext || tracking.boundaryContext.parentKey !== parentKey) {
      let initialTargetIndex = 0; // Default to inner-most
      if (tracking.yDirection === 'up') {
        // If entering from below, start with outer-most
        initialTargetIndex = potentialTargets.length - 1;
      }
      
      tracking.boundaryContext = {
        parentKey,
        lastChildKey: originalTarget.key,
        preferredTargetIndex: initialTargetIndex,
        lastSwitchY: y,
        lastSwitchX: x,
        entryDirection: tracking.yDirection
      };
    }
    
    let boundaryContext = tracking.boundaryContext;
    let distanceFromLastXSwitch = Math.abs(x - boundaryContext.lastSwitchX);
    
    // X movement controls level selection
    if (distanceFromLastXSwitch > X_SWITCH_THRESHOLD && currentXMovement) {
      let currentTargetIndex = boundaryContext.preferredTargetIndex || 0;
      
      if (currentXMovement === 'left') {
        if (this.direction === 'ltr') {
          // LTR: left = move to higher level in tree (increase index)
          if (currentTargetIndex < potentialTargets.length - 1) {
            boundaryContext.preferredTargetIndex = currentTargetIndex + 1;
            boundaryContext.lastSwitchX = x;
          }
        } else {
          // RTL: left = move to lower level in tree (decrease index)
          if (currentTargetIndex > 0) {
            boundaryContext.preferredTargetIndex = currentTargetIndex - 1;
            boundaryContext.lastSwitchX = x;
          }
        }
      } else if (currentXMovement === 'right') {
        if (this.direction === 'ltr') {
          // LTR: right = move to lower level in tree (decrease index)
          if (currentTargetIndex > 0) {
            boundaryContext.preferredTargetIndex = currentTargetIndex - 1;
            boundaryContext.lastSwitchX = x;
          }
        } else {
          // RTL: right = move to higher level in tree (increase index)
          if (currentTargetIndex < potentialTargets.length - 1) {
            boundaryContext.preferredTargetIndex = currentTargetIndex + 1;
            boundaryContext.lastSwitchX = x;
          }
        }
      }
    }

    let targetIndex = Math.max(0, Math.min(boundaryContext.preferredTargetIndex || 0, potentialTargets.length - 1));
    return potentialTargets[targetIndex];
  }
} 
