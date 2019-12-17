import {chain} from './chain';
import classNames from 'classnames';
import {mergeIds} from './useId';

interface Props {
  [key: string]: any
}

export function mergeProps<T extends Props, U extends Props>(a: T, b: U): T & U {
  let res: Props = {};
  for (let key in a) {
    // Chain events
    if (/^on[A-Z]/.test(key) && typeof a[key] === 'function' && typeof b[key] === 'function') {
      res[key] = chain(a[key], b[key]);

    // Merge classnames, sometimes classNames are empty string which eval to false, so we just need to do a type check
    } else if (key === 'className' && typeof a.className === 'string' && typeof b.className === 'string') {
      res[key] = classNames(a.className, b.className);

    } else if (key === 'id' && a.id && b.id) {
      res.id = mergeIds(a.id, b.id);

    // Override others
    } else {
      res[key] = b[key] !== undefined ? b[key] : a[key];
    }
  }

  // Add props from b that are not in a
  for (let key in b) {
    if (a[key] === undefined) {
      res[key] = b[key];
    }
  }

  return res as T & U;
}
