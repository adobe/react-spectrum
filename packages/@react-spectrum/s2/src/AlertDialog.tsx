/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertTriangle from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import {Button} from './Button';
import {ButtonGroup} from './ButtonGroup';
import {CenterBaseline} from './CenterBaseline';
import {chain} from '@react-aria/utils';
import {Content, Heading} from './Content';
import {Dialog} from './Dialog';
import {DOMProps, DOMRef} from '@react-types/shared';
import {forwardRef, ReactNode} from 'react';
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import NoticeSquare from '../s2wf-icons/S2_Icon_AlertDiamond_20_N.svg';
import {Provider} from 'react-aria-components';
import {style} from '../style' with {type: 'macro'};
import {UnsafeStyles} from './style-utils' with {type: 'macro'};
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AlertDialogProps extends DOMProps, UnsafeStyles {
  /** The [visual style](https://spectrum.adobe.com/page/alert-dialog/#Options) of the AlertDialog.  */
  variant?: 'confirmation' | 'information' | 'destructive' | 'error' | 'warning',
  /** The title of the AlertDialog. */
  title: string,
  /** The contents of the AlertDialog. */
  children: ReactNode,
  /** The label to display within the cancel button. */
  cancelLabel?: string,
  /** The label to display within the confirm button. */
  primaryActionLabel: string,
  /** The label to display within the secondary button. */
  secondaryActionLabel?: string,
  /** Whether the primary button is disabled. */
  isPrimaryActionDisabled?: boolean,
  /** Whether the secondary button is disabled. */
  isSecondaryActionDisabled?: boolean,
  /** Handler that is called when the cancel button is pressed. */
  onCancel?: () => void,
  /** Handler that is called when the primary button is pressed. */
  onPrimaryAction?: () => void,
  /** Handler that is called when the secondary button is pressed. */
  onSecondaryAction?: () => void,
  /** Button to focus by default when the dialog opens. */
  autoFocusButton?: 'cancel' | 'primary' | 'secondary',
  /**
   * The size of the Dialog.
   *
   * @default 'M'
   */
    size?: 'S' | 'M' | 'L'
}

const icon = style({
  marginEnd: 8,
  '--iconPrimary': {
    type: 'fill',
    value: {
      variant: {
        error: 'negative',
        warning: 'notice'
      }
    }
  }
});

/**
 * AlertDialogs are a specific type of Dialog. They display important information that users need to acknowledge.
 */
export const AlertDialog = forwardRef(function AlertDialog(props: AlertDialogProps, ref: DOMRef) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let {
    autoFocusButton,
    cancelLabel,
    secondaryActionLabel,
    primaryActionLabel,
    isSecondaryActionDisabled,
    isPrimaryActionDisabled,
    onCancel = () => {},
    onPrimaryAction = () => {},
    onSecondaryAction = () => {},
    title,
    children,
    variant = 'confirmation'
  } = props;

  let buttonVariant = 'primary';
  if (variant === 'confirmation') {
    buttonVariant = 'accent';
  } else if (variant === 'destructive') {
    buttonVariant = 'negative';
  }

  return (
    <Dialog
      role="alertdialog"
      ref={ref}
      size={props.size}
      UNSAFE_style={props.UNSAFE_style}
      UNSAFE_className={(props.UNSAFE_className || '')}>
      {({close}) => (
        <>
          <Provider
            values={[
              [IconContext, {styles: icon({variant})}]
            ]}>
            <Heading slot="title">
              <CenterBaseline>
                {variant === 'error' && <AlertTriangle aria-label={stringFormatter.format('dialog.alert')} />}
                {variant === 'warning' && <NoticeSquare aria-label={stringFormatter.format('dialog.alert')} />}
                {title}
              </CenterBaseline>
            </Heading>
          </Provider>
          <Content>{children}</Content>
          <ButtonGroup>
            {cancelLabel &&
              <Button
                onPress={() => chain(close(), onCancel())}
                variant="secondary"
                fillStyle="outline"
                autoFocus={autoFocusButton === 'cancel'}>
                {cancelLabel}
              </Button>
            }
            {secondaryActionLabel &&
              <Button
                onPress={() => chain(close(), onSecondaryAction())}
                variant="secondary"
                isDisabled={isSecondaryActionDisabled}
                fillStyle="outline"
                autoFocus={autoFocusButton === 'secondary'}>
                {secondaryActionLabel}
              </Button>
            }
            <Button
              variant={buttonVariant as 'primary' | 'accent' | 'negative'}
              isDisabled={isPrimaryActionDisabled}
              autoFocus={autoFocusButton === 'primary'}
              onPress={() => chain(close(), onPrimaryAction())}>
              {primaryActionLabel}
            </Button>
          </ButtonGroup>
        </>
      )}
    </Dialog>
  );
});
