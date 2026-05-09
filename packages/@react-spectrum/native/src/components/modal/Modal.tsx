import React, {forwardRef, useCallback} from 'react';
import {Modal as RNModal, View as RNView, type ViewProps} from 'react-native';
import {FocusScope, Overlay, Pressable, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type ModalAnimationType = 'none' | 'slide' | 'fade';

export interface ModalProps extends Pick<ViewProps, 'accessibilityViewIsModal'> {
  animationType?: ModalAnimationType;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  isDismissable?: boolean;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  scrimClassName?: string;
  testID?: string;
}

export const Modal = forwardRef<React.ElementRef<typeof RNView>, ModalProps>(
  function Modal(props, ref) {
    let {
      animationType = 'fade',
      children,
      className,
      contentClassName,
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
        animationType={animationType}
        onRequestClose={close}
        testID={testID}
        transparent
        visible={isOpen}>
        <FocusScope autoFocus contain restoreFocus>
          <Overlay
            accessibilityViewIsModal
            className={cn('items-center justify-center bg-overlay', className)}
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
              className={cn('max-w-[90%] rounded-md bg-surface p-400 shadow-lg', contentClassName)}
              ref={ref}>
              {children}
            </View>
          </Overlay>
        </FocusScope>
      </RNModal>
    );
  }
);
