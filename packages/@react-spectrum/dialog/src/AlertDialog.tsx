/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {Button} from '@react-spectrum/button';
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {Content, Footer, Header} from '@react-spectrum/view';
import {Dialog} from './Dialog';
import {Divider} from '@react-spectrum/divider';
import {Heading} from '@react-spectrum/typography';
import React from 'react';
import {SpectrumAlertDialogProps} from '@react-types/dialog';
import {SpectrumButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';


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
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let confirmVariant: SpectrumButtonProps['variant'] = 'primary';
  if (variant) {
    if (variant === 'confirmation') {
      confirmVariant = 'cta';
    } else if (variant === 'destructive') {
      confirmVariant = 'negative';
    }
  }

  return (
    <Dialog {...styleProps} UNSAFE_className={classNames(styles, {[`spectrum-Dialog--${variant}`]: variant}, styleProps.className)} size="M" role="alertdialog">
      <Header><Heading>{title}</Heading>{(variant === 'error' || variant === 'warning') && <AlertMedium slot="typeIcon" aria-label="alert" />}</Header>
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
