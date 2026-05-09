import React, {forwardRef} from 'react';
import {Text as RNText, type TextProps} from 'react-native';
import {cn} from '../styles/cn';
import type {SpectrumTextProps} from './types';

const UniwindText = RNText as any;

export const Text = forwardRef<React.ElementRef<typeof RNText>, SpectrumTextProps>(
  function Text(props, ref) {
    let {children, className, ...otherProps} = props;

    return (
      <UniwindText {...otherProps} className={cn('text-text', className)} ref={ref}>
        {children}
      </UniwindText>
    );
  }
);
