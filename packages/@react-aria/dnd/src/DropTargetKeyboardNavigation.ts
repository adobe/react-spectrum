import {Collection, DropTarget, Key, KeyboardDelegate, Node} from '@react-types/shared';
import {getChildNodes} from '@react-stately/collections';

export function navigate(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection<Node<unknown>>,
  target: DropTarget | null | undefined,
  direction: 'left' | 'right' | 'up' | 'down',
  rtl = false,
  wrap = false
): DropTarget | null {
  switch (direction) {
    case 'left':
      return rtl 
        ? nextDropTarget(keyboardDelegate, collection, target, wrap, 'left')
        : previousDropTarget(keyboardDelegate, collection, target, wrap, 'left');
    case 'right':
      return rtl 
        ? previousDropTarget(keyboardDelegate, collection, target, wrap, 'right')
        : nextDropTarget(keyboardDelegate, collection, target, wrap, 'right');
    case 'up':
      return previousDropTarget(keyboardDelegate, collection, target, wrap);
    case 'down':
      return nextDropTarget(keyboardDelegate, collection, target, wrap);
  }
}

function nextDropTarget(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection<Node<unknown>>,
  target: DropTarget | null | undefined,
  wrap = false,
  horizontal: 'left' | 'right' | null = null
): DropTarget | null {
  if (!target) {
    return {
      type: 'root'
    };
  }

  if (target.type === 'root') {
    let nextKey = keyboardDelegate.getFirstKey?.() ?? null;
    if (nextKey != null) {
      return {
        type: 'item',
        key: nextKey,
        dropPosition: 'before'
      };
    }

    return null;
  }

  if (target.type === 'item') {
    let nextKey: Key | null | undefined = null;
    if (horizontal) {
      nextKey = horizontal === 'right' ? keyboardDelegate.getKeyRightOf?.(target.key) : keyboardDelegate.getKeyLeftOf?.(target.key);
    } else {
      nextKey = keyboardDelegate.getKeyBelow?.(target.key);
    }
    let nextCollectionKey = collection.getKeyAfter(target.key);

    // If the keyboard delegate did not move to the next key in the collection,
    // jump to that key with the same drop position. Otherwise, try the other
    // drop positions on the current key first.
    if (nextKey != null && nextKey !== nextCollectionKey) {
      return {
        type: 'item',
        key: nextKey,
        dropPosition: target.dropPosition
      };
    }
    
    switch (target.dropPosition) {
      case 'before': {
        return {
          type: 'item',
          key: target.key,
          dropPosition: 'on'
        };
      }
      case 'on': {
        // If there are nested items, traverse to them prior to the "after" position of this target.
        // If the next key is on the same level, then its "before" position is equivalent to this item's "after" position.
        let targetNode = collection.getItem(target.key);
        let nextNode = nextKey != null ? collection.getItem(nextKey) : null;
        if (targetNode && nextNode && nextNode.level >= targetNode.level) {
          return {
            type: 'item',
            key: nextNode.key,
            dropPosition: 'before'
          };
        }

        return {
          type: 'item',
          key: target.key,
          dropPosition: 'after'
        };
      }
      case 'after': {
        // If this is the last sibling in a level, traverse to the parent.
        let targetNode = collection.getItem(target.key);        
        if (targetNode && targetNode.nextKey == null && targetNode.parentKey != null) {
          // If the parent item has an item after it, use the "before" position.
          let parentNode = collection.getItem(targetNode.parentKey);
          if (parentNode?.nextKey != null) {
            return {
              type: 'item',
              key: parentNode.nextKey,
              dropPosition: 'before'
            };
          }

          if (parentNode) {
            return {
              type: 'item',
              key: parentNode.key,
              dropPosition: 'after'
            };
          }
        }

        if (targetNode?.nextKey != null) {
          return {
            type: 'item',
            key: targetNode.nextKey,
            dropPosition: 'on'
          };
        }
      }
    }
  }

  if (wrap) {
    return {
      type: 'root'
    };
  }

  return null;
}

function previousDropTarget(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection<Node<unknown>>,
  target: DropTarget | null | undefined,
  wrap = false,
  horizontal: 'left' | 'right' | null = null
): DropTarget | null {
  // Start after the last root-level item.
  if (!target || (wrap && target.type === 'root')) {
    // Keyboard delegate gets the deepest item but we want the shallowest.
    let prevKey: Key | null = null;
    let lastKey = keyboardDelegate.getLastKey?.();
    while (lastKey != null) {
      prevKey = lastKey;
      let node = collection.getItem(lastKey);
      lastKey = node?.parentKey;
    }

    if (prevKey != null) {
      return {
        type: 'item',
        key: prevKey,
        dropPosition: 'after'
      };
    }

    return null;
  }

  if (target.type === 'item') {
    let prevKey: Key | null | undefined = null;
    if (horizontal) {
      prevKey = horizontal === 'left' ? keyboardDelegate.getKeyLeftOf?.(target.key) : keyboardDelegate.getKeyRightOf?.(target.key);
    } else {
      prevKey = keyboardDelegate.getKeyAbove?.(target.key);
    }
    let prevCollectionKey = collection.getKeyBefore(target.key);

    // If the keyboard delegate did not move to the next key in the collection,
    // jump to that key with the same drop position. Otherwise, try the other
    // drop positions on the current key first.
    if (prevKey != null && prevKey !== prevCollectionKey) {
      return {
        type: 'item',
        key: prevKey,
        dropPosition: target.dropPosition
      };
    }

    switch (target.dropPosition) {
      case 'before': {
        // Move after the last child of the previous item.
        let targetNode = collection.getItem(target.key);
        if (targetNode && targetNode.prevKey != null) {
          let lastChild = getLastChild(collection, targetNode.prevKey);
          if (lastChild) {
            return lastChild;
          }
        }

        if (prevKey != null) {
          return {
            type: 'item',
            key: prevKey,
            dropPosition: 'on'
          };
        }

        return {
          type: 'root'
        };
      }
      case 'on': {
        return {
          type: 'item',
          key: target.key,
          dropPosition: 'before'
        };
      }
      case 'after': {
        // Move after the last child of this item.
        let lastChild = getLastChild(collection, target.key);
        if (lastChild) {
          return lastChild;
        }

        return {
          type: 'item',
          key: target.key,
          dropPosition: 'on'
        };
      }
    }
  }

  if (target.type !== 'root') {
    return {
      type: 'root'
    };
  }

  return null;
}

function getLastChild(collection: Collection<Node<unknown>>, key: Key): DropTarget | null {
  // getChildNodes still returns child tree items even when the item is collapsed.
  // Checking if the next item has a greater level is a silly way to determine if the item is expanded.
  let targetNode = collection.getItem(key);
  let nextKey = collection.getKeyAfter(key);
  let nextNode = nextKey != null ? collection.getItem(nextKey) : null;
  if (targetNode && nextNode && nextNode.level > targetNode.level) {
    let children = getChildNodes(targetNode, collection);
    let lastChild: Node<unknown> | null = null;
    for (let child of children) {
      if (child.type === 'item') {
        lastChild = child;
      }
    }

    if (lastChild) {
      return {
        type: 'item',
        key: lastChild.key,
        dropPosition: 'after'
      };
    }
  }

  return null;
}
