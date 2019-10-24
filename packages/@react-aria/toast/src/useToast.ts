import {AllHTMLAttributes, SyntheticEvent} from 'react';
import intlMessages from '../intl/*.json';
import {PressEvent} from '@react-aria/interactions';
import {useMessageFormatter} from '@react-aria/i18n';
import {ToastProps} from '@react-types/toast';

interface ActionButtonProps extends AllHTMLAttributes<HTMLHeadingElement> {
  onPress?: (e: PressEvent) => void,
}

interface CloseButtonProps extends AllHTMLAttributes<HTMLHeadingElement> {
  onPress?: (e: PressEvent) => void,
}

interface ToastAria {
  toastProps: AllHTMLAttributes<HTMLHeadingElement>,
  iconProps: AllHTMLAttributes<HTMLHeadingElement>,
  actionButtonProps: ActionButtonProps,
  closeButtonProps: CloseButtonProps
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
  }
}
