import {Heading} from '@react-spectrum/typography';
import {Node} from '@react-stately/collections';
import React from 'react';
import {SlotContext} from '@react-spectrum/utils';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

interface MenuHeadingProps<T> {
  item: Node<T>
}

export function MenuHeading<T>({item}: MenuHeadingProps<T>) {
  return (
    <div role="presentation">
      <SlotContext.Provider value={{heading: styles['spectrum-Menu-sectionHeading']}}>
        <Heading
          aria-level={3} // TODO: Figure out how to get this aria-level into Heading since it gets filtered out by filterDomProps
          role="heading">
          {item.rendered}
        </Heading>
      </SlotContext.Provider>
    </div>
  );
}
