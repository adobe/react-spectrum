import {chain} from './chain';
import classNames from 'classnames';

interface Props {
  [key: string]: any
}

export function mergeProps<T extends Props, U extends Props>(a: T, b: U): Props {
  let res: Props = {};
  for (let key in a) {
    // Chain events
    if (/^on[A-Z]/.test(key) && typeof a[key] === 'function' && typeof b[key] === 'function') {
      res[key] = chain(a[key], b[key]);

    // Merge classnames
    } else if (key === 'className' && a.className && b.className) {
      res[key] = classNames(a.className, b.className);

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

  return res;
}
