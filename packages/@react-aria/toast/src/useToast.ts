import {DOMProps} from '@react-types/shared';
import {ImgHTMLAttributes} from 'react';
import intlMessages from '../intl/*.json';
import {PressProps} from '@react-aria/interactions';
import {ToastProps} from '@react-types/toast';
import {useMessageFormatter} from '@react-aria/i18n';

interface ToastAria {
  toastProps: DOMProps,
  iconProps: ImgHTMLAttributes<HTMLElement>,
  actionButtonProps: PressProps,
  closeButtonProps: DOMProps & PressProps
}

export function useToast(props: ToastProps): ToastAria {
  let {
    onAction,
    onClose,
    role = 'alert',
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
      role
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
