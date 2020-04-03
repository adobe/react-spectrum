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
import {classNames, filterDOMProps, unwrapDOMRef, useDOMRef, useHasChild, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import CrossLarge from '@spectrum-icons/ui/CrossLarge';
import {DialogContext, DialogContextValue} from './context';
import {DOMRef} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import {SpectrumDialogProps} from '@react-types/dialog';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useDialog} from '@react-aria/dialog';
import {useMessageFormatter} from '@react-aria/i18n';

let sizeMap = {
  S: 'small',
  M: 'medium',
  L: 'large',
  fullscreen: 'fullscreen',
  fullscreenTakeover: 'fullscreenTakeover'
};

/**
 * Dialogs display important information that users need to acknowledge.
 * They appear over the interface and block further interactions.
 */
function Dialog(props: SpectrumDialogProps, ref: DOMRef) {
  props = useSlotProps(props);
  let {
    type = 'popover',
    ...contextProps
  } = useContext(DialogContext) || {} as DialogContextValue;
  let {
    children,
    isDismissable = contextProps.isDismissable,
    onDismiss = contextProps.onClose,
    role,
    size,
    ...otherProps
  } = props;
  let formatMessage = useMessageFormatter(intlMessages);
  let {styleProps} = useStyleProps(otherProps);

  size = type === 'popover' ? 'S' : (size || 'L');
  if (type === 'fullscreen' || type === 'fullscreenTakeover') {
    size = type;
  }

  let domRef = useDOMRef(ref);
  let gridRef = useRef();
  let sizeVariant = sizeMap[size];
  let {dialogProps, titleProps} = useDialog({ref: domRef, role, ...otherProps});

  let hasHeader = useHasChild(`.${styles['spectrum-Dialog-header']}`, unwrapDOMRef(gridRef));
  let hasFooter = useHasChild(`.${styles['spectrum-Dialog-footer']}`, unwrapDOMRef(gridRef));

  let slots = {
    container: {UNSAFE_className: styles['spectrum-Dialog-grid']},
    hero: {UNSAFE_className: styles['spectrum-Dialog-hero']},
    header: {UNSAFE_className: styles['spectrum-Dialog-header']},
    heading: {UNSAFE_className: classNames(styles, 'spectrum-Dialog-heading', {'spectrum-Dialog-heading--noHeader': !hasHeader}), ...titleProps},
    typeIcon: {UNSAFE_className: styles['spectrum-Dialog-typeIcon']},
    divider: {UNSAFE_className: styles['spectrum-Dialog-divider'], size: 'M'},
    content: {UNSAFE_className: styles['spectrum-Dialog-content']},
    footer: {UNSAFE_className: styles['spectrum-Dialog-footer']},
    closeButton: {UNSAFE_className: styles['spectrum-Dialog-closeButton']},
    buttonGroup: {UNSAFE_className: classNames(styles, 'spectrum-Dialog-buttonGroup', {'spectrum-Dialog-buttonGroup--noFooter': !hasFooter})}
  };

  return (
    <FocusScope contain restoreFocus>
      <section
        {...mergeProps(
          mergeProps(
            mergeProps(
              filterDOMProps(otherProps),
              filterDOMProps(contextProps)
            ),
            styleProps
          ),
          dialogProps
        )}
        className={classNames(
          styles,
          'spectrum-Dialog',
          {
            [`spectrum-Dialog--${sizeVariant}`]: sizeVariant,
            'spectrum-Dialog--dismissable': isDismissable
          },
          styleProps.className
        )}
        ref={domRef}>
        <Grid slots={slots} ref={gridRef}>
          {children}
          {isDismissable &&
            <ActionButton
              slot="closeButton"
              isQuiet
              aria-label={formatMessage('dismiss')}
              onPress={onDismiss}>
              <CrossLarge size="L" />
            </ActionButton>
          }
        </Grid>
      </section>
    </FocusScope>
  );
}

let _Dialog = React.forwardRef(Dialog);
export {_Dialog as Dialog};
