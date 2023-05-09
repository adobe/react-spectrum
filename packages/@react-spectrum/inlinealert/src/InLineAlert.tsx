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
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {Grid} from '@react-spectrum/layout';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {useRef} from 'react';
import {SpectrumInLineAlertProps} from '@react-types/inlinealert';
import styles from '@adobe/spectrum-css-temp/components/inlinealert/vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import {useAlert} from '@react-aria/alert';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

let ICONS = {
  info: InfoMedium,
  positive: SuccessMedium,
  notice: AlertMedium,
  negative: AlertMedium
};

function InLineAlert(props: SpectrumInLineAlertProps, ref: DOMRef<HTMLDivElement>) {
  // Grabs specific props from the closest Provider (see https://react-spectrum.adobe.com/react-spectrum/Provider.html#property-groups). Remove if your component doesn't support any of the listed props.
  props = useProviderProps(props);
  let {
    children,
    variant = 'neutral',
    ...otherProps
  } = props;

  // Handles RSP specific style options, UNSAFE_style, and UNSAFE_className props (see https://react-spectrum.adobe.com/react-spectrum/styling.html#style-props)
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);
  let gridRef = useRef();
  let {alertProps} = useAlert();

  let slots = {
    icon: {UNSAFE_className: styles['spectrum-InLineAlert-icon'], gridArea: 'icon'},
    header: {UNSAFE_className: styles['spectrum-InLineAlert-header'], gridArea: 'header'},
    content: {UNSAFE_className: styles['spectrum-InLineAlert-content'], gridArea: 'content'},
    buttonGroup: {UNSAFE_className: styles['spectrum-InLineAlert-buttonGroup'], gridArea: 'buttonGroup'}
  };

  let Icon = null;
  if (variant in ICONS) {
    Icon = ICONS[variant];
  }

  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let iconAlt = stringFormatter.format(variant);

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      {...alertProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-InLineAlert',
        `spectrum-InLineAlert--${variant}`, styleProps.className)}>
      <Grid ref={gridRef} UNSAFE_className={styles['spectrum-InLineAlert-grid']}>
        <SlotProvider slots={slots}>
          {Icon && <Icon slot="icon" aria-label={iconAlt} />}
          {children}
        </SlotProvider>
      </Grid>
    </div>
  );
}

/**
 * In-line alerts display a non-modal message associated with objects in a view.
 * These are often used in form validation, providing a place to aggregate feedback related to multiple fields.
 */
const _InLineAlert = React.forwardRef(InLineAlert);
export {_InLineAlert as InLineAlert};
