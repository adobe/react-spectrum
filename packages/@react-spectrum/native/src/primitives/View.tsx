import React, {forwardRef} from 'react';
import {View as RNView, type ViewProps} from 'react-native';
import {useProvider} from '../provider';
import {cn} from '../styles/cn';
import {resolveStyleProps} from '../styles/styleProps';
import type {SpectrumViewProps} from './types';

const UniwindView = RNView as any;

export const View = forwardRef<React.ElementRef<typeof RNView>, SpectrumViewProps>(
  function View(props, ref) {
    let {children, className, style, ...otherProps} = props;
    let {direction, scale, theme} = useProvider();
    let resolvedStyle = resolveStyleProps(otherProps, {direction, scale, theme});

    return (
      <UniwindView
        {...otherProps}
        className={cn(className)}
        ref={ref}
        style={[resolvedStyle, style]}>
        {children}
      </UniwindView>
    );
  }
);
