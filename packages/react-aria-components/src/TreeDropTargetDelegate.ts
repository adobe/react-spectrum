import {Direction, DropTarget, DropTargetDelegate, ItemDropTarget, Key, Node, RootDropTarget} from '@react-types/shared';

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
    lastSwitchY: number,
    lastSwitchX: number,
    preferredTargetIndex?: number
  } | null
}

const X_SWITCH_THRESHOLD = 10;
const Y_SWITCH_THRESHOLD = 5;
export class TreeDropTargetDelegate<T> {
  private delegate: DropTargetDelegate | null = null;
  private state: TreeState<T> | null = null;
  private direction: Direction = 'ltr';
  private pointerTracking: PointerTracking = {
    lastY: 0,
    lastX: 0,
    yDirection: null,
    xDirection: null,
    boundaryContext: null
  };

  setup(delegate: DropTargetDelegate, state: TreeState<T>, direction: Direction): void {
    this.delegate = delegate;
    this.state = state;
    this.direction = direction;
  }

  getDropTargetFromPoint(x: number, y: number, isValidDropTarget: (target: DropTarget) => boolean): DropTarget | null {
    let baseTarget = this.delegate!.getDropTargetFromPoint(x, y, isValidDropTarget);
    if (!baseTarget || baseTarget.type === 'root') {
      return baseTarget;
    }

    return this.resolveDropTarget(baseTarget, x, y, isValidDropTarget);
  }

  private resolveDropTarget(
    target: ItemDropTarget,
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): RootDropTarget | ItemDropTarget | null {
    let tracking = this.pointerTracking;

    // Calculate movement directions
    let deltaY = y - tracking.lastY;
    let deltaX = x - tracking.lastX;
    let currentYMovement: 'up' | 'down' | null = tracking.yDirection;
    let currentXMovement: 'left' | 'right' | null = tracking.xDirection;

    if (Math.abs(deltaY) > Y_SWITCH_THRESHOLD) {
      currentYMovement = deltaY > 0 ? 'down' : 'up';
      tracking.yDirection = currentYMovement;
      tracking.lastY = y;
    }

    if (Math.abs(deltaX) > X_SWITCH_THRESHOLD) {
      currentXMovement = deltaX > 0 ? 'right' : 'left';
      tracking.xDirection = currentXMovement;
      tracking.lastX = x;
    }

    // Normalize to 'after'
    if (target.dropPosition === 'before') {
      let keyBefore = this.state!.collection.getKeyBefore(target.key);
      if (keyBefore != null) {
        let convertedTarget = {
          type: 'item',
          key: keyBefore,
          dropPosition: 'after'
        } as const;

        if (isValidDropTarget(convertedTarget)) {
          target = convertedTarget;
        }
      }
    }

    let potentialTargets = this.getPotentialTargets(target, isValidDropTarget);

    if (potentialTargets.length === 0) {
      return {type: 'root'};
    }

    let resolvedItemTarget: ItemDropTarget;
    if (potentialTargets.length > 1) {
      resolvedItemTarget = this.selectTarget(potentialTargets, target, x, y, currentYMovement, currentXMovement);
    } else {
      resolvedItemTarget = potentialTargets[0];
      // Reset boundary context since we're not in a boundary case
      tracking.boundaryContext = null;
    }

    return resolvedItemTarget;
  }

  // Returns potential targets for an ambiguous drop position (e.g. after the last child of a parent, or after the parent itself)
  // Ordered by level, from innermost to outermost.
  private getPotentialTargets(originalTarget: ItemDropTarget, isValidDropTarget: (target: DropTarget) => boolean): ItemDropTarget[] {
    if (originalTarget.dropPosition === 'on') {
      return [originalTarget];
    }

    let target = originalTarget;
    let collection = this.state!.collection;

    let currentItem = collection.getItem(target.key);
    while (currentItem && currentItem?.type !== 'item' && currentItem.nextKey != null) {
      target.key = currentItem.nextKey;
      currentItem = collection.getItem(currentItem.nextKey);
    }

    let potentialTargets = [target];

    // If target has children and is expanded, use "before first child"
    if (currentItem && currentItem.hasChildNodes && this.state!.expandedKeys.has(currentItem.key) && collection.getChildren && target.dropPosition === 'after') {
      let firstChildItemNode: Node<T> | null = null;
      for (let child of collection.getChildren(currentItem.key)) {
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
        } else {
          return [];
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
      let parentItem = collection.getItem(parentKey);
      let nextItem = parentItem?.nextKey ? collection.getItem(parentItem.nextKey) : null;
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
      let nextKey = collection.getKeyAfter(target.key);
      let nextNode = nextKey ? collection.getItem(nextKey) : null;
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

    return potentialTargets.filter(isValidDropTarget);
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
    let currentItem = this.state!.collection.getItem(originalTarget.key);
    let parentKey = currentItem?.parentKey;

    if (!parentKey) {
      return potentialTargets[0];
    }

    // More than 1 potential target - use Y for initial target, then X for switching levels
    // Initialize boundary context if needed
    if (!tracking.boundaryContext || tracking.boundaryContext.parentKey !== parentKey) {
      // If entering from below, start with outer-most
      let initialTargetIndex = tracking.yDirection === 'up' ? potentialTargets.length - 1 : 0;
      tracking.boundaryContext = {
        parentKey,
        preferredTargetIndex: initialTargetIndex,
        lastSwitchY: y,
        lastSwitchX: x
      };
    }

    let boundaryContext = tracking.boundaryContext;
    let distanceFromLastXSwitch = Math.abs(x - boundaryContext.lastSwitchX);
    let distanceFromLastYSwitch = Math.abs(y - boundaryContext.lastSwitchY);

    // Switch between targets based on Y movement
    if (distanceFromLastYSwitch > Y_SWITCH_THRESHOLD && currentYMovement) {
      let currentIndex = boundaryContext.preferredTargetIndex || 0;

      if (currentYMovement === 'down' && currentIndex === 0) {
        // Moving down from inner-most, switch to outer-most
        boundaryContext.preferredTargetIndex = potentialTargets.length - 1;
      } else if (currentYMovement === 'up' && currentIndex === potentialTargets.length - 1) {
        // Moving up from outer-most, switch to inner-most
        boundaryContext.preferredTargetIndex = 0;
      }

      // Reset x tracking so that moving diagonally doesn't cause flickering.
      tracking.xDirection = null;
    }

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

      // Reset y tracking so that moving diagonally doesn't cause flickering.
      tracking.yDirection = null;
    }

    let targetIndex = Math.max(0, Math.min(boundaryContext.preferredTargetIndex || 0, potentialTargets.length - 1));
    return potentialTargets[targetIndex];
  }
}
