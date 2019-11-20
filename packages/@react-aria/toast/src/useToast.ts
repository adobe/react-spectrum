import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, ImgHTMLAttributes} from 'react';
import intlMessages from '../intl/*.json';
import {PressProps} from '@react-aria/interactions';
import {ToastProps} from '@react-types/toast';
import {useId} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface ToastAria {
  toastProps: HTMLAttributes<HTMLElement>,
  iconProps: ImgHTMLAttributes<HTMLElement>,
  actionButtonProps: PressProps,
  closeButtonProps: DOMProps & PressProps
}

export function useToast(props: ToastProps): ToastAria {
  let {
    id,
    onAction,
    onClose,
    shouldCloseOnAction,
    variant
  } = props;
  let formatMessage = useMessageFormatter(intlMessages);

  const handleAction = (...args) => {
    if (onAction) {
      onAction(...args);
    }

    if (shouldCloseOnAction && onClose) {
      onClose(...args);
    }
  };

  let iconProps = variant ? {alt: formatMessage(variant)} : {};

  return {
    toastProps: {
      id: useId(id),
      role: 'alert'
    },
    iconProps,
    actionButtonProps: {
      onPress: handleAction
    },
    closeButtonProps: {
      'aria-label': formatMessage('close'),
      onPress: onClose
    }
  };
}
