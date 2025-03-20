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

// @ts-nocheck
import {ActionButton} from './ActionButton';
import AlertIcon from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import {Button} from './Button';
import {CenterBaseline} from './CenterBaseline';
import CheckmarkIcon from '../s2wf-icons/S2_Icon_CheckmarkCircle_20_N.svg';
import Chevron from '../s2wf-icons/S2_Icon_ChevronDown_20_N.svg';
import {CloseButton} from './CloseButton';
import {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {focusRing, style} from '../style' with {type: 'macro'};
import InfoIcon from '../s2wf-icons/S2_Icon_InfoCircle_20_N.svg';
import {Text} from './Content';
import {UNSTABLE_Toast as Toast, UNSTABLE_ToastContent as ToastContent, ToastOptions, ToastProps, UNSTABLE_ToastQueue as ToastQueue, UNSTABLE_ToastRegion as ToastRegion, ToastRegionProps} from 'react-aria-components';
import {ToastList} from 'react-aria-components/src/Toast';
import './Toast.css';
import {flushSync} from 'react-dom';
import { mergeStyles } from '../style/runtime';

export type ToastPlacement = 'top' | 'top end' | 'bottom' | 'bottom end';
export interface SpectrumToastContainerProps extends Omit<ToastRegionProps<SpectrumToastValue>, 'queue' | 'children'> {
  placement?: ToastPlacement
}

export interface SpectrumToastOptions extends Omit<ToastOptions, 'priority'>, DOMProps {
  /** A label for the action button within the toast. */
  actionLabel?: string,
  /** Handler that is called when the action button is pressed. */
  onAction?: () => void,
  /** Whether the toast should automatically close when an action is performed. */
  shouldCloseOnAction?: boolean
}

export interface SpectrumToastValue extends DOMProps {
  children: string,
  variant: 'positive' | 'negative' | 'info' | 'neutral',
  actionLabel?: string,
  onAction?: () => void,
  shouldCloseOnAction?: boolean
}

// There is a single global toast queue instance for the whole app, initialized lazily.
let globalToastQueue: ToastQueue<SpectrumToastValue> | null = null;
function getGlobalToastQueue() {
  if (!globalToastQueue) {
    globalToastQueue = new ToastQueue({
      maxVisibleToasts: Infinity,
      wrapUpdate(fn, action) {
        document.startViewTransition({
          update: () => flushSync(fn),
          types: [`toast-${action}`]
        });
      }
    });
  }

  return globalToastQueue;
}

function addToast(children: string, variant: SpectrumToastValue['variant'], options: SpectrumToastOptions = {}) {
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
  let timeout = options.timeout && !options.onAction ? Math.max(options.timeout, 5000) : undefined;
  let queue = getGlobalToastQueue();
  let key = queue.add(value, {timeout, onClose: options.onClose});
  return () => queue.close(key);
}

type CloseFunction = () => void;

const SpectrumToastQueue = {
  /** Queues a neutral toast. */
  neutral(children: string, options: SpectrumToastOptions = {}): CloseFunction {
    return addToast(children, 'neutral', options);
  },
  /** Queues a positive toast. */
  positive(children: string, options: SpectrumToastOptions = {}): CloseFunction {
    return addToast(children, 'positive', options);
  },
  /** Queues a negative toast. */
  negative(children: string, options: SpectrumToastOptions = {}): CloseFunction {
    return addToast(children, 'negative', options);
  },
  /** Queues an informational toast. */
  info(children: string, options: SpectrumToastOptions = {}): CloseFunction {
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
  maxHeight: 'screen',
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

const toastFocusRing = style({
  ...focusRing(),
  outlineColor: {
    default: 'focus-ring',
    isExpanded: 'white'
  }
});

const toastStyle = style({
  display: 'flex',
  gap: 16,
  paddingStart: 16,
  paddingEnd: 8,
  paddingY: 12,
  borderRadius: 'lg',
  minHeight: 56,
  maxWidth: 336,
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
  }
});

const toastBody = style({
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
  width: 'fit'
});

export const ICONS = {
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
export function ToastContainer(props: SpectrumToastContainerProps) {
  let {
    placement = 'bottom'
  } = props;
  let queue = getGlobalToastQueue();
  let align = 'center';
  [placement, align = 'center'] = placement.split(' ');
  let regionRef = useRef(null);

  let [isExpanded, setExpanded] = useState(false);
  let ctx = useMemo(() => ({
    isExpanded,
    toggleExpanded() {
      if (!isExpanded && queue.visibleToasts.length <= 1) {
        return;
      }

      document.startViewTransition({
        update: () => flushSync(() => setExpanded(!isExpanded)),
        types: [isExpanded ? 'toast-collapse' : 'toast-expand']
      });
    }
  }), [isExpanded, setExpanded, queue]);

  useEffect(() => {
    return queue.subscribe(() => {
      if (queue.visibleToasts.length === 0 && isExpanded) {
        setExpanded(false);
      }
    });
  });

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
      <ToastContainerContext.Provider value={ctx}>
        {isExpanded && (
          // eslint-disable-next-line
          <div
            className={'toast-background' + style({position: 'fixed', inset: 0, backgroundColor: 'transparent-black-500'})}
            onClick={() => ctx.toggleExpanded()} />
        )}
        <ToastList
          style={({isHovered}) => {
            let origin = isHovered ? 95 : 55;
            return {
              perspective: 80,
              perspectiveOrigin: 'center ' + (placement === 'top' ? `calc(100% + ${origin}px)` : `${-origin}px`),
              transition: 'perspective-origin 400ms'
            }; 
          }}
          className={toastList({placement, align, isExpanded})}
          onClick={() => {
            if (!ctx.isExpanded) {
              ctx.toggleExpanded();
            }
          }}>
          {({toast}) => (
            <SpectrumToast toast={toast} queue={queue} placement={placement} align={align} />
          )}
        </ToastList>
        <div className={'toast-controls'} style={{display: isExpanded ? 'flex' : 'none', justifyContent: 'end', gap: 8, opacity: isExpanded ? 1 : 0}}>
          <ActionButton
            onPress={() => queue.clear()}>
            Clear all
          </ActionButton>
          <ActionButton
            onPress={() => {
              regionRef.current.focus();
              ctx.toggleExpanded();
            }}>
            Collapse
          </ActionButton>
        </div>
      </ToastContainerContext.Provider>
    </ToastRegion>
  );
}

// Exported for stories.
export function SpectrumToast(props: ToastProps<SpectrumToastValue>) {
  let {toast, queue, placement, align} = props;
  let variant = toast.content.variant || 'info';
  let Icon = ICONS[variant];
  let visibleToasts = queue?.visibleToasts || [];
  let index = visibleToasts.indexOf(toast);
  let isLast = index === 0;
  let ctx = useContext(ToastContainerContext)!;
  let toastRef = useRef(null);

  if (!isLast && !ctx.isExpanded) {
    return (
      <div 
        style={{
          position: isLast ? undefined : 'absolute',
          [placement === 'top' ? 'bottom' : 'top']: !isLast ? 0 : undefined,
          left: !isLast ? 0 : undefined,
          translate: '0 0 ' + (-12 * index) + 'px',
          width: isLast ? undefined : '100%',
          height: isLast ? undefined : 0,
          opacity: index >= 3 ? 0 : 1,
          zIndex: visibleToasts.length - index - 1,
          viewTransitionName: toast.key,
          viewTransitionClass: 'toast ' + (isLast ? ' last' : '') + ' ' + placement + ' ' + align
        }}
        className={toastStyle({variant: toast.content.variant || 'info', index, isExpanded: ctx.isExpanded})} />
    );
  }

  return (
    <Toast
      ref={toastRef}
      toast={toast}
      style={{
        zIndex: visibleToasts.length - index - 1,
        viewTransitionName: toast.key,
        viewTransitionClass: 'toast ' + (isLast ? ' last' : '') + ' ' + placement + ' ' + align
      }}
      inert={!isLast && !ctx.isExpanded ? 'true' : undefined}
      className={renderProps => mergeStyles(toastFocusRing({...renderProps, isExpanded: ctx.isExpanded}), toastStyle({
        variant: toast.content.variant || 'info',
        index,
        isExpanded: ctx.isExpanded
      }))}>
      <div role="presentation" className={toastBody({isSingle: !isLast || queue.visibleToasts.length === 1 || ctx.isExpanded})}>
        <ToastContent className={toastContent + (isLast ? ' toast-content' : null)} style={{opacity: isLast || ctx.isExpanded ? 1 : 0}}>
          {Icon &&
            <CenterBaseline>
              <Icon />
            </CenterBaseline>
          }
          <Text slot="title">{toast.content.children}</Text>
        </ToastContent>
        {isLast && queue.visibleToasts.length > 1 && !ctx.isExpanded &&
          <ActionButton
            variant="secondary"
            isQuiet
            staticColor="white"
            styles={style({gridArea: 'expand'})}
            UNSAFE_style={{marginInlineStart: variant === 'neutral' ? -10 : 14}}
            UNSAFE_className={isLast ? 'toast-expand' : undefined}
            onPress={() => {
              toastRef.current.focus();
              ctx.toggleExpanded();
            }}>
            <Text>Show all</Text>
            <Chevron UNSAFE_style={{rotate: placement === 'bottom' ? '180deg' : undefined}} />
          </ActionButton>
        }
        {toast.content.actionLabel && (isLast || ctx.isExpanded) &&
          <Button
            variant="secondary"
            fillStyle="outline"
            staticColor="white"
            onPress={toast.content.onAction}
            UNSAFE_className={isLast ? 'toast-action' : undefined}
            styles={style({marginStart: 'auto', gridArea: 'action'})}>
            {toast.content.actionLabel}
          </Button>
        }
      </div>
      <CloseButton
        staticColor="white"
        UNSAFE_style={{opacity: (isLast || ctx.isExpanded) ? 1 : 0}}
        UNSAFE_className={isLast ? 'toast-close' : undefined} />
    </Toast>
  );
}
