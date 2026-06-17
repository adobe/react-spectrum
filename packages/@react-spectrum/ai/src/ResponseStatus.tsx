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

import {AriaLabelingProps, DOMProps, DOMRef, GlobalDOMAttributes} from '@react-types/shared';
import {
  baseColor,
  focusRing,
  iconStyle,
  lightDark,
  space,
  style
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button} from 'react-aria-components/Button';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import ChevronRight from '@react-spectrum/s2/icons/ChevronRight';
import {
  DisclosureStateContext,
  Disclosure as RACDisclosure,
  DisclosurePanel as RACDisclosurePanel,
  DisclosurePanelProps as RACDisclosurePanelProps,
  DisclosureProps as RACDisclosureProps
} from 'react-aria-components/Disclosure';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {Heading} from 'react-aria-components/Heading';
import {IconContext} from '@react-spectrum/s2/Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {ProgressCircle} from '@react-spectrum/s2/ProgressCircle';
import {Provider} from 'react-aria-components/slots';
import React, {createContext, forwardRef, ReactNode, useContext} from 'react';
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
export interface ResponseStatusProps extends Omit<
  RACDisclosureProps,
  'className' | 'style' | 'render' | 'children' | keyof GlobalDOMAttributes
> {
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
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

const ResponseStatusContext = createContext<{
  size?: 'S' | 'M' | 'L' | 'XL';
  density?: 'compact' | 'regular' | 'spacious';
  isLoading?: boolean;
}>({});

const responseStatus = style({
  color: 'heading',
  minWidth: 200
});

/**
 * A ResponseStatus indicates the progress of a system response while it is begin generated and when
 * it is complete.
 */
export const ResponseStatus = forwardRef(function ResponseStatus(
  props: ResponseStatusProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {size = 'M', density = 'regular', isLoading, styles} = props;
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
        className={mergeStyles(responseStatus, styles)}>
        {props.children}
      </RACDisclosure>
    </Provider>
  );
});

export interface ResponseStatusTitleProps extends DOMProps {
  /**
   * The heading level of the response status header.
   *
   * @default 3
   */
  level?: number;
  /** The contents of the response status header. */
  children: React.ReactNode;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

const headingStyle = style({
  margin: 0,
  flexGrow: 1,
  display: 'flex',
  flexShrink: 1,
  minWidth: 0
});

const buttonStyles = style({
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
    isLoading: 'neutral',
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
  backgroundColor: {
    default: 'transparent',
    isFocusVisible: lightDark('transparent-black-100', 'transparent-white-100'),
    isHovered: lightDark('transparent-black-100', 'transparent-white-100'),
    isPressed: lightDark('transparent-black-300', 'transparent-white-300'),
    isLoading: 'transparent'
  },
  transition: 'default',
  borderWidth: 0,
  borderRadius: 'default',
  textAlign: 'start',
  disableTapHighlight: true
});

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
  let {level = 3, styles, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  const domProps = filterDOMProps(otherProps);
  let {direction} = useLocale();
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let {size = 'M', density, isLoading} = useContext(ResponseStatusContext)!;
  let isRTL = direction === 'rtl';
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');

  return (
    <Heading {...domProps} level={level} ref={domRef} className={mergeStyles(headingStyle, styles)}>
      <Button
        className={renderProps => buttonStyles({...renderProps, size, density, isLoading})}
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
          <CenterBaseline styles={chevronStyles({isExpanded, isRTL})}>
            <Chevron size={size} />
          </CenterBaseline>
        )}
        {props.children}
        {!isLoading && (
          <Provider
            values={[
              [
                IconContext,
                {
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
            <CenterBaseline slot="icon">
              <CheckmarkCircle aria-hidden="true" />
            </CenterBaseline>
          </Provider>
        )}
      </Button>
    </Heading>
  );
});

export interface ResponseStatusPanelProps
  extends
    Omit<RACDisclosurePanelProps, 'className' | 'style' | 'render' | 'children'>,
    DOMProps,
    AriaLabelingProps {
  children: React.ReactNode;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
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
  let {styles} = props;
  let {size = 'M'} = useContext(ResponseStatusContext)!;
  const domProps = filterDOMProps(props);
  let panelRef = useDOMRef(ref);
  return (
    <RACDisclosurePanel {...domProps} ref={panelRef} className={mergeStyles(panelStyles, styles)}>
      <div className={panelInner({size})}>{props.children}</div>
    </RACDisclosurePanel>
  );
});

// Ideally I would use iconStyle but since it must be fully evaluated at compile time — passing a runtime variable (size prop) to it is not allowed.
// TODO: Should iconStyle also return a runtime function?
function Chevron({size}) {
  switch (size) {
    case 'S':
      return <ChevronRight styles={iconStyle({size: 'S'})} />;
    case 'M':
      return <ChevronRight styles={iconStyle({size: 'M'})} />;
    case 'L':
      return <ChevronRight styles={iconStyle({size: 'L'})} />;
    case 'XL':
      return <ChevronRight styles={iconStyle({size: 'XL'})} />;
  }
}
