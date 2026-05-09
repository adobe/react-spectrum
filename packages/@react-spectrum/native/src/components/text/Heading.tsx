import React, {forwardRef} from 'react';
import {Text as RNText} from 'react-native';
import {Text as PrimitiveText} from '../../primitives';
import {cn} from '../../styles/cn';
import {headingVariants} from './styles';
import type {HeadingProps} from './types';

function sizeForLevel(
  level: NonNullable<HeadingProps['level']>
): NonNullable<HeadingProps['size']> {
  if (level <= 1) {
    return 'XL';
  }
  if (level === 2) {
    return 'L';
  }
  if (level === 3) {
    return 'M';
  }
  return 'S';
}

export const Heading = forwardRef<React.ElementRef<typeof RNText>, HeadingProps>(
  function Heading(props, ref) {
    let {children, className, level = 3, size = sizeForLevel(level), ...otherProps} = props;

    return (
      <PrimitiveText
        {...otherProps}
        accessibilityRole="header"
        className={cn(headingVariants({size}), className)}
        ref={ref}>
        {children}
      </PrimitiveText>
    );
  }
);
