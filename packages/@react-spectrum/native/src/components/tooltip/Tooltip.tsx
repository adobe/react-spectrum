import React, {useCallback, useState, type ReactElement} from 'react';
import {Pressable, Text, View} from '../../primitives';
import {Popover} from '../popover/Popover';
import type {PopoverPlacement} from '../popover/Popover';
import {cn} from '../../styles/cn';

export interface TooltipProps {
  children: ReactElement;
  className?: string;
  contentClassName?: string;
  placement?: PopoverPlacement;
  testID?: string;
  tip: React.ReactNode;
}

export function Tooltip({
  children,
  className,
  contentClassName,
  placement = 'top',
  testID,
  tip
}: TooltipProps) {
  let [isOpen, setIsOpen] = useState(false);

  let handleLongPress = useCallback(() => setIsOpen(true), []);
  let handlePressOut = useCallback(() => setIsOpen(false), []);

  let trigger = (
    <Pressable onLongPress={handleLongPress} onPressOut={handlePressOut} testID={testID}>
      {children}
    </Pressable>
  );

  return (
    <View className={className}>
      {trigger}
      <Popover
        contentClassName={cn('px-300 py-200', contentClassName)}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}>
        <View accessibilityRole="text">
          {typeof tip === 'string' ? (
            <Text className="text-200 text-text">{tip}</Text>
          ) : (
            tip
          )}
        </View>
      </Popover>
    </View>
  );
}
