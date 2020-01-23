import {classNames} from '@react-spectrum/utils';
import {Node} from '@react-stately/collections';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

interface MenuHeadingProps<T> {
  item: Node<T>
}

export function MenuHeading<T>({item}: MenuHeadingProps<T>) {
  return (
    <div role="presentation">
      <span
        aria-level={3}
        role="heading"
        className={classNames(
          styles,
          'spectrum-Menu-sectionHeading')}>
        {item.rendered}
      </span>
    </div>
  );
}
