import {Selection} from '@react-types/shared';

/** Returns whether two sets are equal. */
export function isSetEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a === b) {
    return true;
  }

  if (a.size !== b.size) {
    return false;
  }

  for (let key of a) {
    if (!b.has(key)) {
      return false;
    }
  }

  return true;
}

export function isSelectionEqual(a: Selection, b: Selection): boolean {
  if (a === b) {
    return true;
  }

  if (a === 'all' || b === 'all') {
    return false;
  }

  return isSetEqual(a, b);
}

export const difference = typeof Set.prototype.difference === 'function'
  ? function <T> (a: ReadonlySet<T>, b: ReadonlySet<T>) {
    return a.difference(b);
  }
  : function <T> (a: ReadonlySet<T>, b: ReadonlySet<T>) {
    const res = new Set<T>();
    for (const key of a) {
      if (!b.has(key)) {
        res.add(key);
      }
    }
    return res;
  };

export function diffSets<T>(prev: ReadonlySet<T>, next: ReadonlySet<T>, additional?: ReadonlySet<T>) {
  const added = difference(next, prev);
  const removed = difference(prev, next);
  additional?.forEach((key) => {
    if (next.has(key)) {
      added.add(key);
    } else {
      removed.add(key);
    }
  });
  return {
    added,
    removed
  };
}
