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
  color,
  css,
  focusRing,
  space,
  style
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button} from 'react-aria-components/Button';
import {Cell} from './loader/data';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import Chevron from '../ui-icons/Chevron';
import CloseCircle from '@react-spectrum/s2/icons/CloseCircle';
import Cross from '../ui-icons/Cross';
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
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {PixelLoader} from '../exports';
import {pressScale} from '@react-spectrum/s2';
import {Provider} from 'react-aria-components/slots';
import React, {
  createContext,
  forwardRef,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useId,
  useRef,
  useState
} from 'react';
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';

export interface ResponseStatusProps extends Omit<
  RACDisclosureProps,
  'className' | 'style' | 'render' | 'children' | keyof GlobalDOMAttributes
> {
  /**
   * The current status of the response.
   *
   * @default 'pending'
   */
  status?: 'pending' | 'failed' | 'success';
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
  status: 'pending' | 'failed' | 'success';
  hasPanelContent: boolean;
  registerPanel: (mounted: boolean) => void;
  isExpanded: boolean;
  responseStatusRef: RefObject<HTMLDivElement | null> | null;
}>({
  status: 'pending',
  hasPanelContent: false,
  registerPanel: () => {},
  isExpanded: false,
  responseStatusRef: null
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
  let {status = 'pending', styles} = props;
  let domRef = useDOMRef(ref);

  return (
    <RACDisclosure {...props} ref={domRef} className={mergeStyles(responseStatus, styles)}>
      <ResponseStatusContextProvider status={status} responseStatusRef={domRef}>
        {props.children}
      </ResponseStatusContextProvider>
    </RACDisclosure>
  );
});

function ResponseStatusContextProvider({
  status,
  children,
  responseStatusRef
}: {
  status: 'pending' | 'success' | 'failed';
  children: ReactNode;
  responseStatusRef: RefObject<HTMLDivElement | null> | null;
}) {
  let [hasPanelContent, setHasPanelContent] = useState(false);
  let registerPanel = useCallback((mounted: boolean) => setHasPanelContent(mounted), []);
  let {isExpanded} = useContext(DisclosureStateContext)!;

  return (
    <ResponseStatusContext.Provider
      value={{status, hasPanelContent, registerPanel, isExpanded, responseStatusRef}}>
      {children}
    </ResponseStatusContext.Provider>
  );
}

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
  /** Pixel loader icon or sequence to display. */
  pixelLoader?: Cell[] | Cell[][];
}

const headingStyle = style({
  margin: 0,
  flexGrow: 1,
  display: 'flex',
  flexShrink: 1,
  minWidth: 0
});

// Top-level disclosure.
const disclosureStyles = style({
  ...focusRing(),
  font: 'body-sm',
  color: {
    default: baseColor('gray-800'),
    forcedColors: 'ButtonText',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  display: 'flex',
  flexGrow: 0,
  alignItems: 'center',
  gap: 8,
  transition: 'default',
  borderRadius: 'default',
  textAlign: 'start',
  width: 'fit'
});

const chevronStyles = {
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
} as const;

/**
 * A response status title consisting of a heading and a trigger button. The leading icon is a
 * progress circle while loading and a chevron once complete and there is further content to
 * display.
 */
export const ResponseStatusTitle = forwardRef(function ResponseStatusTitle(
  props: ResponseStatusTitleProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {level = 3, styles, pixelLoader, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  const domProps = filterDOMProps(otherProps);
  let {direction} = useLocale();
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let {status, hasPanelContent} = useContext(ResponseStatusContext)!;
  let isRTL = direction === 'rtl';
  let isLoading = status === 'pending';
  let isInteractive = hasPanelContent;

  let buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Heading {...domProps} level={level} ref={domRef} className={mergeStyles(headingStyle, styles)}>
      <Button
        ref={buttonRef}
        // eslint-disable-next-line react/react-compiler
        style={pressScale(buttonRef)}
        className={style({
          padding: 0,
          backgroundColor: 'transparent',
          width: 'full',
          disableTapHighlight: true,
          borderWidth: 0,
          outlineStyle: 'none',
          transition: 'default'
        })}
        slot={isInteractive ? 'trigger' : undefined}>
        {renderProps => (
          <span className={disclosureStyles({...renderProps, isOnlyText: !isInteractive})}>
            {isLoading ? (
              <CenterBaseline>
                <PixelLoader size={21} icon={pixelLoader} />
              </CenterBaseline>
            ) : (
              <Provider
                values={[
                  [
                    IconContext,
                    {
                      styles: style({
                        flexShrink: 0,
                        size: 20,
                        '--iconPrimary': {
                          type: 'fill',
                          value: 'currentColor'
                        }
                      })
                    }
                  ]
                ]}>
                <CenterBaseline slot="icon" styles={style({size: 21})}>
                  {status === 'failed' ? (
                    <CloseCircle aria-hidden="true" />
                  ) : (
                    <CheckmarkCircle aria-hidden="true" />
                  )}
                </CenterBaseline>
              </Provider>
            )}
            {/* TODO: translation */}
            {isLoading && isExpanded ? 'Processing...' : props.children}
            {isInteractive ? (
              <CenterBaseline styles={style(chevronStyles)({isExpanded, isRTL})}>
                <Chevron size="M" />
              </CenterBaseline>
            ) : null}
          </span>
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

const panelStyle = {
  font: 'body-2xs',
  color: 'gray-600',
  height: '--disclosure-panel-height',
  overflow: 'clip',
  transition: {
    default: '[height]',
    '@media (prefers-reduced-motion: reduce)': 'none'
  }
} as const;

const panelInner = style({
  paddingTop: 8,
  paddingBottom: 16,
  paddingX: space(9)
});

/**
 * A response status panel is a collapsible section of content that is hidden until the
 * response status is expanded. The panel cannot be expanded while `status` is `'pending'`.
 */
export const ResponseStatusPanel = forwardRef(function ResponseStatusPanel(
  props: ResponseStatusPanelProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {styles} = props;
  let {registerPanel} = useContext(ResponseStatusContext)!;
  const domProps = filterDOMProps(props);
  let panelRef = useDOMRef(ref);

  useLayoutEffect(() => {
    registerPanel(true);
    return () => registerPanel(false);
  }, [registerPanel]);

  return (
    <RACDisclosurePanel
      {...domProps}
      ref={panelRef}
      className={mergeStyles(style({...panelStyle, marginStart: 16}), styles)}>
      <div className={panelInner}>{props.children}</div>
    </RACDisclosurePanel>
  );
});

export interface ExecutionTraceProps extends DOMProps, AriaLabelingProps {
  /**
   * The ExecutionTraceItem elements to render as a timeline. Typically placed inside a
   * ResponseStatusPanel.
   */
  children: ReactNode;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

const executionTraceStyles = style({
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  padding: 0,
  paddingStart: 4,
  listStyleType: 'none'
});

/**
 * An ExecutionTrace displays a timeline of the steps taken while generating a
 * response, such as tool calls or searches.
 */
export const ExecutionTrace = forwardRef(function ExecutionTrace(
  props: ExecutionTraceProps,
  ref: DOMRef<HTMLOListElement>
) {
  let {styles, children, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let domProps = filterDOMProps(otherProps);

  return (
    <ol {...domProps} ref={domRef} className={mergeStyles(executionTraceStyles, styles)}>
      {children}
    </ol>
  );
});

interface DetailTriggerProps {
  children: ReactNode;
  isPending: boolean;
}

const SPREAD = '4ch';

/* Only supported in Chrome/Safari, not Firefox for performance reasons.
   Tried using `mask-image: -moz-element(#id)` but this disables GPU acceleration. */
const shimmer = css(`
  position: relative;
  position: absolute;
  inset: 0;
  overflow: clip;
  color: transparent;
  contain: strict;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
  
  @supports (-webkit-mask-clip: text) {
    mask-image: linear-gradient(white, white);
    -webkit-mask-clip: text;
  }

  @supports not (-webkit-mask-clip: text) {
    display: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent calc(50% - ${SPREAD}), ${color('gray-1000')} 50%, transparent calc(50% + ${SPREAD}));
    will-change: transform;
    pointer-events: none;
  }
`);

const shimmerSym = Symbol('shimmer');

function ShimmerText(props: DetailTriggerProps) {
  let {children, isPending} = props;
  let {isExpanded, responseStatusRef} = useContext(ResponseStatusContext)!;
  let id = useId();

  // Do the animation in JS rather than CSS so we can synchronize across elements.
  let shimmerRef = useCallback(
    (el: HTMLSpanElement | null) => {
      if (el && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let animation = el.animate(
          [{transform: 'translateX(-100%)'}, {transform: 'translateX(100%)'}],
          {duration: 2500, iterations: Infinity, easing: 'ease-in-out', pseudoElement: '::after'}
        );
        animation[shimmerSym] = true;

        // If there is an existing shimmer animation already happening, synchronize with it.
        // If there is only one, then start from the beginning of the animation.
        let existingAnim = responseStatusRef?.current
          ?.getAnimations({subtree: true})
          .find(anim => anim[shimmerSym] && anim !== animation);
        if (existingAnim) {
          animation.startTime = existingAnim.startTime;
        }
        return () => animation.cancel();
      }
    },
    [responseStatusRef]
  );

  return (
    <span className={style({position: 'relative', display: 'inline-block'})}>
      <span id={id} className={style({display: 'inline-block'})}>
        {children}
      </span>
      {/* inert clone of the children with shimmer effect mask. */}
      {isPending && isExpanded && (
        <span inert ref={shimmerRef} className={shimmer}>
          {children}
        </span>
      )}
    </span>
  );
}

// Inner disclosure.
const detailTriggerStyles = style({
  ...focusRing(),
  display: 'block',
  font: 'ui-sm',
  color: {
    default: 'gray-600',
    forcedColors: 'ButtonText',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  flexGrow: 0,
  alignItems: 'center',
  paddingX: 12,
  paddingY: 4,
  gap: 8,
  backgroundColor: {
    default: 'transparent',
    isHovered: 'gray-75',
    isFocusVisible: 'gray-75',
    isPressed: 'gray-75'
  },
  transition: 'default',
  borderWidth: 0,
  borderRadius: 'default',
  textAlign: 'start',
  disableTapHighlight: true,
  truncate: true
});

function DetailTrigger(props: DetailTriggerProps) {
  let ref = useRef<HTMLButtonElement | null>(null);

  return (
    <Button
      ref={ref}
      // eslint-disable-next-line react/react-compiler
      style={pressScale(ref)}
      className={detailTriggerStyles}
      slot="trigger">
      <ShimmerText {...props} />
    </Button>
  );
}

export interface ExecutionTraceItemProps extends DOMProps, AriaLabelingProps {
  /**
   * The label describing the step.
   */
  children: ReactNode;
  /** The status of this step. */
  status?: 'pending' | 'failed' | 'success';
  /**
   * Additional detail revealed when the step is expanded, such as tool call input or output.
   * If omitted, the row is static and cannot be expanded.
   */
  detail?: ReactNode;
  /**
   * An icon shown at the leading edge of the row. If omitted, a checkmark is rendered by default.
   */
  icon?: ReactNode;
  /** Allows detail content to render but prevents the row from being collapsible. */
  isAlwaysOpen?: boolean;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleString;
}

const executionTraceItemStyles = style({
  display: 'flex',
  font: 'body',
  gap: 4,
  '--divider-display': {
    type: 'display',
    value: {
      default: 'block',
      ':last-child': 'none'
    }
  },
  transition: 'opacity',
  transitionDuration: 300,
  opacity: {
    default: 1,
    '@starting-style': 0
  }
});

const executionTraceItemIconContainerStyles = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexShrink: 0
});

const executionTraceItemDividerStyles = style({
  width: 1,
  flexGrow: 1,
  marginY: 0,
  minHeight: 12,
  backgroundColor: 'gray-200',
  display: 'var(--divider-display, flex)',
  transition: 'opacity',
  transitionDuration: 300,
  opacity: {
    default: 1,
    '@starting-style': 0
  }
});

// Extra wrapper for padding to avoid transition jump
const executationTradeDetailWrapperStyle = style({
  paddingTop: 4,
  paddingBottom: 20
});

const executionTraceDetailStyle = style({
  paddingX: 12,
  paddingY: 8,
  backgroundColor: 'layer-1',
  borderRadius: 'lg',
  font: 'body-2xs',
  color: 'gray-600'
});

/**
 * An ExecutionTraceItem represents a single step within an ExecutionTrace, such as
 * a tool call or search. When a `detail` is provided, the row can be expanded to reveal it.
 */
export const ExecutionTraceItem = forwardRef(function ExecutionTraceItem(
  props: ExecutionTraceItemProps,
  ref: DOMRef<HTMLLIElement>
) {
  let {
    isAlwaysOpen,
    detail,
    // TODO: do we still support icons?
    // icon = <CheckmarkCircle aria-hidden="true" />,
    children,
    styles,
    status = 'success',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let domProps = filterDOMProps(otherProps);
  let hasDetail = detail != null;

  return (
    <li {...domProps} ref={domRef} className={mergeStyles(executionTraceItemStyles, styles)}>
      <div className={executionTraceItemIconContainerStyles}>
        {/* <Provider values={[[IconContext, {styles: iconStyle({size: 'M'})}]]}>
          <CenterBaseline>{icon}</CenterBaseline>
        </Provider> */}
        <CenterBaseline>
          {status === 'failed' && (
            <Cross className={style({'--iconPrimary': {type: 'fill', value: 'gray-600'}})} />
          )}
          {status !== 'failed' && (
            <svg
              viewBox="0 0 8 8"
              className={style({
                size: 8,
                fill: {
                  default: 'none',
                  status: {
                    success: 'gray-500'
                  }
                },
                stroke: {
                  default: 'none',
                  status: {
                    pending: 'gray-600'
                  }
                },
                strokeWidth: {
                  default: 0,
                  status: {
                    pending: 1
                  }
                }
              })({status})}>
              <circle cx={4} cy={4} r={status === 'pending' ? 3.5 : 4} />
            </svg>
          )}
        </CenterBaseline>
        <div role="presentation" className={executionTraceItemDividerStyles} />
      </div>
      {hasDetail && !isAlwaysOpen ? (
        <RACDisclosure className="">
          <DetailTrigger isPending={status === 'pending'}>{children}</DetailTrigger>
          <RACDisclosurePanel className={style(panelStyle)}>
            <div className={executationTradeDetailWrapperStyle}>
              <div className={executionTraceDetailStyle}>{detail}</div>
            </div>
          </RACDisclosurePanel>
        </RACDisclosure>
      ) : (
        <div>
          <span className={detailTriggerStyles({})}>
            <ShimmerText isPending={status === 'pending'}>{children}</ShimmerText>
          </span>
          {hasDetail && isAlwaysOpen ? (
            <div className={executationTradeDetailWrapperStyle}>
              <div className={executionTraceDetailStyle}>{detail}</div>
            </div>
          ) : null}
        </div>
      )}
    </li>
  );
});
