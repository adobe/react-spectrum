import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {View} from '../../primitives';
import {cn} from '../../styles/cn';

export interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = forwardRef<React.ElementRef<typeof RNView>, DividerProps>(function Divider(
  {className, orientation = 'horizontal'},
  ref
) {
  let isVertical = orientation === 'vertical';

  return (
    <View
      accessibilityRole="none"
      className={cn('bg-border', isVertical ? 'h-full' : 'w-full', className)}
      ref={ref}
      style={isVertical ? {width: 1} : {height: 1}}
    />
  );
});
