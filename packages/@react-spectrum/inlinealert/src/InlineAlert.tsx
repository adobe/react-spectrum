/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {classNames, SlotProvider, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {FocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {ReactNode, useEffect, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/inlinealert/vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

export interface SpectrumInlineAlertProps extends DOMProps, StyleProps {
  /**
   * The [visual style](https://spectrum.adobe.com/page/in-line-alert/#Options) of the Inline Alert.
   * @default 'neutral'
   */
  variant?: 'neutral' | 'info' | 'positive' | 'notice' | 'negative',
  /**
   * The contents of the Inline Alert.
   */
  children: ReactNode,
  /**
   * Whether to automatically focus the Inline Alert when it first renders.
   */
  autoFocus?: boolean
}

let ICONS = {
  info: InfoMedium,
  positive: SuccessMedium,
  notice: AlertMedium,
  negative: AlertMedium
};

/**
 * Inline alerts display a non-modal message associated with objects in a view.
 * These are often used in form validation, providing a place to aggregate feedback related to multiple fields.
 */
export const InlineAlert = React.forwardRef(function InlineAlert(props: SpectrumInlineAlertProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    children,
    variant = 'neutral',
    autoFocus,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  let slots = {
    heading: {UNSAFE_className: styles['spectrum-InLineAlert-heading']},
    content: {UNSAFE_className: styles['spectrum-InLineAlert-content']}
  };

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/inlinealert');
  let Icon: typeof React.Component | null = null;
  let iconAlt: string = '';
  if (variant in ICONS) {
    Icon = ICONS[variant];
    iconAlt = stringFormatter.format(variant);
  }

  let autoFocusRef = useRef(props.autoFocus);
  useEffect(() => {
    if (autoFocusRef.current && domRef.current) {
      domRef.current.focus();
    }
    autoFocusRef.current = false;
  }, [domRef]);

  return (
    <FocusRing focusRingClass={styles['focus-ring']}>
      <div
        {...filterDOMProps(props)}
        {...styleProps}
        ref={domRef}
        tabIndex={autoFocus ? -1 : undefined}
        autoFocus={autoFocus}
        className={classNames(
          styles,
          'spectrum-InLineAlert',
          `spectrum-InLineAlert--${variant}`,
          styleProps.className
        )}
        role="alert">
        <Grid UNSAFE_className={styles['spectrum-InLineAlert-grid']}>
          <SlotProvider slots={slots}>
            {Icon && <Icon UNSAFE_className={styles['spectrum-InLineAlert-icon']} aria-label={iconAlt} />}
            {children}
          </SlotProvider>
        </Grid>
      </div>
    </FocusRing>
  );
});
