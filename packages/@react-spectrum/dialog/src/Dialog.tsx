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

import {ActionButton} from '@react-spectrum/button';
import {classNames, filterDOMProps, useSlotProvider, useStyleProps} from '@react-spectrum/utils';
import CrossLarge from '@spectrum-icons/ui/CrossLarge';
import {DialogContext, DialogContextValue} from './context';
import {FocusScope} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import {SpectrumBaseDialogProps, SpectrumDialogProps} from '@react-types/dialog';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useDialog, useModalDialog} from '@react-aria/dialog';

export function Dialog(props: SpectrumDialogProps) {
  let {
    type = 'popover',
    ...contextProps
  } = useContext(DialogContext) || {} as DialogContextValue;
  let {
    children,
    isDismissable,
    onDismiss,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let slotProps = useSlotProvider(otherProps);
  let allProps: SpectrumBaseDialogProps = mergeProps(
    mergeProps(
      mergeProps(
        mergeProps(
          filterDOMProps(otherProps),
          contextProps
        ),
        slotProps
      ),
      styleProps
    ),
    {className: classNames(styles, {'spectrum-Dialog--dismissable': isDismissable})}
  );
  let size = type === 'popover' ? undefined : (otherProps.size || 'L');

  if (type === 'popover') {
    return <BaseDialog {...allProps} size={size}>{children}</BaseDialog>;
  } else {
    if (type === 'fullscreen' || type === 'fullscreenTakeover') {
      size = type;
    }

    return (
      <ModalDialog {...allProps} size={size}>
        {children}
        {isDismissable && <ActionButton slot="closeButton" isQuiet icon={<CrossLarge size="L" />} onPress={onDismiss} />}
      </ModalDialog>
    );
  }
}

function ModalDialog(props: SpectrumBaseDialogProps) {
  let {modalProps} = useModalDialog();
  return <BaseDialog {...mergeProps(props, modalProps)} />;
}

let sizeMap = {
  S: 'small',
  M: 'medium',
  L: 'large',
  fullscreen: 'fullscreen',
  fullscreenTakeover: 'fullscreenTakeover'
};

function BaseDialog({children, slots, size, role, ...otherProps}: SpectrumBaseDialogProps) {
  let ref = useRef();
  let sizeVariant = sizeMap[size];
  let {dialogProps} = useDialog({ref, role});
  if (!slots) {
    slots = {
      container: {className: styles['spectrum-Dialog-grid']},
      hero: {className: styles['spectrum-Dialog-hero']},
      header: {className: styles['spectrum-Dialog-header']},
      heading: {className: styles['spectrum-Dialog-heading']},
      typeIcon: {className: styles['spectrum-Dialog-typeIcon']},
      divider: {className: styles['spectrum-Dialog-divider'], size: 'M'},
      content: {className: styles['spectrum-Dialog-content']},
      footer: {className: styles['spectrum-Dialog-footer']},
      closeButton: {className: styles['spectrum-Dialog-closeButton']}
    };
  }

  return (
    <FocusScope contain restoreFocus>
      <div
        {...mergeProps(otherProps, dialogProps)}
        className={classNames(
          styles,
          'spectrum-Dialog',
          {[`spectrum-Dialog--${sizeVariant}`]: sizeVariant},
          otherProps.className
        )}
        ref={ref}>
        <Grid slots={slots}>
          {children}
        </Grid>
      </div>
    </FocusScope>
  );
}
