/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from './ActionButton';
import AlertIcon from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import {Button} from './Button';
import {CenterBaseline} from './CenterBaseline';
import CheckmarkIcon from '../s2wf-icons/S2_Icon_CheckmarkCircle_20_N.svg';
import Chevron from '../s2wf-icons/S2_Icon_ChevronDown_20_N.svg';
import {CloseButton} from './CloseButton';
import {createContext, ReactNode, useContext, useEffect, useMemo, useRef} from 'react';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps, isWebKit, useEvent} from '@react-aria/utils';
import {flushSync} from 'react-dom';
import {focusRing, style} from '../style' with {type: 'macro'};
import {FocusScope, useModalOverlay} from 'react-aria';
import InfoIcon from '../s2wf-icons/S2_Icon_InfoCircle_20_N.svg';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ToastOptions as RACToastOptions, UNSTABLE_Toast as Toast, UNSTABLE_ToastContent as ToastContent, UNSTABLE_ToastList as ToastList, ToastProps, UNSTABLE_ToastQueue as ToastQueue, UNSTABLE_ToastRegion as ToastRegion, ToastRegionProps, UNSTABLE_ToastStateContext as ToastStateContext} from 'react-aria-components';
import {Text} from './Content';
import toastCss from './Toast.module.css';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useMediaQuery} from '@react-spectrum/utils';
import {useOverlayTriggerState} from 'react-stately';

export type ToastPlacement = 'top' | 'top end' | 'bottom' | 'bottom end';
export interface ToastContainerProps extends Omit<ToastRegionProps<SpectrumToastValue>, 'queue' | 'children' | 'style' | 'className'> {
  /**
   * Placement of the toast container on the page.
   * @default "bottom"
   */
  placement?: ToastPlacement
}

export interface ToastOptions extends Omit<RACToastOptions, 'priority'>, DOMProps {
  /** A label for the action button within the toast. */
  actionLabel?: string,
  /** Handler that is called when the action button is pressed. */
  onAction?: () => void,
  /** Whether the toast should automatically close when an action is performed. */
  shouldCloseOnAction?: boolean
}

export interface SpectrumToastValue extends DOMProps {
  /** The content of the toast. */
  children: string,
  /** The variant (i.e. color) of the toast. */
  variant: 'positive' | 'negative' | 'info' | 'neutral',
  /** A label for the action button within the toast. */
  actionLabel?: string,
  /** Handler that is called when the action button is pressed. */
  onAction?: () => void,
  /** Whether the toast should automatically close when an action is performed. */
  shouldCloseOnAction?: boolean
}

let globalReduceMotion = false;
function startViewTransition(fn: () => void, type: string) {
  if ('startViewTransition' in document) {
    // Safari doesn't support :active-view-transition-type() yet, so we fall back to a class on the html element.
    document.documentElement.classList.add(toastCss[type]);
    if (globalReduceMotion) {
      document.documentElement.classList.add(toastCss.reduceMotion);
    }

    let viewTransition = document.startViewTransition(() => flushSync(fn));

    viewTransition.ready.catch(() => {});
    viewTransition.finished.then(() => {
      document.documentElement.classList.remove(toastCss[type], toastCss.reduceMotion);
    });
  } else {
    fn();
  }
}

// There is a single global toast queue instance for the whole app, initialized lazily.
let globalToastQueue: ToastQueue<SpectrumToastValue> | null = null;
function getGlobalToastQueue() {
  if (!globalToastQueue) {
    globalToastQueue = new ToastQueue({
      maxVisibleToasts: Infinity,
      wrapUpdate(fn, action) {
        startViewTransition(fn, `toast-${action}`);
      }
    });
  }

  return globalToastQueue;
}

function addToast(children: string, variant: SpectrumToastValue['variant'], options: ToastOptions = {}) {
  let value = {
    children,
    variant,
    actionLabel: options.actionLabel,
    onAction: options.onAction,
    shouldCloseOnAction: options.shouldCloseOnAction,
    ...filterDOMProps(options)
  };

  // Minimum time of 5s from https://spectrum.adobe.com/page/toast/#Auto-dismissible
  // Actionable toasts cannot be auto dismissed. That would fail WCAG SC 2.2.1.
  // It is debatable whether non-actionable toasts would also fail.
  let timeout = options.timeout && !options.actionLabel ? Math.max(options.timeout, 5000) : undefined;
  let queue = getGlobalToastQueue();
  let key = queue.add(value, {timeout, onClose: options.onClose});
  return () => queue.close(key);
}

type CloseFunction = () => void;

const SpectrumToastQueue = {
  /** Queues a neutral toast. */
  neutral(children: string, options: ToastOptions = {}): CloseFunction {
    return addToast(children, 'neutral', options);
  },
  /** Queues a positive toast. */
  positive(children: string, options: ToastOptions = {}): CloseFunction {
    return addToast(children, 'positive', options);
  },
  /** Queues a negative toast. */
  negative(children: string, options: ToastOptions = {}): CloseFunction {
    return addToast(children, 'negative', options);
  },
  /** Queues an informational toast. */
  info(children: string, options: ToastOptions = {}): CloseFunction {
    return addToast(children, 'info', options);
  }
};

export {SpectrumToastQueue as ToastQueue};

const toastRegion = style({
  ...focusRing(),
  display: 'flex',
  flexDirection: {
    placement: {
      top: 'column',
      bottom: 'column-reverse'
    }
  },
  position: 'fixed',
  insetX: 0,
  width: 'fit',
  top: {
    placement: {
      top: {
        default: 16,
        isExpanded: 0
      }
    }
  },
  bottom: {
    placement: {
      bottom: {
        default: 16,
        isExpanded: 0
      }
    }
  },
  marginStart: {
    align: {
      start: 16,
      center: 'auto',
      end: 'auto'
    }
  },
  marginEnd: {
    align: {
      start: 'auto',
      center: 'auto',
      end: 16
    }
  },
  boxSizing: 'border-box',
  maxHeight: 'full',
  borderRadius: 'lg'
});

const toastList = style({
  position: 'relative',
  flexGrow: 1,
  display: 'flex',
  gap: 8,
  flexDirection: {
    placement: {
      top: 'column',
      bottom: 'column-reverse'
    }
  },
  boxSizing: 'border-box',
  marginY: 0,
  padding: {
    default: 0,
    // Add padding when expanded to account for focus ring.
    isExpanded: 8
  },
  paddingBottom: {
    isExpanded: {
      placement: {
        top: 8,
        bottom: 16
      }
    }
  },
  paddingTop: {
    isExpanded: {
      placement: {
        top: 16,
        bottom: 8
      }
    }
  },
  margin: 0,
  marginX: {
    default: 0,
    // Undo padding for focus ring.
    isExpanded: -8
  },
  overflow: {
    isExpanded: 'auto'
  }
});

const toastStyle = style({
  ...focusRing(),
  outlineColor: {
    default: 'focus-ring',
    isExpanded: 'white'
  },
  display: 'flex',
  gap: 16,
  paddingStart: 16,
  paddingEnd: 8,
  paddingY: 12,
  borderRadius: 'lg',
  minHeight: 56,
  '--maxWidth': {
    type: 'maxWidth',
    value: 336
  },
  maxWidth: 'min(var(--maxWidth), 90vw)',
  boxSizing: 'border-box',
  flexShrink: 0,
  font: 'ui',
  color: 'white',
  backgroundColor: {
    variant: {
      neutral: 'neutral-subdued',
      info: 'informative',
      positive: 'positive',
      negative: 'negative'
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  boxShadow: {
    default: 'elevated',
    isExpanded: 'none'
  },
  willChange: 'transform'
});

const toastBody = style({
  // The top toast in a non-expanded stack has the expand button, so it is rendered as a grid.
  // Otherwise it uses flex so the content can wrap when needed.
  display: {
    default: 'grid',
    isSingle: 'flex'
  },
  gridTemplateColumns: ['auto', '1fr', 'auto'],
  gridTemplateAreas: [
    'content content content',
    'expand  .       action'
  ],
  flexGrow: 1,
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: 24,
  rowGap: 8
});

const toastContent = style({
  display: 'flex',
  gap: 8,
  alignItems: 'baseline',
  gridArea: 'content',
  cursor: 'default',
  width: 'fit',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  minWidth: 0
});

const controls = style({
  colorScheme: 'light',
  display: {
    default: 'none',
    isExpanded: 'flex'
  },
  justifyContent: 'end',
  gap: 8,
  opacity: {
    default: 0,
    isExpanded: 1
  }
});

const ICONS = {
  info: InfoIcon,
  negative: AlertIcon,
  positive: CheckmarkIcon
};

interface ToastContainerContextValue {
  isExpanded: boolean,
  toggleExpanded: () => void
}

const ToastContainerContext = createContext<ToastContainerContextValue | null>(null);

/**
 * A ToastContainer renders the queued toasts in an application. It should be placed
 * at the root of the app.
 */
export function ToastContainer(props: ToastContainerProps): ReactNode {
  let {
    placement = 'bottom'
  } = props;
  let queue = getGlobalToastQueue();
  let align = 'center';
  [placement, align = 'center'] = placement.split(' ') as any;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let regionRef = useRef<HTMLDivElement | null>(null);

  let state = useOverlayTriggerState({});
  let {isOpen: isExpanded, close, toggle} = state;
  let ctx = useMemo(() => ({
    isExpanded,
    toggleExpanded() {
      if (!isExpanded && queue.visibleToasts.length <= 1) {
        return;
      }

      startViewTransition(
        () => toggle(),
        isExpanded ? 'toast-collapse' : 'toast-expand'
      );
    }
  }), [isExpanded, toggle, queue]);

  // Set the state to collapsed whenever the queue is emptied.
  useEffect(() => {
    return queue.subscribe(() => {
      if (queue.visibleToasts.length === 0 && isExpanded) {
        close();
      }
    });
  }, [queue, isExpanded, close]);

  let collapse = () => {
    regionRef.current?.focus();
    ctx.toggleExpanded();
  };

  // Prevent scroll, aria hide outside, and contain focus when expanded, since we take over the whole screen.
  // Attach event handler to the ref since ToastRegion doesn't pass through onKeyDown.
  useModalOverlay({}, state, regionRef);
  useEvent(regionRef, 'keydown', isExpanded ? (e) => {
    if (e.key === 'Escape') {
      collapse();
    }
  } : undefined);

  let prefersReducedMotion = useMediaQuery('(prefers-reduced-motion)');
  let reduceMotion = props['PRIVATE_forceReducedMotion'] ?? prefersReducedMotion;
  useEffect(() => {
    let oldGlobalReduceMotion = globalReduceMotion;
    globalReduceMotion = reduceMotion;
    return () => {
      globalReduceMotion = oldGlobalReduceMotion;
    };
  }, [reduceMotion]);

  return (
    <ToastRegion
      {...props}
      ref={regionRef}
      queue={queue}
      className={renderProps => toastRegion({
        ...renderProps,
        placement,
        align,
        isExpanded
      })}>
      <FocusScope contain={isExpanded}>
        <ToastContainerContext.Provider value={ctx}>
          {isExpanded && (
            // eslint-disable-next-line
            <div
              className={toastCss['toast-background'] + style({position: 'fixed', inset: 0, backgroundColor: 'transparent-black-500'})}
              onClick={collapse} />
          )}
          <SpectrumToastList
            placement={placement}
            align={align}
            reduceMotion={reduceMotion} />
          <div className={toastCss['toast-controls'] + controls({isExpanded})}>
            <ActionButton
              size="S"
              onPress={() => queue.clear()}
              // Default focus ring does not have enough contrast against gray background.
              UNSAFE_style={{outlineColor: 'white'}}>
              {stringFormatter.format('toast.clearAll')}
            </ActionButton>
            <ActionButton
              size="S"
              onPress={collapse}
              UNSAFE_style={{outlineColor: 'white'}}>
              {stringFormatter.format('toast.collapse')}
            </ActionButton>
          </div>
        </ToastContainerContext.Provider>
      </FocusScope>
    </ToastRegion>
  );
}

function SpectrumToastList({placement, align, reduceMotion}) {
  let {isExpanded, toggleExpanded} = useContext(ToastContainerContext)!;

  // Attach click handler to ref since ToastList doesn't pass through onClick/onPress.
  let toastListRef = useRef(null);
  useEvent(toastListRef, 'click', (e) => {
    // Have to check if this is a button because stopPropagation in react events doesn't affect native events.
    if (!isExpanded && !(e.target as Element)?.closest('button')) {
      toggleExpanded();
    }
  });

  return (
    <ToastList<SpectrumToastValue>
      ref={toastListRef}
      style={({isHovered}) => {
        let origin = isHovered ? 95 : 55;
        return {
          perspective: 80,
          perspectiveOrigin: 'center ' + (placement === 'top' ? `calc(100% + ${origin}px)` : `${-origin}px`),
          transition: 'perspective-origin 400ms'
        };
      }}
      className={toastCss[isExpanded ? 'toast-list-expanded' : 'toast-list-collapsed'] + toastList({placement, align, isExpanded})}>
      {({toast}) => (
        <SpectrumToast
          toast={toast}
          placement={placement}
          align={align}
          reduceMotion={reduceMotion} />
      )}
    </ToastList>
  );
}

interface SpectrumToastProps extends ToastProps<SpectrumToastValue> {
  placement?: 'top' | 'bottom',
  align?: 'start' | 'center' | 'end',
  reduceMotion?: boolean
}

// Exported locally for stories.
export function SpectrumToast(props: SpectrumToastProps): ReactNode {
  let {toast, placement = 'bottom', align = 'center'} = props;
  let variant = toast.content.variant || 'info';
  let Icon = ICONS[variant];
  let state = useContext(ToastStateContext)!;
  let visibleToasts = state.visibleToasts;
  let index = visibleToasts.indexOf(toast);
  let isMain = index <= 0;
  let ctx = useContext(ToastContainerContext);
  let isExpanded = ctx?.isExpanded || false;
  let toastRef = useRef<HTMLDivElement | null>(null);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');

  // When not expanded, use a presentational div for the toasts behind the top one.
  // The content is invisible, all we show is the background color.
  if (!isMain && ctx && !ctx.isExpanded) {
    return (
      <div
        role="presentation"
        style={{
          position: 'absolute',
          [placement === 'top' ? 'bottom' : 'top']: 0,
          left: 0,
          width: '100%',
          translate: `0 0 ${(-12 * index) / 16}rem`,
          // Only 3 toasts are visible in the stack at once, but all toasts are in the DOM.
          // This allows view transitions to smoothly animate them from where they would be
          // in the collapsed stack to their final position in the expanded list.
          opacity: index >= 3 ? 0 : 1,
          zIndex: visibleToasts.length - index - 1,
          // When reduced motion is enabled, use append index to view-transition-name
          // so that adding/removing a toast cross fades instead of transitioning the position.
          // This works because the toasts are seen as separate elements instead of the same one when their index changes.
          viewTransitionName: toast.key + (props.reduceMotion ? '-' + index : ''),
          viewTransitionClass: [toastCss.toast, toastCss['background-toast']].map(c => CSS.escape(c)).join(' ')
        }}
        className={toastCss.toast + toastStyle({variant: toast.content.variant || 'info', index, isExpanded})}
        ref={fixSafariTransform} />
    );
  }

  return (
    <Toast
      ref={toastRef}
      toast={toast}
      style={{
        zIndex: visibleToasts.length - index - 1,
        viewTransitionName: toast.key,
        viewTransitionClass: [toastCss.toast, !isMain ? toastCss['background-toast'] : '', toastCss[placement], toastCss[align]].filter(Boolean).map(c => CSS.escape(c)).join(' ')
      }}
      className={renderProps => toastCss.toast + toastStyle({
        ...renderProps,
        variant: toast.content.variant || 'info',
        index,
        isExpanded
      })}>
      <div role="presentation" className={toastBody({isSingle: !isMain || visibleToasts.length <= 1 || isExpanded})}>
        <ToastContent className={toastContent + (ctx && isMain ? ` ${toastCss['toast-content']}` : null)}>
          {Icon &&
            <CenterBaseline>
              <Icon />
            </CenterBaseline>
          }
          <Text slot="title">{toast.content.children}</Text>
        </ToastContent>
        {!isExpanded && visibleToasts.length > 1 &&
          <ActionButton
            isQuiet
            staticColor="white"
            styles={style({gridArea: 'expand'})}
            // Make the chevron line up with the toast text, even though there is padding within the button.
            UNSAFE_style={{marginInlineStart: variant === 'neutral' ? -10 : 14}}
            UNSAFE_className={ctx && isMain ? toastCss['toast-expand'] : undefined}
            onPress={() => {
              // This button disappears when clicked, so move focus to the toast.
              toastRef.current?.focus();
              ctx?.toggleExpanded();
            }}>
            <Text>{stringFormatter.format('toast.showAll')}</Text>
            {/* @ts-ignore */}
            <Chevron UNSAFE_style={{rotate: placement === 'bottom' ? '180deg' : undefined}} />
          </ActionButton>
        }
        {toast.content.actionLabel &&
          <Button
            variant="secondary"
            fillStyle="outline"
            staticColor="white"
            onPress={() => {
              toast.content.onAction?.();
              if (toast.content.shouldCloseOnAction) {
                state.close(toast.key);
              }
            }}
            UNSAFE_className={ctx && isMain ? toastCss['toast-action'] : undefined}
            styles={style({marginStart: 'auto', gridArea: 'action'})}>
            {toast.content.actionLabel}
          </Button>
        }
      </div>
      <CloseButton
        staticColor="white"
        UNSAFE_className={ctx && isMain ? toastCss['toast-close'] : undefined} />
    </Toast>
  );
}

function fixSafariTransform(el: HTMLDivElement | null) {
  // Safari has a bug where the toasts display in the wrong position (CSS transform is not applied correctly).
  // Work around this by removing it, forcing a reflow, and re-applying.
  if (el && isWebKit()) {
    let translate = el.style.translate;
    el.style.translate = '';
    el.offsetHeight;
    el.style.translate = translate;
  }
}
