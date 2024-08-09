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
import {Button, pendingDelay} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {chain, useEvent} from '@react-aria/utils';
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {Dialog} from './Dialog';
import {DialogContext, DialogContextValue} from './context';
import {Divider} from '@react-spectrum/divider';
import {DOMRef} from '@react-types/shared';
import {Heading} from '@react-spectrum/text';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {forwardRef, useContext, useEffect, useRef, useState} from 'react';
import {SpectrumAlertDialogProps} from '@react-types/dialog';
import {SpectrumButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

/**
 * AlertDialogs are a specific type of Dialog. They display important information that users need to acknowledge.
 */
function AlertDialog(props: SpectrumAlertDialogProps, ref: DOMRef) {
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
    pendingAction,
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

  let [disabledByPending, setDisabledByPending] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (pendingAction != null) {
      // Delay visually disabling other buttons until pending button enters its pending state
      timeout = setTimeout(() => {
        setDisabledByPending(true);
      }, pendingDelay);
    } else {
      // Enable dialog buttons when pending action is removed.
      setDisabledByPending(false);
    }
    return () => {
      // Clean up on unmount or when user clears/changes pendingAction prop before entering pending state.
      clearTimeout(timeout);
    };
  }, [pendingAction]);

  // Prevent Escape from closing the Dialog until pending action is finished
  let windowRef = useRef(typeof window !== 'undefined' ? window : null);
  useEvent(windowRef, 'keydown', e => {
    if (e.key === 'Escape' && pendingAction != null) {
      e.stopPropagation();
    }
  }, {capture: true});

  return (
    <Dialog
      UNSAFE_style={styleProps.style}
      UNSAFE_className={classNames(styles, {[`spectrum-Dialog--${variant}`]: variant}, styleProps.className)}
      isHidden={styleProps.hidden}
      size="M"
      role="alertdialog"
      ref={ref}>
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
            isDisabled={disabledByPending}
            onPress={() => pendingAction == null && chain(onClose(), onCancel())}
            autoFocus={autoFocusButton === 'cancel'}>
            {cancelLabel}
          </Button>
        }
        {secondaryActionLabel &&
          <Button
            isPending={pendingAction === 'secondary'}
            variant="secondary"
            onPress={() => pendingAction == null && chain(onClose(), onSecondaryAction())}
            isDisabled={isSecondaryActionDisabled || (pendingAction !== 'secondary' && disabledByPending)}
            autoFocus={autoFocusButton === 'secondary'}>
            {secondaryActionLabel}
          </Button>
        }
        <Button
          isPending={pendingAction === 'primary'}
          variant={confirmVariant}
          onPress={() => pendingAction == null && chain(onClose(), onPrimaryAction())}
          isDisabled={isPrimaryActionDisabled || (pendingAction !== 'primary' && disabledByPending)}
          autoFocus={autoFocusButton === 'primary'}>
          {primaryActionLabel}
        </Button>
      </ButtonGroup>
    </Dialog>
  );
}

/**
 * AlertDialogs are a specific type of Dialog. They display important information that users need to acknowledge.
 */
let _AlertDialog = forwardRef(AlertDialog);
export {_AlertDialog as AlertDialog};
