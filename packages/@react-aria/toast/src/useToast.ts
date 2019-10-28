import {AllHTMLAttributes} from 'react';
import intlMessages from '../intl/*.json';
import {PressProps} from '@react-aria/interactions';
import {ToastProps} from '@react-types/toast';
import {useMessageFormatter} from '@react-aria/i18n';

interface ToastAria {
  toastProps: AllHTMLAttributes<HTMLHeadingElement>,
  iconProps: AllHTMLAttributes<HTMLHeadingElement>,
  actionButtonProps: PressProps,
  closeButtonProps: AllHTMLAttributes<HTMLHeadingElement> | PressProps
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
