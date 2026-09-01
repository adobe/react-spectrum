/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertDiamond from '@react-spectrum/s2/icons/AlertDiamond';
import AlertTriangle from '@react-spectrum/s2/icons/AlertTriangle';
import {AriaLabelingProps, DOMProps, DOMRef} from '@react-types/shared';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {CloseButton} from '@react-spectrum/s2/CloseButton';
import {ComponentType, forwardRef, ReactNode} from 'react';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import InfoCircle from '@react-spectrum/s2/icons/InfoCircle';
import intlMessages from '../intl/*.json';
import {lightDark, style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {useDOMRef} from './useDOMRef';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

export interface AIInlineAlertProps extends DOMProps, AriaLabelingProps {
  children: ReactNode;
  variant?: 'informative' | 'positive' | 'notice' | 'negative' | 'neutral';
  onDismiss?: () => void;
  styles?: StyleString;
}

const ICONS: Record<string, ComponentType<any> | undefined> = {
  informative: InfoCircle,
  positive: CheckmarkCircle,
  notice: AlertDiamond,
  negative: AlertTriangle,
  neutral: undefined
};

const container = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box',
  gap: 'text-to-visual',
  borderRadius: 'lg',
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: lightDark('black/3', 'white/3'),
  backgroundColor: lightDark('black/2', 'white/2'),
  paddingStart: 8,
  paddingY: 4,
  minHeight: 32,
  paddingEnd: 4
});

const icon = style<{variant: AIInlineAlertProps['variant']}>({
  size: 18,
  flexShrink: 0,
  '--iconPrimary': {
    type: 'fill',
    value: {
      variant: {
        informative: 'informative',
        positive: 'positive',
        notice: 'notice',
        negative: 'negative',
        neutral: 'neutral'
      }
    }
  }
});

const text = style({
  font: 'ui-sm',
  fontWeight: 'medium',
  flexGrow: 1,
  minWidth: 0
});

export const AIInlineAlert = forwardRef(function AIInlineAlert(
  props: AIInlineAlertProps,
  ref: DOMRef<HTMLDivElement>
) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let {children, variant = 'neutral', onDismiss, styles} = props;
  let domRef = useDOMRef(ref);
  let Icon = ICONS[variant];

  return (
    <div
      {...filterDOMProps(props, {labelable: true})}
      ref={domRef}
      role="alert"
      className={mergeStyles(container, styles)}>
      {Icon && (
        <Icon
          styles={icon({variant})}
          aria-label={stringFormatter.format(`aiinlinealert.${variant}`)}
        />
      )}
      <span className={text}>{children}</span>
      <CloseButton size="S" onPress={onDismiss} />
    </div>
  );
});
