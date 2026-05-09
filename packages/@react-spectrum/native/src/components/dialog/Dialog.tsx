import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {Heading, Text} from '../text';
import {Flex} from '../layout';
import {Button} from '../button';
import {View} from '../../primitives';
import {Modal, type ModalProps} from '../modal/Modal';
import {cn} from '../../styles/cn';

export interface DialogProps
  extends Omit<ModalProps, 'children' | 'contentClassName'> {
  children?: React.ReactNode;
  contentClassName?: string;
}

export const Dialog = forwardRef<React.ElementRef<typeof RNView>, DialogProps>(
  function Dialog({children, contentClassName, ...modalProps}, ref) {
    return (
      <Modal
        {...modalProps}
        contentClassName={cn('w-[480px] gap-300', contentClassName)}
        ref={ref}>
        {children}
      </Modal>
    );
  }
);

export type AlertDialogVariant =
  | 'confirmation'
  | 'destructive'
  | 'warning'
  | 'information';

export interface AlertDialogProps
  extends Omit<ModalProps, 'children' | 'contentClassName'> {
  cancelLabel?: string;
  children?: React.ReactNode;
  onCancel?: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  title: string;
  variant?: AlertDialogVariant;
}

const variantTitleClass: Record<AlertDialogVariant, string> = {
  confirmation: 'text-text',
  destructive: 'text-negative',
  information: 'text-informative',
  warning: 'text-notice'
};

const variantToButton: Record<AlertDialogVariant, 'accent' | 'negative'> = {
  confirmation: 'accent',
  destructive: 'negative',
  information: 'accent',
  warning: 'accent'
};

export const AlertDialog = forwardRef<React.ElementRef<typeof RNView>, AlertDialogProps>(
  function AlertDialog(props, ref) {
    let {
      cancelLabel,
      children,
      onCancel,
      onOpenChange,
      onPrimaryAction,
      onSecondaryAction,
      primaryActionLabel,
      secondaryActionLabel,
      title,
      variant = 'confirmation',
      ...modalProps
    } = props;

    let close = () => onOpenChange?.(false);
    let handleCancel = () => {
      onCancel?.();
      close();
    };
    let handlePrimary = () => {
      onPrimaryAction?.();
      close();
    };
    let handleSecondary = () => {
      onSecondaryAction?.();
      close();
    };

    return (
      <Dialog {...modalProps} onOpenChange={onOpenChange} ref={ref}>
        <Heading className={cn('text-300 font-bold', variantTitleClass[variant])} level={2}>
          {title}
        </Heading>
        {children != null && (
          <View>
            {typeof children === 'string' ? (
              <Text className="text-200 text-text">{children}</Text>
            ) : (
              children
            )}
          </View>
        )}
        <Flex alignItems="center" className="gap-200" direction="row" justifyContent="flex-end">
          {cancelLabel ? (
            <Button onPress={handleCancel} styleVariant="outline" variant="secondary">
              {cancelLabel}
            </Button>
          ) : null}
          {secondaryActionLabel ? (
            <Button onPress={handleSecondary} styleVariant="outline" variant="secondary">
              {secondaryActionLabel}
            </Button>
          ) : null}
          <Button onPress={handlePrimary} styleVariant="fill" variant={variantToButton[variant]}>
            {primaryActionLabel}
          </Button>
        </Flex>
      </Dialog>
    );
  }
);
