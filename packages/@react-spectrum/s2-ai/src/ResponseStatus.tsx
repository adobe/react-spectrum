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

import {
  AriaLabelingProps,
  DOMProps,
  DOMRef,
  DOMRefValue,
  GlobalDOMAttributes
} from '@react-types/shared';
import {baseColor, focusRing, space, style} from '../style' with {type: 'macro'};
import {Button} from 'react-aria-components/Button';
import {CenterBaseline, centerBaseline} from './CenterBaseline';
import CheckmarkCircle from '../s2wf-icons/S2_Icon_CheckmarkCircle_20_N.svg';
import Chevron from '../ui-icons/Chevron';
import {ContextValue, Provider, useSlottedContext} from 'react-aria-components/slots';
import {
  DisclosureStateContext,
  Disclosure as RACDisclosure,
  DisclosurePanel as RACDisclosurePanel,
  DisclosurePanelProps as RACDisclosurePanelProps,
  DisclosureProps as RACDisclosureProps
} from 'react-aria-components/Disclosure';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {
  getAllowedOverrides,
  StyleProps,
  StylesPropWithFont,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import {Heading} from 'react-aria-components/Heading';
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ProgressCircle} from './ProgressCircle';
import React, {createContext, forwardRef, ReactNode, useContext} from 'react';
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ResponseStatusProps
  extends
    Omit<
      RACDisclosureProps,
      'className' | 'style' | 'render' | 'children' | keyof GlobalDOMAttributes
    >,
    StyleProps {
  /**
   * The size of the response status.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /**
   * The amount of space between stacked response statuses.
   *
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious';
  /**
   * Whether the response is still being generated. When true, a ProgressCircle replaces
   * the chevron and the panel cannot be expanded. The trigger remains focusable.
   */
  isLoading?: boolean;
  /**
   * The contents of the response status, consisting of a ResponseStatusTitle and
   * ResponseStatusPanel.
   */
  children: ReactNode;
}

export const ResponseStatusContext =
  createContext<ContextValue<Partial<ResponseStatusProps>, DOMRefValue<HTMLDivElement>>>(null);

const responseStatus = style(
  {
    color: 'heading',
    minWidth: 200
  },
  getAllowedOverrides()
);

/**
 * A ResponseStatus indicates the progress of a system response while it is begin generated and when
 * it is complete.
 */
export const ResponseStatus = forwardRef(function ResponseStatus(
  props: ResponseStatusProps,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, ResponseStatusContext);
  let {size = 'M', density = 'regular', isLoading, UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useDOMRef(ref);

  let disclosureProps: Partial<RACDisclosureProps> = {};
  if (isLoading) {
    disclosureProps.isExpanded = false;
    disclosureProps.onExpandedChange = () => {};
  }

  return (
    <Provider values={[[ResponseStatusContext, {size, density, isLoading}]]}>
      <RACDisclosure
        {...props}
        {...disclosureProps}
        ref={domRef}
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + responseStatus(null, props.styles)}>
        {props.children}
      </RACDisclosure>
    </Provider>
  );
});

export interface ResponseStatusTitleProps extends UnsafeStyles, DOMProps {
  /**
   * The heading level of the response status header.
   *
   * @default 3
   */
  level?: number;
  /** The contents of the response status header. */
  children: React.ReactNode;
  /**
   * Spectrum-defined styles, returned by the `style()` macro. Only allows overriding
   * `font`, `fontFamily`, `fontWeight`, `fontSize`, and `lineHeight`.
   */
  styles?: StylesPropWithFont;
}

const headingStyle = style({
  margin: 0,
  flexGrow: 1,
  display: 'flex',
  flexShrink: 1,
  minWidth: 0
});

const buttonStyles = style(
  {
    ...focusRing(),
    outlineOffset: -2,
    font: {
      size: {
        S: 'body-sm',
        M: 'body',
        L: 'body-lg',
        XL: 'body-xl'
      }
    },
    color: {
      default: baseColor('neutral'),
      forcedColors: 'ButtonText',
      isDisabled: {
        default: 'disabled',
        forcedColors: 'GrayText'
      }
    },
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    paddingX: 'calc(self(minHeight) * 3/8 - 1px)',
    gap: 'calc(self(minHeight) * 3/8 - 1px)',
    minHeight: {
      size: {
        S: {
          density: {
            compact: 18,
            regular: 24,
            spacious: 32
          }
        },
        M: {
          density: {
            compact: 24,
            regular: 32,
            spacious: 40
          }
        },
        L: {
          density: {
            compact: 32,
            regular: 40,
            spacious: 48
          }
        },
        XL: {
          density: {
            compact: 40,
            regular: 48,
            spacious: 56
          }
        }
      }
    },
    width: 'full',
    backgroundColor: 'transparent',
    transition: 'default',
    borderWidth: 0,
    borderRadius: 'default',
    textAlign: 'start',
    disableTapHighlight: true
  },
  getAllowedOverrides({font: true})
);

const chevronStyles = style({
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transition: 'default',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  flexShrink: 0
});

const progressCircleStyles = style({
  width: {
    size: {
      S: 16,
      M: 18,
      L: 20,
      XL: 22
    }
  },
  height: {
    size: {
      S: 16,
      M: 18,
      L: 20,
      XL: 22
    }
  }
});

/**
 * A response status title consisting of a heading and a trigger button. The leading icon is
 * a progress circle while loading and a chevron once complete; a checkmark is rendered at
 * the trailing edge of the row when not loading.
 */
export const ResponseStatusTitle = forwardRef(function ResponseStatusTitle(
  props: ResponseStatusTitleProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {level = 3, UNSAFE_style, UNSAFE_className = '', styles, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  const domProps = filterDOMProps(otherProps);
  let {direction} = useLocale();
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let {size = 'M', density, isLoading} = useSlottedContext(ResponseStatusContext)!;
  let isRTL = direction === 'rtl';
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');

  return (
    <Heading
      {...domProps}
      level={level}
      ref={domRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + headingStyle}>
      <Button
        className={renderProps => buttonStyles({...renderProps, size, density}, styles)}
        slot="trigger">
        {isLoading ? (
          <CenterBaseline>
            <ProgressCircle
              styles={progressCircleStyles({size})}
              isIndeterminate
              aria-label={stringFormatter.format('responsestatus.loading')}
            />
          </CenterBaseline>
        ) : (
          <CenterBaseline>
            <Chevron
              size={size}
              className={chevronStyles({isExpanded, isRTL})}
              aria-hidden="true"
            />
          </CenterBaseline>
        )}
        {props.children}
        {!isLoading && (
          <Provider
            values={[
              [
                IconContext,
                {
                  render: centerBaseline({slot: 'icon'}),
                  styles: style({
                    marginStart: 'auto',
                    flexShrink: 0,
                    size: {
                      size: {
                        S: 16,
                        M: 20,
                        L: 24,
                        XL: 28
                      }
                    },
                    '--iconPrimary': {
                      type: 'fill',
                      value: 'currentColor'
                    }
                  })({size})
                }
              ]
            ]}>
            <CheckmarkCircle aria-hidden="true" />
          </Provider>
        )}
      </Button>
    </Heading>
  );
});

export interface ResponseStatusPanelProps
  extends
    Omit<RACDisclosurePanelProps, 'className' | 'style' | 'render' | 'children'>,
    UnsafeStyles,
    DOMProps,
    AriaLabelingProps {
  children: React.ReactNode;
}

const panelStyles = style({
  font: 'body',
  height: '--disclosure-panel-height',
  overflow: 'clip',
  transition: {
    default: '[height]',
    '@media (prefers-reduced-motion: reduce)': 'none'
  }
});

const panelInner = style({
  paddingTop: 8,
  paddingBottom: 16,
  paddingX: {
    size: {
      S: 8,
      M: space(9),
      L: 12,
      XL: space(15)
    }
  }
});

/**
 * A response status panel is a collapsible section of content that is hidden until the
 * response status is expanded. The panel cannot be expanded while `isLoading` is true.
 */
export const ResponseStatusPanel = forwardRef(function ResponseStatusPanel(
  props: ResponseStatusPanelProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {UNSAFE_style, UNSAFE_className = '', ...otherProps} = props;
  let {size = 'M'} = useSlottedContext(ResponseStatusContext)!;
  const domProps = filterDOMProps(otherProps);
  let panelRef = useDOMRef(ref);
  return (
    <RACDisclosurePanel
      {...domProps}
      ref={panelRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + panelStyles}>
      <div className={panelInner({size})}>{props.children}</div>
    </RACDisclosurePanel>
  );
});
