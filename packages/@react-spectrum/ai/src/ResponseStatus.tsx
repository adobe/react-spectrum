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
  space,
  style
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button} from 'react-aria-components/Button';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import Chevron from '../ui-icons/Chevron';
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
  useState
} from 'react';
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';
import {useLayoutEffect} from '@react-aria/utils';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

export interface ResponseStatusProps extends Omit<
  RACDisclosureProps,
  'className' | 'style' | 'render' | 'children' | keyof GlobalDOMAttributes
> {
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
  let {density = 'regular', status = 'loading', styles} = props;
  let domRef = useDOMRef(ref);
  let [hasPanelContent, setHasPanelContent] = useState(false);
  let registerPanel = useCallback((mounted: boolean) => setHasPanelContent(mounted), []);

  let disclosureProps: Partial<RACDisclosureProps> = {};
  if (status === 'loading') {
    disclosureProps.isExpanded = false;
    disclosureProps.onExpandedChange = () => {};
  }

  return (
    <Provider values={[[ResponseStatusContext, {density, status, hasPanelContent, registerPanel}]]}>
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
  font: 'body',
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
    density: {
      compact: 24,
      regular: 32,
      spacious: 40
    }
  },
  width: 'full',
  backgroundColor: 'transparent',
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
  width: 18,
  height: 18
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
  let {density, status, hasPanelContent} = useContext(ResponseStatusContext)!;
  let isRTL = direction === 'rtl';
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');

  let isLoading = status === 'loading';
  let isInteractive = hasPanelContent && !isLoading;

  let rowContent = (
    <>
      {isLoading ? (
        <CenterBaseline>
          <ProgressCircle
            styles={progressCircleStyles}
            isIndeterminate
            aria-label={stringFormatter.format('responsestatus.loading')}
          />
        </CenterBaseline>
      ) : (
        <Provider
          values={[
            [
              IconContext,
              {
                styles: style({
                  marginStart: 'auto',
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
          <CenterBaseline slot="icon">
            {status === 'failed' ? (
              <CloseCircle aria-hidden="true" />
            ) : (
              <CheckmarkCircle aria-hidden="true" />
            )}
          </CenterBaseline>
        </Provider>
      )}
      {props.children}
      {isInteractive ? (
        <CenterBaseline styles={chevronStyles({isExpanded, isRTL})}>
          <ChevronRight styles={iconStyle({size: 'M'})} />
        </CenterBaseline>
      ) : null}
    </>
  );

  return (
    <Heading {...domProps} level={level} ref={domRef} className={mergeStyles(headingStyle, styles)}>
      <Button
        className={renderProps =>
          buttonStyles({...renderProps, density, isLoading, isOnlyText: !isInteractive})
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
  paddingX: space(9)
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
  let {registerPanel} = useContext(ResponseStatusContext)!;
  const domProps = filterDOMProps(props);
  let panelRef = useDOMRef(ref);

  useLayoutEffect(() => {
    registerPanel(true);
    return () => registerPanel(false);
  }, [registerPanel]);

  return (
    <RACDisclosurePanel {...domProps} ref={panelRef} className={mergeStyles(panelStyles, styles)}>
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
}

const detailTriggerStyles = style({
  display: 'block',
  paddingStart: 8
});

const detailTriggerChevronStyles = style({
  display: 'inline-flex',
  marginStart: 4,
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transition: 'default'
});

function DetailTrigger(props: DetailTriggerProps) {
  let {children} = props;
  let {direction} = useLocale();
  let isRTL = direction === 'rtl';
  let {isExpanded} = useContext(DisclosureStateContext)!;

  return (
    <Button
      className={renderProps => mergeStyles(buttonStyles({...renderProps}), detailTriggerStyles)}
      slot="trigger">
      {children}
      <CenterBaseline styles={detailTriggerChevronStyles({isExpanded, isRTL})}>
        <ChevronRight styles={iconStyle({size: 'S'})} />
      </CenterBaseline>
    </Button>
  );
}

export interface ExecutionTraceItemProps extends DOMProps, AriaLabelingProps {
  /** Allows detail content to render but prevents the row from being collapsible. */
  isDetailNotCollapsible?: boolean;
  /**
   * The label describing the step.
   */
  children: ReactNode;
  /**
   * An icon shown at the leading edge of the row. If omitted, a checkmark is rendered by default.
   */
  icon?: ReactNode;
  /**
   * Additional detail revealed when the step is expanded, such as tool call input or output.
   * If omitted, the row is static and cannot be expanded.
   */
  detail?: ReactNode;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
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
  marginY: 2,
  backgroundColor: 'gray-500',
  display: 'var(--divider-display, flex)'
});

const executionTraceItemBaseStyles = {
  paddingBottom: 12,
  paddingStart: 8
} as const;

const executionTraceWithoutDisclosureStyles = style({
  ...executionTraceItemBaseStyles,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 24
});

const executionTraceDetailPanelStyles = style(executionTraceItemBaseStyles);

/**
 * An ExecutionTraceItem represents a single step within an ExecutionTrace, such as
 * a tool call or search. When a `detail` is provided, the row can be expanded to reveal it.
 */
export const ExecutionTraceItem = forwardRef(function ExecutionTraceItem(
  props: ExecutionTraceItemProps,
  ref: DOMRef<HTMLLIElement>
) {
  let {
    isDetailNotCollapsible,
    detail,
    icon = <CheckmarkCircle aria-hidden="true" />,
    children,
    styles,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let domProps = filterDOMProps(otherProps);
  let hasDetail = detail != null;

  return (
    <li {...domProps} ref={domRef} className={mergeStyles(executionTraceItemStyles, styles)}>
      <div className={executionTraceItemIconContainerStyles}>
        <Provider values={[[IconContext, {styles: iconStyle({size: 'M'})}]]}>
          <CenterBaseline>{icon}</CenterBaseline>
        </Provider>
        <div role="presentation" className={executionTraceItemDividerStyles} />
      </div>
      {hasDetail && !isDetailNotCollapsible ? (
        <RACDisclosure>
          <DetailTrigger>{children}</DetailTrigger>
          <RACDisclosurePanel className={mergeStyles(panelStyles, executionTraceDetailPanelStyles)}>
            {detail}
          </RACDisclosurePanel>
        </RACDisclosure>
      ) : (
        <div className={executionTraceWithoutDisclosureStyles}>
          <span>{children}</span>
          {hasDetail && isDetailNotCollapsible ? <div>{detail}</div> : null}
        </div>
      )}
    </li>
  );
});
