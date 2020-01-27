import {Heading} from '@react-spectrum/typography';
import React from 'react';
import {SlotContext} from '@react-spectrum/utils';
import {SpectrumMenuHeadingProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

export function MenuHeading<T>({item}: SpectrumMenuHeadingProps<T>) {
  return (
    <div role="presentation">
      <SlotContext.Provider value={{heading: styles['spectrum-Menu-sectionHeading']}}>
        <Heading
          aria-level={3}
          role="heading">
          {item.rendered}
        </Heading>
      </SlotContext.Provider>
    </div>
  );
}
