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
import {CenterBaseline, centerBaseline} from './CenterBaseline';
import {CloseButton} from './CloseButton';
import type {DismissButtonProps} from 'react-aria';
import {DOMRef} from '@react-types/shared';
import {forwardRef, ReactNode} from 'react';
import {getAllowedOverrides} from './style-utils' with { type: 'macro' };
import {IconContext} from './Icon';
import InfoCircle from '../s2wf-icons/S2_Icon_InfoCircle_20_N.svg';
import {Provider} from 'react-aria-components';
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

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
  marginY: size(12)
});

const text = style({
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  marginEnd: 16,
  marginY: size(6) // combines with content margin to have edge-to-text margin of 18
});

let ICONS = {
  informative: InfoCircle,
  negative: AlertTriangle,
  neutral: undefined
};

const baseHeight = {
  height: 56
} as const;

const icon = style({
  ...baseHeight,
  flexShrink: 0,
  alignSelf: 'start',
  marginEnd: size(9), // text-to-visual-300
  '--iconPrimary': {
    type: 'fill',
    value: 'white'
  }
});

const button = style({
  marginEnd: 16
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
        <CenterBaseline className={style({display: 'flex', flexGrow: 1, flexShrink: 1})}>
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
        </CenterBaseline>
        <CenterBaseline className={style(baseHeight)}>
          <CloseButton onPress={onDismiss} staticColor="white" />
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
