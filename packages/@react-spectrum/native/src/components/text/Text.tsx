import React, {forwardRef} from 'react';
import {Text as RNText} from 'react-native';
import {Text as PrimitiveText} from '../../primitives';
import {useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {textVariants} from './styles';
import type {SpectrumTextProps} from './types';

export const SpectrumText = forwardRef<React.ElementRef<typeof RNText>, SpectrumTextProps>(
  function SpectrumText(rawProps, ref) {
    let props = useProviderProps(rawProps);
    let {children, className, isDisabled, size = 'M', variant = 'body', ...otherProps} = props;

    return (
      <PrimitiveText
        {...otherProps}
        className={cn(textVariants({isDisabled: !!isDisabled, size, variant}), className)}
        ref={ref}>
        {children}
      </PrimitiveText>
    );
  }
);
