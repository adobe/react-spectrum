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

import {useCallback, useMemo} from 'react';
import {useSyncExternalStore} from 'use-sync-external-store/shim';

export interface ToastStateProps {
  maxVisibleToasts?: number,
  hasExitAnimation?: boolean
}

export interface ToastOptions {
  onClose?: () => void,
  timeout?: number,
  priority?: number
}

export interface QueuedToast<T> extends ToastOptions {
  content: T,
  key: string,
  timer?: Timer,
  animation?: 'entering' | 'queued' | 'exiting'
}

export interface ToastState<T> {
  add(content: T, options?: ToastOptions): string,
  close(key: string): void,
  remove(key: string): void,
  pauseAll(): void,
  resumeAll(): void,
  toasts: QueuedToast<T>[]
}

export function useToastState<T>(props: ToastStateProps = {}): ToastState<T> {
  let {maxVisibleToasts = 1, hasExitAnimation = false} = props;
  let queue = useMemo(() => new ToastQueue<T>({maxVisibleToasts, hasExitAnimation}), [maxVisibleToasts, hasExitAnimation]);
  return useToastQueue(queue);
}

export function useToastQueue<T>(queue: ToastQueue<T>): ToastState<T> {
  let subscribe = useCallback(fn => queue.subscribe(fn), [queue]);
  let getSnapshot = useCallback(() => queue.visibleToasts, [queue]);
  let visibleToasts = useSyncExternalStore(subscribe, getSnapshot);

  return {
    toasts: visibleToasts,
    add: (content, options) => queue.add(content, options),
    close: key => queue.remove(key),
    remove: key => queue.exit(key),
    pauseAll: () => queue.pauseAll(),
    resumeAll: () => queue.resumeAll()
  };
}

export class ToastQueue<T> {
  private queue: QueuedToast<T>[] = [];
  private subscriptions: Set<() => void> = new Set();
  maxVisibleToasts: number;
  hasExitAnimation: boolean;
  visibleToasts: QueuedToast<T>[] = [];

  constructor(options?: ToastStateProps) {
    this.maxVisibleToasts = options?.maxVisibleToasts ?? 1;
    this.hasExitAnimation = options?.hasExitAnimation ?? false;
  }

  subscribe(fn: () => void) {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }

  add(content: T, options: ToastOptions = {}) {
    let toastKey = Math.random().toString(36);
    let toast: QueuedToast<T> = {
      ...options,
      content,
      key: toastKey,
      timer: options.timeout ? new Timer(() => this.remove(toastKey), options.timeout) : null
    };

    let low = 0;
    let high = this.queue.length;
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if ((toast.priority || 0) > (this.queue[mid].priority || 0)) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    this.queue.splice(low, 0, toast);

    toast.animation = low < this.maxVisibleToasts ? 'entering' : 'queued';
    let i = this.maxVisibleToasts;
    while (i < this.queue.length) {
      this.queue[i++].animation = 'queued';
    }

    this.updateVisibleToasts();
    return toastKey;
  }

  remove(key: string) {
    let index = this.queue.findIndex(t => t.key === key);
    if (index >= 0) {
      this.queue[index].onClose?.();
      this.queue.splice(index, 1);
    }

    this.updateVisibleToasts();
  }

  exit(key: string) {
    this.visibleToasts = this.visibleToasts.filter(t => t.key !== key);
    this.updateVisibleToasts();
  }

  private updateVisibleToasts() {
    let toasts = this.queue.slice(0, this.maxVisibleToasts);
    if (this.hasExitAnimation) {
      let prevToasts: QueuedToast<T>[] = this.visibleToasts
        .filter(t => !toasts.some(t2 => t.key === t2.key))
        .map(t => ({...t, animation: 'exiting'}));

      this.visibleToasts = prevToasts.concat(toasts).sort((a, b) => b.priority - a.priority);
    } else {
      this.visibleToasts = toasts;
    }

    for (let fn of this.subscriptions) {
      fn();
    }
  }

  pauseAll() {
    for (let toast of this.visibleToasts) {
      if (toast.timer) {
        toast.timer.pause();
      }
    }
  }

  resumeAll() {
    for (let toast of this.visibleToasts) {
      if (toast.timer) {
        toast.timer.resume();
      }
    }
  }
}

class Timer {
  private timerId;
  private startTime: number;
  private remaining: number;
  private callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.remaining = delay;
    this.callback = callback;
  }

  reset(delay: number) {
    this.remaining = delay;
    this.resume();
  }

  pause() {
    if (this.timerId == null) {
      return;
    }

    clearTimeout(this.timerId);
    this.timerId = null;
    this.remaining -= Date.now() - this.startTime;
  }

  resume() {
    if (this.remaining <= 0) {
      return;
    }

    this.startTime = Date.now();
    this.timerId = setTimeout(() => {
      this.timerId = null;
      this.remaining = 0;
      this.callback();
    }, this.remaining);
  }
}
