import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {View} from '../../primitives';
import {useProvider} from '../../provider';
import {cn} from '../../styles/cn';
import type {FlexProps} from './types';

export const Flex = forwardRef<React.ElementRef<typeof RNView>, FlexProps>(
  function Flex(props, ref) {
    let {
      alignItems,
      children,
      className,
      direction = 'row',
      gap,
      justifyContent,
      style,
      wrap,
      ...otherProps
    } = props;
    let {theme} = useProvider();
    let resolvedGap = typeof gap === 'string' ? (theme.spacing[gap] ?? Number(gap)) : gap;

    return (
      <View
        {...otherProps}
        className={cn('flex', className)}
        ref={ref}
        style={[
          {
            alignItems,
            flexDirection: direction,
            flexWrap: wrap ? 'wrap' : 'nowrap',
            gap: Number.isFinite(resolvedGap) ? resolvedGap : undefined,
            justifyContent
          },
          style
        ]}>
        {children}
      </View>
    );
  }
);
