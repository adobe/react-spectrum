import React from 'react';
import {SpectrumAlertDialog} from '@react-types/dialog';
import {Content, Footer, Header} from '@react-spectrum/view';
import {Text} from '@react-spectrum/typography';
import {Divider} from '@react-spectrum/divider';
import {Button} from '@react-spectrum/button';
import {Dialog} from './Dialog';
import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {classNames} from '@react-spectrum/utils';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';

export function AlertDialog(props: SpectrumAlertDialog) {

  let confirmVariant = 'negative' as 'negative' | 'primary' | 'cta';
  if (props.variant && (props.variant === 'information' || props.variant === 'error')) {
    confirmVariant = 'primary';
  } else if (props.variant && props.variant === 'confirmation') {
    confirmVariant = 'cta';
  }

  return (
    <Dialog UNSAFE_className={classNames(styles, `spectrum-Dialog--${props.variant}`)}>
      <Header><Text slot="title">{props.title}</Text>{props.variant === 'error' && <AlertMedium slot="typeIcon" aria-label="alert" />}</Header>
      <Divider size="M" />
      <Content>{props.children}</Content>
      <Footer>
        {props.secondaryLabel && <Button variant="secondary" onPress={() => props.onConfirm('secondary')} autoFocus={props.autoFocusButton === 'secondary'}>{props.secondaryLabel}</Button>}
        <Button variant="secondary" onPress={props.onCancel} autoFocus={props.autoFocusButton === 'cancel'}>{props.cancelLabel}</Button>
        <Button variant={confirmVariant} onPress={() => props.onConfirm('primary')} isDisabled={props.isConfirmDisabled} autoFocus={props.autoFocusButton === 'primary'}>{props.primaryLabel}</Button>
      </Footer>
    </Dialog>
  );
}
