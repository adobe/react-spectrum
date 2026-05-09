import React, {forwardRef, useCallback} from 'react';
import {Modal as RNModal, View as RNView} from 'react-native';
import {FocusScope, Overlay, Pressable, View} from '../../primitives';
import {cn} from '../../styles/cn';

export interface TrayProps {
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  hideHandle?: boolean;
  isDismissable?: boolean;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  scrimClassName?: string;
  testID?: string;
}

export const Tray = forwardRef<React.ElementRef<typeof RNView>, TrayProps>(
  function Tray(props, ref) {
    let {
      children,
      className,
      contentClassName,
      hideHandle,
      isDismissable = true,
      isOpen,
      onOpenChange,
      scrimClassName,
      testID
    } = props;

    let close = useCallback(() => {
      onOpenChange?.(false);
    }, [onOpenChange]);

    let handleScrimPress = useCallback(() => {
      if (isDismissable) {
        close();
      }
    }, [close, isDismissable]);

    return (
      <RNModal
        animationType="slide"
        onRequestClose={close}
        testID={testID}
        transparent
        visible={isOpen}>
        <FocusScope autoFocus contain restoreFocus>
          <Overlay
            accessibilityViewIsModal
            className={cn('justify-end bg-overlay', className)}
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
              accessibilityViewIsModal
              className={cn(
                'rounded-t-lg bg-surface px-400 pb-600 pt-300',
                contentClassName
              )}
              ref={ref}>
              {!hideHandle && (
                <View
                  accessibilityElementsHidden
                  className="mb-300 h-50 w-1000 self-center rounded-full bg-border"
                  importantForAccessibility="no-hide-descendants"
                />
              )}
              {children}
            </View>
          </Overlay>
        </FocusScope>
      </RNModal>
    );
  }
);
