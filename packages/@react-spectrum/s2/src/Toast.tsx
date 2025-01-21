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

import AlertIcon from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import {Button} from './Button';
import {CenterBaseline} from './CenterBaseline';
import CheckmarkIcon from '../s2wf-icons/S2_Icon_CheckmarkCircle_20_N.svg';
import {CloseButton} from './CloseButton';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import InfoIcon from '../s2wf-icons/S2_Icon_InfoCircle_20_N.svg';
import {style} from '../style' with {type: 'macro'};
import {Text} from './Content';
import {Toast, ToastContent, ToastOptions, ToastProps, ToastQueue, ToastRegion, ToastRegionProps} from 'react-aria-components';
import { global, raw } from '../style/style-macro' with {type: 'macro'};
import { useState } from 'react';
import { ActionButton } from './ActionButton';
import { ToastList } from 'react-aria-components/src/Toast';
import { useToastQueue } from '@react-stately/toast';

export type ToastPlacement = 'top' | 'top end' | 'bottom' | 'bottom end';
export interface SpectrumToastContainerProps extends Omit<ToastRegionProps<SpectrumToastValue>, 'toastQueue' | 'children'> {
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
      maxVisibleToasts: 3
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
  let key = document.startViewTransition({
    update: () => queue.add(value, {timeout, onClose: options.onClose}),
    types: ['toast-add']
  });
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
  display: 'flex',
  flexDirection: {
    placement: {
      top: 'column-reverse',
      bottom: 'column'
    }
  },
  gap: 8,
  position: 'fixed',
  insetX: 16,
  width: 'fit',
  top: {
    placement: {
      top: 0
    }
  },
  bottom: {
    placement: {
      bottom: 0
    }
  },
  marginStart: {
    align: {
      start: 0,
      center: 'auto',
      end: 'auto'
    }
  },
  marginEnd: {
    align: {
      start: 'auto',
      center: 'auto',
      end: 0
    }
  },
  boxSizing: 'border-box',
  maxHeight: '[100vh]',
  paddingTop: 8
});

const toastList = style({
  flexGrow: 1,
  display: 'flex',
  gap: 8,
  flexDirection: {
    placement: {
      top: 'column-reverse',
      bottom: 'column'
    }
  },
  margin: 0,
  padding: 0,
  paddingBottom: 16,
  boxSizing: 'border-box',
  overflow: {
    isExpanded: 'auto'
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
  boxShadow: 'elevated'
});

const toastBody = style({
  display: 'flex',
  flexGrow: 1,
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: 24,
  rowGap: 8
});

const toastContent = style({
  display: 'flex',
  gap: 8,
  alignItems: 'baseline'
});

export const ICONS = {
  info: InfoIcon,
  negative: AlertIcon,
  positive: CheckmarkIcon
};

/**
 * A ToastContainer renders the queued toasts in an application. It should be placed
 * at the root of the app.
 */
export function ToastContainer(props: SpectrumToastContainerProps) {
  let {
    placement = 'bottom'
  } = props;
  let queue = getGlobalToastQueue();
  useToastQueue(queue);
  let align = 'center';
  [placement, align = 'center'] = placement.split(' ');
  let [maxToasts, setMaxToasts] = useState(0);

  if (queue.queue.length > maxToasts) {
    setMaxToasts(queue.queue.length);
  }

  return (
    <ToastRegion
      {...props}
      toastQueue={queue}
      className={renderProps => toastRegion({
        ...renderProps,
        placement,
        align,
        isExpanded: queue.isExpanded
      })}>
      <style>
        {`::view-transition { --count: ${queue.queue.length} }`}
        {Array.from(Array(maxToasts).keys()).map(i => `::view-transition-group(.toast-${i}){--index:${i};z-index:${i}}`).join('')}
      </style>
      {/* {!queue.isExpanded && <div style={{position: 'absolute', viewTransitionName: 'toast-grad', insetBlock: -100, insetInline: -200, backgroundImage: 'radial-gradient(farthest-side, var(--s2-container-bg) 50%, transparent)'}} />} */}
      {queue.isExpanded && <div style={{viewTransitionName: 'toast-background'}} className={style({position: 'fixed', inset: 0, backgroundColor: 'transparent-black-500'})} />}
      {queue?.queue.length > 1 && 
        <div style={{display: 'flex', justifyContent: 'end', gap: 8, viewTransitionName: 'toast-button'}}>
          <ActionButton
            size="S"
            onPress={() => document.startViewTransition({
              update: () => queue.clear(),
              types: [queue.isExpanded ? 'toast-clear-expanded' : 'toast-clear']
            })}>
            Clear all
          </ActionButton>
          <ActionButton
            size="S"
            onPress={async () => {
              let transition = document.startViewTransition({
                update: () => queue.toggleExpandedState(),
                types: [queue.isExpanded ? 'toast-collapse' : 'toast-expand']
              });

              await transition.finished;
            }}>
            {queue.isExpanded ? 'Collapse' : `Show all (${queue.queue.length})`}
          </ActionButton>
        </div>
      }
      <ToastList
        style={{
          [placement === 'top' ? 'paddingBottom' : 'paddingTop']: queue.isExpanded ? 0 : (queue.visibleToasts.length - 1) * 12
        }}
        className={toastList({placement, align, isExpanded: queue.isExpanded})}>
        {({toast}) => (
          <SpectrumToast toast={toast} queue={queue} placement={placement} align={align} />
        )}
      </ToastList>
    </ToastRegion>
  );
}

// Exported for stories.
export function SpectrumToast(props: ToastProps<SpectrumToastValue>) {
  let {toast, queue, placement, align} = props;
  let variant = toast.content.variant || 'info';
  let Icon = ICONS[variant];
  let visibleToasts = queue?.visibleToasts || [];
  let globalIndex = queue.queue.indexOf(toast);
  let index = visibleToasts.indexOf(toast);
  let isLast = index === visibleToasts.length - 1;
  let s = queue.isExpanded ? {} : {
    scale: 100 - (visibleToasts.length - index - 1) * 10 + '%',
    position: isLast ? undefined : 'absolute',
    translate: '0 ' + ((placement === 'top' ? -12 : 12) * (index - visibleToasts.length + 1)) + 'px',
    transformOrigin: (placement === 'top' ? 'bottom' : 'top') + ' center',
    width: isLast ? undefined : '100%',
    height: isLast ? undefined : 0,
  };
  return (
    <Toast
      toast={toast}
      style={{
        ...s,
        zIndex: globalIndex,
        viewTransitionName: '_' + toast.key.slice(2),
        viewTransitionClass: 'toast toast-' + globalIndex + (index === 0 ? ' first' : '') + (isLast ? ' last' : '') + ' ' + placement + ' ' + align
      }}
      inert={!isLast && !queue.isExpanded ? 'true' : undefined}
      className={renderProps => toastStyle({
        ...renderProps,
        variant: toast.content.variant || 'info',
        index
      })}>
      <div role="presentation" className={toastBody}>
        <ToastContent className={toastContent} style={{opacity: isLast || queue.isExpanded ? 1 : 0}}>
          {Icon &&
            <CenterBaseline>
              <Icon />
            </CenterBaseline>
          }
          <Text slot="title">{toast.content.children}</Text>
        </ToastContent>
        {toast.content.actionLabel && (isLast || queue.isExpanded) &&
          <Button
            variant="secondary"
            fillStyle="outline"
            staticColor="white"
            onPress={toast.content.onAction}
            styles={style({marginStart: 'auto'})}>
            {toast.content.actionLabel}
          </Button>
        }
      </div>
      <CloseButton staticColor="white" isDisabled={!isLast && !queue.isExpanded} />
    </Toast>
  );
}

global(`
@keyframes slide-in {
  from {
    translate: var(--slideX) var(--slideY);
    opacity: 0;
  }
}

@keyframes slide-out {
  to {
    translate: var(--slideX) var(--slideY);
    opacity: 0;
  }
}

@keyframes scale-in {
  from {
    scale: 90%;
    translate: 0 var(--translateY);
    opacity: 0;
  }
}

@keyframes scale-back {
  to {
    scale: 90%;
    translate: 0 var(--translateY);
    opacity: 0;
  }
}

@keyframes expand {
  from {
    translate: 0 calc(((var(--count) - var(--index) - 1) * 56px - 12px) * var(--dir));
    scale: calc(100% - (var(--count) - var(--index)) * 10%);
    opacity: 0;
  }
}

@keyframes collapse {
  to {
    translate: 0 calc(((var(--count) - var(--index) - 1) * 56px - 12px) * var(--dir));
    scale: calc(100% - (var(--count) - var(--index)) * 10%);
    opacity: 0;
  }
}

@keyframes fade-out {
  to {
    opacity: 0
  }
}

:root:active-view-transition-type(toast-add, toast-expand, toast-collapse, toast-clear, toast-clear-expanded) {
  view-transition-name: none;
}

::view-transition-group(toast-button) {
  z-index: 9999;
}

::view-transition-group(.toast),
::view-transition-group(toast-button) {
  animation-duration: 400ms;
}

::view-transition-group(.toast.bottom) {
  --slideX: 0;
  --slideY: calc(100% + 12px);
  --dir: 1;
  --translateY: -12px;
}

::view-transition-group(.toast.top) {
  --slideX: 0;
  --slideY: calc(-100% - 12px);
  --dir: -1;
  --translateY: 12px;
}

::view-transition-group(.toast.start) {
  --slideX: calc(-100% - 12px);
  --slideY: 0;
}

::view-transition-group(.toast.end) {
  --slideX: calc(100% + 12px);
  --slideY: 0;
}

html:active-view-transition-type(toast-add, toast-remove) {
  &::view-transition-new(.toast.first):only-child {
    animation-name: scale-in;
  }

  &::view-transition-new(.toast.last):only-child {
    animation-name: slide-in;
  }

  &::view-transition-old(.toast):only-child {
    animation-name: scale-back;
  }

  &::view-transition-old(.toast.last):only-child {
    animation-name: slide-out;
  }
}

html:active-view-transition-type(toast-expand, toast-collapse) {
  &::view-transition-group(toast-grad) {
    z-index: -2;
  }

  &::view-transition-group(toast-background) {
    z-index: -1;
    animation-duration: 400ms;
  }
}

html:active-view-transition-type(toast-expand) {
  &::view-transition-new(.toast):only-child {
    transform-origin: top;
    animation-name: expand;
  }
}
 
html:active-view-transition-type(toast-collapse) {
  &::view-transition-old(.toast):only-child {
    transform-origin: top;
    animation-name: collapse;
  }
}

html:active-view-transition-type(toast-clear) {
  &::view-transition-new(.toast),
  &::view-transition-old(.toast) {
    animation-name: slide-out;
  }
}

html:active-view-transition-type(toast-clear-expanded) {
  &::view-transition-new(.toast),
  &::view-transition-old(.toast) {
    animation-name: fade-out;
  }
}
`);

// viewTransition({
//   animationName: {
//     entering: {
//       isFirst: 'scale-in',
//       isLast: 'slide-in',
//       ':active-view-transition-type(toast-expand)': 'expand'
//     },
//     exiting: {
//       default: 'scale-back',
//       isLast: 'slide-out',
//       ':active-view-transition-type(toast-collapse': 'collapse'
//     },
//     ':active-view-transition-type(toast-clear)': 'slide-out',
//     ':active-view-transition-type(toast-clear-expanded)': 'fade-out'
//   },
//   '--slideX': {
//     type: 'translateX',
//     value: {
//       align: {
//         start: 'calc(-100% - 12px)',
//         end: 'calc(100% + 12px)'
//       }
//     }
//   },
//   '--slideY': {
//     type: 'translateY',
//     value: {
//       placement: {
//         top: 'calc(-100% - 12px)',
//         bottom: 'calc(100% + 12px)'
//       }
//     }
//   },
//   '--translateY': {
//     type: 'translateY',
//     value: {
//       placement: {
//         top: 12,
//         bottom: -12
//       }
//     }
//   }
// });
