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
import Chevron from '../s2wf-icons/S2_Icon_ChevronDownSize300_20_N.svg';
import {CloseButton} from './CloseButton';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {focusRing, style} from '../style' with {type: 'macro'};
import InfoIcon from '../s2wf-icons/S2_Icon_InfoCircle_20_N.svg';
import {Text} from './Content';
import {Toast, ToastContent, ToastOptions, ToastProps, ToastQueue, ToastRegion, ToastRegionProps} from 'react-aria-components';
import {ToastList} from 'react-aria-components/src/Toast';
import {useToastQueue} from '@react-stately/toast';
import './Toast.css';

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
      maxVisibleToasts: Infinity
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
  ...focusRing(),
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
  paddingTop: 8,
  borderRadius: 'lg',
  '--origin': {
    type: 'top',
    value: {
      default: '[55px]',
      isHovered: '[95px]'
    }
  }
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
  ...focusRing(),
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
  cursor: 'default'
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
      {/* {!queue.isExpanded && <div style={{position: 'absolute', viewTransitionName: 'toast-grad', insetBlock: -100, insetInline: -200, backgroundImage: 'radial-gradient(farthest-side, var(--s2-container-bg) 50%, transparent)'}} />} */}
      {queue.isExpanded && <div style={{viewTransitionName: 'toast-background'}} className={style({position: 'fixed', inset: 0, backgroundColor: 'transparent-black-500'})} />}
      {queue.isExpanded && 
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
            onPress={() => {
              document.startViewTransition({
                update: () => queue.toggleExpandedState(),
                types: [queue.isExpanded ? 'toast-collapse' : 'toast-expand']
              });
            }}>
            {queue.isExpanded ? 'Collapse' : `Show all (${queue.visibleToasts.length})`}
          </ActionButton>
        </div>
      }
      {/* {queue?.visibleToasts.length > 1 && !queue.isExpanded &&
        <div
          style={{position: 'absolute', top: 0, width: '100%', height: 32, zIndex: 9999}}
          role="button"
          tabIndex={0}
          onClick={() => {
            document.startViewTransition({
              update: () => queue.toggleExpandedState(),
              types: [queue.isExpanded ? 'toast-collapse' : 'toast-expand']
            })
          }} />
      } */}
      <ToastList
        style={{
          [placement === 'top' ? 'paddingBottom' : 'paddingTop']: queue.isExpanded ? 0 : (Math.min(3, queue.visibleToasts.length) - 1) * 12,
          perspective: 80,
          perspectiveOrigin: 'center ' + (placement === 'top' ? 'calc(100% + var(--origin)' : 'calc(-1 * var(--origin)'),
          transition: 'perspective-origin 400ms'
        }}
        className={toastList({placement, align, isExpanded: queue.isExpanded})}
        onClick={() => {
          if (!queue.isExpanded) {
            document.startViewTransition({
              update: () => queue.toggleExpandedState(),
              types: [queue.isExpanded ? 'toast-collapse' : 'toast-expand']
            });
          }
        }}>
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
    position: isLast ? undefined : 'absolute',
    translate: '0 0 ' + (12 * (index - visibleToasts.length + 1)) + 'px',
    width: isLast ? undefined : '100%',
    height: isLast ? undefined : 0,
    opacity: index < visibleToasts.length - 3 ? 0 : 1
  };
  return (
    <Toast
      toast={toast}
      style={{
        ...s,
        zIndex: globalIndex,
        viewTransitionName: '_' + toast.key.slice(2),
        viewTransitionClass: 'toast ' + (isLast ? ' last' : '') + ' ' + placement + ' ' + align
      }}
      inert={!isLast && !queue.isExpanded ? 'true' : undefined}
      className={renderProps => toastStyle({
        ...renderProps,
        variant: toast.content.variant || 'info',
        index
      })}>
      <div role="presentation" className={toastBody({isSingle: !isLast || queue.visibleToasts.length === 1})}>
        <ToastContent className={toastContent} style={{opacity: isLast || queue.isExpanded ? 1 : 0}}>
          {Icon &&
            <CenterBaseline>
              <Icon />
            </CenterBaseline>
          }
          <Text slot="title">{toast.content.children}</Text>
        </ToastContent>
        {isLast && queue.visibleToasts.length > 1 &&
          <ActionButton
            size="XS"
            variant="secondary"
            isQuiet
            staticColor="white"
            styles={style({gridArea: 'expand'})}
            UNSAFE_style={{visibility: queue.isExpanded ? 'hidden' : 'visible'}}
            onPress={() => document.startViewTransition({
              update: () => queue.toggleExpandedState(),
              types: [queue.isExpanded ? 'toast-collapse' : 'toast-expand']
            })}>
            <Text UNSAFE_style={{order: -1}}>Show all</Text>
            <Chevron UNSAFE_style={{rotate: '180deg'}} />
          </ActionButton>
        }
        {toast.content.actionLabel && (isLast || queue.isExpanded) &&
          <Button
            variant="secondary"
            fillStyle="outline"
            staticColor="white"
            onPress={toast.content.onAction}
            styles={style({marginStart: 'auto', gridArea: 'action'})}>
            {toast.content.actionLabel}
          </Button>
        }
      </div>
      <CloseButton staticColor="white" isDisabled={!isLast && !queue.isExpanded} />
    </Toast>
  );
}

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
