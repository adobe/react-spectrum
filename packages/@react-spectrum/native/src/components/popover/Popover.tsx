import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import {Modal as RNModal, View as RNView} from 'react-native';
import {FocusScope, Overlay, Pressable, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverAnchorRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface PopoverProps {
  anchorRect?: PopoverAnchorRect | null;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  isDismissable?: boolean;
  isOpen: boolean;
  offset?: number;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: PopoverPlacement;
  scrimClassName?: string;
  testID?: string;
}

function computeStyle(
  anchor: PopoverAnchorRect | null | undefined,
  placement: PopoverPlacement,
  offset: number
) {
  if (!anchor) {
    return {alignSelf: 'center' as const};
  }
  switch (placement) {
    case 'top':
      return {
        bottom: undefined,
        left: anchor.x,
        position: 'absolute' as const,
        top: Math.max(0, anchor.y - offset)
      };
    case 'bottom':
      return {
        left: anchor.x,
        position: 'absolute' as const,
        top: anchor.y + anchor.height + offset
      };
    case 'left':
      return {
        left: Math.max(0, anchor.x - offset),
        position: 'absolute' as const,
        top: anchor.y
      };
    case 'right':
      return {
        left: anchor.x + anchor.width + offset,
        position: 'absolute' as const,
        top: anchor.y
      };
  }
}

export const Popover = forwardRef<React.ElementRef<typeof RNView>, PopoverProps>(
  function Popover(props, ref) {
    let {
      anchorRect,
      children,
      className,
      contentClassName,
      isDismissable = true,
      isOpen,
      offset = 8,
      onOpenChange,
      placement = 'bottom',
      scrimClassName,
      testID
    } = props;

    let [resolvedAnchor, setResolvedAnchor] = useState<PopoverAnchorRect | null>(
      anchorRect ?? null
    );

    useEffect(() => {
      setResolvedAnchor(anchorRect ?? null);
    }, [anchorRect]);

    let close = useCallback(() => {
      onOpenChange?.(false);
    }, [onOpenChange]);

    let handleScrimPress = useCallback(() => {
      if (isDismissable) {
        close();
      }
    }, [close, isDismissable]);

    let positionStyle = computeStyle(resolvedAnchor, placement, offset);

    return (
      <RNModal
        animationType="fade"
        onRequestClose={close}
        testID={testID}
        transparent
        visible={isOpen}>
        <FocusScope autoFocus contain restoreFocus>
          <Overlay
            accessibilityViewIsModal
            className={cn('bg-transparent', className)}
            pointerEvents="auto">
            <Pressable
              accessibilityElementsHidden
              accessibilityLabel="Dismiss"
              className={cn('absolute bottom-0 left-0 right-0 top-0', scrimClassName)}
              importantForAccessibility="no-hide-descendants"
              onPress={handleScrimPress}
            />
            <View
              accessibilityRole={'dialog' as never}
              className={cn(
                'min-w-[160px] rounded-md border border-border bg-surface p-300 shadow-md',
                contentClassName
              )}
              ref={ref}
              style={positionStyle}>
              {children}
            </View>
          </Overlay>
        </FocusScope>
      </RNModal>
    );
  }
);
