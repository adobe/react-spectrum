import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {Button} from '@react-spectrum/button';
import {classNames} from '@react-spectrum/utils';
import {Content, Footer, Header} from '@react-spectrum/view';
import {Dialog} from './Dialog';
import {Divider} from '@react-spectrum/divider';
import React from 'react';
import {SpectrumAlertDialogProps} from '@react-types/dialog';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {Text} from '@react-spectrum/typography';

export function AlertDialog(props: SpectrumAlertDialogProps) {
  let {
    variant,
    children,
    secondaryLabel,
    cancelLabel,
    primaryLabel,
    autoFocusButton,
    title,
    isConfirmDisabled,
    onCancel,
    onConfirm,
  } = props;

  let confirmVariant = 'negative' as 'negative' | 'primary' | 'cta';
  if (variant && (variant === 'information' || variant === 'error')) {
    confirmVariant = 'primary';
  } else if (variant && variant === 'confirmation') {
    confirmVariant = 'cta';
  }

  return (
    <Dialog UNSAFE_className={classNames(styles, `spectrum-Dialog--${variant}`)}>
      <Header><Text slot="title">{title}</Text>{variant === 'error' && <AlertMedium slot="typeIcon" aria-label="alert" />}</Header>
      <Divider size="M" />
      <Content>{children}</Content>
      <Footer>
        {secondaryLabel && <Button variant="secondary" onPress={() => onConfirm('secondary')} autoFocus={autoFocusButton === 'secondary'}>{secondaryLabel}</Button>}
        {cancelLabel && <Button variant="secondary" onPress={onCancel} autoFocus={autoFocusButton === 'cancel'}>{cancelLabel}</Button>}
        <Button variant={confirmVariant} onPress={() => onConfirm('primary')} isDisabled={isConfirmDisabled} autoFocus={autoFocusButton === 'primary'}>{primaryLabel}</Button>
      </Footer>
    </Dialog>
  );
}
