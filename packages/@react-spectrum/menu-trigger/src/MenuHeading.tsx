import {classNames} from '@react-spectrum/utils';
import {Heading} from '@react-spectrum/typography';
import React from 'react';
import {SpectrumMenuHeadingProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

export function MenuHeading<T>({item}: SpectrumMenuHeadingProps<T>) {
  return (
    <Heading
      UNSAFE_className={
        classNames(
          styles, 
          'spectrum-Menu-sectionHeading'
        )
      }
      aria-level={3}
      role="heading">
      {item.rendered}
    </Heading>
  );
}
