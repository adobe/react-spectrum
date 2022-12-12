/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, {ReactElement, ReactNode, useContext} from 'react';
import {SpectrumToastValue, Toast} from './Toast';
import {ToastContainer} from './ToastContainer';
import {ToastOptions, useToastState} from '@react-stately/toast';

export interface SpectrumToastOptions extends Omit<ToastOptions, 'priority'> {
  actionLabel?: ReactNode,
  onAction?: () => void,
  shouldCloseOnAction?: boolean
}

export interface ToastProviderContext {
  positive(content: ReactNode, options?: SpectrumToastOptions): void,
  negative(content: ReactNode, options?: SpectrumToastOptions): void,
  neutral(content: ReactNode, options?: SpectrumToastOptions): void,
  info(content: ReactNode, options?: SpectrumToastOptions): void
}

export interface ToastProviderProps {
  children: ReactNode
}

const ToastContext = React.createContext<ToastProviderContext | null>(null);

export function useToastProvider(): ToastProviderContext {
  return useContext(ToastContext);
}

export function ToastProvider(props: ToastProviderProps): ReactElement {
  // If there's already a ToastProvider above us in the React tree, don't render another one.
  let ctx = useToastProvider();
  if (ctx) {
    return <>{props.children}</>;
  }

  return <ToastProviderInner {...props} />;
}

function ToastProviderInner(props: ToastProviderProps) {
  let state = useToastState<SpectrumToastValue>({
    hasExitAnimation: true
  });

  let add = (children: ReactNode, variant: SpectrumToastValue['variant'], options: SpectrumToastOptions = {}) => {
    let value = {
      children,
      variant,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
      shouldCloseOnAction: options.shouldCloseOnAction
    };

    // Minimum time of 5s from https://spectrum.adobe.com/page/toast/#Auto-dismissible
    // Actionable toasts cannot be auto dismissed. That would fail WCAG SC 2.2.1.
    // It is debatable whether non-actionable toasts would also fail.
    let timeout = options.timeout && !options.onAction ? Math.max(options.timeout, 5000) : null;
    state.add(value, {priority: getPriority(variant, options), timeout, onClose: options.onClose});
  };

  // TODO: return a function to allow programmatically closing the toast?
  let contextValue = {
    neutral: (children: ReactNode, options: SpectrumToastOptions = {}) => {
      add(children, 'neutral', options);
    },
    positive: (children: ReactNode, options: SpectrumToastOptions = {}) => {
      add(children, 'positive', options);
    },
    negative: (children: ReactNode, options: SpectrumToastOptions = {}) => {
      add(children, 'negative', options);
    },
    info: (children: ReactNode, options: SpectrumToastOptions = {}) => {
      add(children, 'info', options);
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {props.children}
      {state.toasts.length > 0 &&
        <ToastContainer state={state}>
          {state.toasts.map((toast) => (
            <Toast
              key={toast.key}
              toast={toast}
              state={state} />
          ))}
        </ToastContainer>
      }
    </ToastContext.Provider>
  );
}

// https://spectrum.adobe.com/page/toast/#Priority-queue
// TODO: if a lower priority toast comes in, no way to know until you dismiss the higher priority one.
const VARIANT_PRIORITY = {
  negative: 10,
  positive: 3,
  info: 2,
  neutral: 1
};

function getPriority(variant: SpectrumToastValue['variant'], options: SpectrumToastOptions) {
  let priority = VARIANT_PRIORITY[variant] || 1;
  if (options.onAction) {
    priority += 4;
  }
  return priority;
}
