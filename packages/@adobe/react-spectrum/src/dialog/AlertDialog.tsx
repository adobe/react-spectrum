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
import {Button} from '../button/Button';
import {ButtonGroup} from '../buttongroup/ButtonGroup';
import {chain} from 'react-aria/private/utils/chain';
import {classNames} from '../utils/classNames';
import {Content} from '../view/Content';
import {Dialog} from './Dialog';
import {DialogContext, DialogContextValue} from './context';
import {Divider} from '../divider/Divider';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from 'react-aria/private/utils/filterDOMProps';
import {Heading} from '../text/Heading';
import intlMessages from '../../intl/dialog/*.json';
// @ts-ignore
import React, {forwardRef, useContext} from 'react';
import {SpectrumAlertDialogProps} from '@react-types/dialog';
import {SpectrumButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useStyleProps} from '../utils/styleProps';

/**
 * AlertDialogs are a specific type of Dialog. They display important information that users need to acknowledge.
 */
export const AlertDialog = forwardRef(function AlertDialog(props: SpectrumAlertDialogProps, ref: DOMRef) {
  let {
    onClose = () => {}
  } = useContext(DialogContext) || {} as DialogContextValue;

  let {
    variant,
    children,
    primaryActionLabel,
    secondaryActionLabel,
    cancelLabel,
    autoFocusButton,
    title,
    isPrimaryActionDisabled,
    isSecondaryActionDisabled,
    onCancel = () => {},
    onPrimaryAction = () => {},
    onSecondaryAction = () => {},
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/dialog');

  let confirmVariant: SpectrumButtonProps['variant'] = 'primary';
  if (variant) {
    if (variant === 'confirmation') {
      confirmVariant = 'cta';
    } else if (variant === 'destructive') {
      confirmVariant = 'negative';
    }
  }

  return (
    <Dialog
      UNSAFE_style={styleProps.style}
      UNSAFE_className={classNames(styles, {[`spectrum-Dialog--${variant}`]: variant}, styleProps.className)}
      isHidden={styleProps.hidden}
      size="M"
      role="alertdialog"
      ref={ref}
      {...filterDOMProps(props)}>
      <Heading>{title}</Heading>
      {(variant === 'error' || variant === 'warning') &&
        <AlertMedium
          slot="typeIcon"
          aria-label={stringFormatter.format('alert')} />
      }
      <Divider />
      <Content>{children}</Content>
      <ButtonGroup align="end">
        {cancelLabel &&
          <Button
            variant="secondary"
            onPress={() => chain(onClose(), onCancel())}
            autoFocus={autoFocusButton === 'cancel'}
            data-testid="rsp-AlertDialog-cancelButton">
            {cancelLabel}
          </Button>
        }
        {secondaryActionLabel &&
          <Button
            variant="secondary"
            onPress={() => chain(onClose(), onSecondaryAction())}
            isDisabled={isSecondaryActionDisabled}
            autoFocus={autoFocusButton === 'secondary'}
            data-testid="rsp-AlertDialog-secondaryButton">
            {secondaryActionLabel}
          </Button>
        }
        <Button
          variant={confirmVariant}
          onPress={() => chain(onClose(), onPrimaryAction())}
          isDisabled={isPrimaryActionDisabled}
          autoFocus={autoFocusButton === 'primary'}
          data-testid="rsp-AlertDialog-confirmButton">
          {primaryActionLabel}
        </Button>
      </ButtonGroup>
    </Dialog>
  );
});
