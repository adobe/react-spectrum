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
import CloseCircle from '@react-spectrum/s2/icons/CloseCircle';
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
import React, {
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useState
} from 'react';
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
   * The current status of the response.
   *
   * @default 'loading'
   */
  status?: 'loading' | 'failed' | 'success';
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
  status: 'loading' | 'failed' | 'success';
  hasPanelContent: boolean;
  registerPanel: (mounted: boolean) => void;
}>({
  status: 'loading',
  hasPanelContent: false,
  registerPanel: () => {}
});

const responseStatus = style({
  color: 'heading',
  minWidth: 200
});

/**
 * A ResponseStatus indicates the progress of a system response while it is being generated and when
 * it is complete. If a ResponseStatusPanel is provided, the title can be pressed to expand and
 * collapse it.
 */
export const ResponseStatus = forwardRef(function ResponseStatus(
  props: ResponseStatusProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {size = 'M', density = 'regular', status = 'loading', styles} = props;
  let domRef = useDOMRef(ref);
  let [hasPanelContent, setHasPanelContent] = useState(false);
  let registerPanel = useCallback((mounted: boolean) => setHasPanelContent(mounted), []);

  let disclosureProps: Partial<RACDisclosureProps> = {};
  if (status === 'loading') {
    disclosureProps.isExpanded = false;
    disclosureProps.onExpandedChange = () => {};
  }

  return (
    <Provider
      values={[[ResponseStatusContext, {size, density, status, hasPanelContent, registerPanel}]]}>
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
    isLoading: 'transparent',
    isOnlyText: 'transparent'
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
 * A response status title consisting of a heading and a trigger button. The leading icon is a
 * progress circle while loading and a chevron once complete and there is further content to
 * display.
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
  let {size = 'M', density, status, hasPanelContent} = useContext(ResponseStatusContext)!;
  let isRTL = direction === 'rtl';
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');

  let isLoading = status === 'loading';
  let isInteractive = hasPanelContent && !isLoading;

  let rowContent = (
    <>
      {isLoading ? (
        <CenterBaseline>
          <ProgressCircle
            styles={progressCircleStyles({size})}
            isIndeterminate
            aria-label={stringFormatter.format('responsestatus.loading')}
          />
        </CenterBaseline>
      ) : isInteractive ? (
        <CenterBaseline styles={chevronStyles({isExpanded, isRTL})}>
          <Chevron size={size} />
        </CenterBaseline>
      ) : null}
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
            {status === 'failed' ? (
              <CloseCircle aria-hidden="true" />
            ) : (
              // TODO: should this be a different color? This currently matches Coworker
              <CheckmarkCircle aria-hidden="true" />
            )}
          </CenterBaseline>
        </Provider>
      )}
    </>
  );

  return (
    <Heading {...domProps} level={level} ref={domRef} className={mergeStyles(headingStyle, styles)}>
      {/* TODO: should this still be a button if the disclosure doesnt have a panel aka no content?
        If we just render a div, we would need all the same render props and swapping the element would mean focus
        gets lost when it goes from a button to a div
      */}
      <Button
        className={renderProps =>
          buttonStyles({...renderProps, size, density, isLoading, isOnlyText: !isInteractive})
        }
        slot={isInteractive ? 'trigger' : undefined}>
        {rowContent}
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
 * response status is expanded. The panel cannot be expanded while `status` is `'loading'`.
 */
export const ResponseStatusPanel = forwardRef(function ResponseStatusPanel(
  props: ResponseStatusPanelProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {styles} = props;
  let {size = 'M', registerPanel} = useContext(ResponseStatusContext)!;
  const domProps = filterDOMProps(props);
  let panelRef = useDOMRef(ref);

  useLayoutEffect(() => {
    registerPanel(true);
    return () => registerPanel(false);
  }, [registerPanel]);

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
