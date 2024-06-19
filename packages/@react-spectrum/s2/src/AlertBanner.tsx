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

import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import type {DismissButtonProps} from 'react-aria';
import {getAllowedOverrides} from './style-utils' with { type: 'macro' };
import {DOMRef} from '@react-types/shared';
import {forwardRef, ReactNode} from 'react';
import {Button} from './Button';
import {ClearButton} from './ClearButton';
import AlertTriangle from '../s2wf-icons/assets/svg/S2_Icon_AlertTriangle_20_N.svg';
import InfoCircle from '../s2wf-icons/assets/svg/S2_Icon_InfoCircle_20_N.svg';
import {IconContext} from './Icon';
import {Provider} from 'react-aria-components';
import {useDOMRef} from '@react-spectrum/utils';
import {CenterBaseline, centerBaseline} from './CenterBaseline';

export interface AlertBannerProps extends DismissButtonProps {
  /** The content of the alert banner. */
  children: ReactNode,

  /** The label of the action button. */
  actionLabel?: ReactNode,

  /** The callback triggered when the action button is pressed. */
  onAction?: () => void,

  /**
   * The variant changes the background color of the alert banner. When an alert banner has a semantic meaning, they should use the variant for semantic colors.
   *
   * @default 'neutral'
   */
  variant?: 'neutral' | 'informative' | 'negative'
}

const banner = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'start',
  backgroundColor: {
    variant: {
      neutral: 'neutral-subdued',
      informative: 'informative',
      negative: 'negative'
    }
  },
  color: 'white',
  fontSize: 'ui',
  fontFamily: 'sans',
  boxSizing: 'border-box',
  paddingStart: 16, // spacing-300
  paddingEnd: 8, // spacing-100
  minHeight: 56,
  width: size(832)
}, getAllowedOverrides());

const content = style({
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'end',
  marginY: size(11)
});

const text = style({
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  marginEnd: 16,
  marginY: size(7) // combines with content margin to have edge-to-text margin of 18
});

let ICONS = {
  informative: InfoCircle,
  negative: AlertTriangle,
  neutral: undefined
};

const icon = style({
  flexShrink: 0,
  alignSelf: 'start',
  marginTop: size(18),
  marginEnd: size(9), // text-to-visual-300
  '--iconPrimary': {
    type: 'fill',
    value: 'white'
  }
});

const button = style({
  marginEnd: 16,
  marginY: size(1) // combines with text margin to have text-button spacing of 8 (wrapped mode)
});

function AlertBanner(props: AlertBannerProps, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);
  let {
    actionLabel,
    children,
    onAction,
    onDismiss,
    variant = 'neutral'
  } = props;

  let Icon, iconAlt;
  if (variant in ICONS) {
    Icon = ICONS[variant];
    iconAlt = variant;
  }

  return (
    <div
      ref={domRef}
      className={banner({variant})}>
      <Provider
        values={[
          [IconContext, {
            render: centerBaseline({slot: 'icon', className: style({order: 0})}),
            styles: icon
          }]
        ]}>
        {Icon && <Icon aria-label={iconAlt} />}
        <div className={content}>
          <div className={text}>
            {children}
          </div>
          {actionLabel && onAction && (
            <Button
              variant="primary"
              staticColor="white"
              fillStyle="outline"
              onPress={onAction}
              styles={button}>
              {actionLabel}
            </Button>
          )}
        </div>
        <CenterBaseline style={{marginTop: 12}}>
          <ClearButton onPress={onDismiss} style={{height: 32}} />
        </CenterBaseline>
      </Provider>
    </div>
  );
}

/**
 * An alert banner displays pressing and high-signal messages and meant to prompt users to take action.
 */
let _AlertBanner = forwardRef(AlertBanner);
export {_AlertBanner as AlertBanner};
