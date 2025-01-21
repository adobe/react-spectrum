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

import AlertTriangle from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import CheckmarkCircle from '../s2wf-icons/S2_Icon_CheckmarkCircle_20_N.svg';
import {ComponentType, createContext, forwardRef, ReactNode, useEffect, useRef} from 'react';
import {ContentContext, HeadingContext} from './Content';
import {ContextValue, Provider, SlotProps} from 'react-aria-components';
import {DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {focusRing, style} from '../style' with {type: 'macro'};
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import InfoCircle from '../s2wf-icons/S2_Icon_InfoCircle_20_N.svg';
// @ts-ignore
import intlMessages from '../intl/*.json';
import NoticeSquare from '../s2wf-icons/S2_Icon_AlertDiamond_20_N.svg';
import {useDOMRef} from '@react-spectrum/utils';
import {useFocusRing} from 'react-aria';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface InlineAlertProps extends DOMProps, StyleProps, InlineStylesProps, SlotProps {
  /**
   * The contents of the Inline Alert.
   */
  children: ReactNode,
  /**
   * Whether to automatically focus the Inline Alert when it first renders.
   */
  autoFocus?: boolean
}

interface InlineStylesProps {
  /**
   * The semantic tone of a Inline Alert.
   * @default neutral
   */
  variant?: 'informative' | 'positive' | 'notice' | 'negative' | 'neutral',
  /**
   * The visual style of the Inline Alert.
   * @default border
   */
  fillStyle?: 'border' | 'subtleFill' | 'boldFill'
}

export const InlineAlertContext = createContext<ContextValue<Partial<InlineAlertProps>, DOMRefValue<HTMLDivElement>>>(null);

const inlineAlert = style<InlineStylesProps & {isFocusVisible?: boolean}>({
  ...focusRing(),
  display: 'inline-block',
  position: 'relative',
  boxSizing: 'border-box',
  padding: 24,
  borderRadius: 'lg',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: {
    fillStyle: {
      border: {
        variant: {
          informative: 'informative-800',
          positive: 'positive-700',
          notice: 'notice-700',
          negative: 'negative-800',
          neutral: 'gray-700' // is there a semantic color name for neutral?
        }
      },
      subtleFill: 'transparent',
      boldFill: 'transparent'
    }
  },
  backgroundColor: {
    variant: {
      informative: {
        fillStyle: {
          border: 'gray-25',
          subtleFill: 'informative-subtle',
          boldFill: 'informative'
        }
      },
      positive: {
        fillStyle: {
          border: 'gray-25',
          subtleFill: 'positive-subtle',
          boldFill: 'positive'
        }
      },
      notice: {
        fillStyle: {
          border: 'gray-25',
          subtleFill: 'notice-subtle',
          boldFill: 'notice'
        }
      },
      negative: {
        fillStyle: {
          border: 'gray-25',
          subtleFill: 'negative-subtle',
          boldFill: 'negative'
        }
      },
      neutral: {
        fillStyle: {
          border: 'gray-25',
          subtleFill: 'neutral-subtle',
          boldFill: 'neutral-subdued'
        }
      }
    }
  }
}, getAllowedOverrides());

const icon = style<InlineStylesProps>({
  gridArea: 'icon',
  '--iconPrimary': {
    type: 'fill',
    value: {
      fillStyle: {
        border: {
          variant: {
            informative: 'informative',
            positive: 'positive',
            notice: 'notice',
            negative: 'negative',
            neutral: 'neutral'
          }
        },
        subtleFill: {
          variant: {
            informative: 'informative',
            positive: 'positive',
            notice: 'negative',
            negative: 'negative',
            neutral: 'neutral'
          }
        },
        boldFill: {
          default: 'white',
          variant: {
            notice: 'black'
          }
        }
      }
    }
  }
});

const grid = style({
  display: 'grid',
  columnGap: 24,
  gridTemplateColumns: '1fr auto',
  gridTemplateRows: 'auto auto auto',
  width: 'full',
  gridTemplateAreas: [
    'heading icon',
    'content content'
  ]
});

let ICONS = {
  informative: InfoCircle,
  positive: CheckmarkCircle,
  notice: NoticeSquare,
  negative: AlertTriangle,
  neutral: undefined
};

const heading = style({
  marginTop: 0,
  gridArea: 'heading',
  font: 'title-sm',
  color: {
    default: 'title',
    fillStyle: {
      boldFill: {
        default: 'white',
        variant: {
          notice: 'black'
        }
      }
    }
  }
});

const content = style({
  gridArea: 'content',
  font: 'body-sm',
  color: {
    default: 'body',
    fillStyle: {
      boldFill: {
        default: 'white',
        variant: {
          notice: 'black'
        }
      }
    }
  }
});

/**
 * Inline alerts display a non-modal message associated with objects in a view.
 * These are often used in form validation, providing a place to aggregate feedback related to multiple fields.
 */
export const InlineAlert = /*#__PURE__*/ forwardRef(function InlineAlert(props: InlineAlertProps, ref: DOMRef<HTMLDivElement>) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  [props, ref] = useSpectrumContextProps(props, ref, InlineAlertContext);
  let {
    children,
    variant = 'neutral',
    fillStyle = 'border',
    autoFocus
  } = props;

  let domRef = useDOMRef(ref);

  let Icon: ComponentType<any> | null | undefined = null;
  let iconAlt = '';
  if (variant in ICONS) {
    Icon = ICONS[variant];
    if (Icon) {
      iconAlt = stringFormatter.format(`inlinealert.${variant}`);
    }
  }

  let {isFocusVisible, focusProps} = useFocusRing({autoFocus: props.autoFocus});
  let autoFocusRef = useRef(props.autoFocus);
  useEffect(() => {
    if (autoFocusRef.current && domRef.current) {
      domRef.current.focus();
    }
    autoFocusRef.current = false;
  }, [domRef]);

  return (
    <div
      {...filterDOMProps(props)}
      {...focusProps}
      ref={domRef}
      tabIndex={autoFocus ? -1 : undefined}
      autoFocus={autoFocus}
      role="alert"
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + inlineAlert({
        variant,
        fillStyle,
        isFocusVisible
      }, props.styles)}>
      <div
        className={grid}>
        <Provider
          values={[
            [HeadingContext, {styles: heading({fillStyle})}],
            [ContentContext, {styles: content({fillStyle})}],
            [IconContext, {styles: icon({variant, fillStyle})}]
          ]}>
          {Icon && <Icon aria-label={iconAlt} />}
          {children}
        </Provider>
      </div>
    </div>
  );
});
