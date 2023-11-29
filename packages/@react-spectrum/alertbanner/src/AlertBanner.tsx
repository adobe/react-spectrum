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
import {Button, ClearButton} from '@react-spectrum/button';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import CrossMedium from '@spectrum-icons/ui/CrossMedium';
import {DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
import React, {ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/alertbanner/vars.css';
import {useProviderProps} from '@react-spectrum/provider';


export interface SpectrumAlertBannerProps extends DOMProps, StyleProps {
  text?: string | ReactNode,
  variant?: 'neutral' | 'info' | 'negative',
  actionLabel?: string,
  onAction?: () => void,
  isDismissable?: boolean
}

const ICONS = {
  info: InfoMedium,
  negative: AlertMedium
};

function AlertBanner(props: SpectrumAlertBannerProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    text,
    variant = 'neutral',
    isDismissable = false,
    actionLabel,
    onAction = () => {},
    ...otherProps
  } = props;
  // Handles RSP specific style options, UNSAFE_style, and UNSAFE_className props (see https://react-spectrum.adobe.com/react-spectrum/styling.html#style-props)
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  let Icon = null;
  let iconLabel: string;
  if (variant in ICONS) {
    Icon = ICONS[variant];
    iconLabel = variant;
  }

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-AlertBanner', 'spectrum-AlertBanner--' + variant, styleProps.className)} 
      role="alert">
      {Icon &&
        <Icon
          aria-label={iconLabel}
          UNSAFE_className={classNames(styles, 'spectrum-AlertBanner-typeIcon')} />
      }
      <div className={classNames(styles, 'spectrum-AlertBanner-body')}>
        <div className={classNames(styles, 'spectrum-AlertBanner-content')} >{text || ''}</div>
        {actionLabel &&
        <Button
          onPress={onAction}
          UNSAFE_className={classNames(styles, 'spectrum-Button')}
          variant="secondary"
          staticColor="white">
          {actionLabel}
        </Button>
        }
      </div>
      {
        isDismissable && 
        <div className={classNames(styles, 'spectrum-AlertBanner-buttons')}>
          <ClearButton variant="overBackground">
            <CrossMedium />
          </ClearButton>
        </div>
      }
    </div>
  );
}

/**
 * TODO: Add description of component here.
 */
const _AlertBanner = React.forwardRef(AlertBanner);
export {_AlertBanner as AlertBanner};
