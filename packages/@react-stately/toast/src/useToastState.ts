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

import {useMemo, useState} from 'react';

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
  let {maxVisibleToasts = 1, hasExitAnimation} = props;
  let queue = useMemo(() => new ToastQueue<T>(maxVisibleToasts), [maxVisibleToasts]);
  let [visibleToasts, setVisibleToasts] = useState<QueuedToast<T>[]>([]);

  let setCurrentToasts = (toasts: QueuedToast<T>[]) => {
    setVisibleToasts(visibleToasts => {
      if (hasExitAnimation) {
        let prevToasts: QueuedToast<T>[] = visibleToasts
          .filter(t => !toasts.some(t2 => t.key === t2.key))
          .map(t => ({...t, animation: 'exiting'}));

        return prevToasts.concat(toasts).sort((a, b) => b.priority - a.priority);
      } else {
        return toasts;
      }
    });
  };

  const add = (content: T, options: ToastOptions = {}) => {
    let toastKey = Math.random().toString(36);
    let timer = options.timeout ? new Timer(() => close(toastKey), options.timeout) : null;

    queue.add({content, key: toastKey, timer, ...options});
    setCurrentToasts(queue.getVisibleToasts());
    return toastKey;
  };

  const close = (toastKey: string) => {
    queue.remove(toastKey);
    setCurrentToasts(queue.getVisibleToasts());
  };

  let remove = (toastKey: string) => {
    setVisibleToasts(visibleToasts => visibleToasts.filter(t => t.key !== toastKey));
  };

  return {
    add,
    close,
    remove,
    toasts: visibleToasts,
    pauseAll: () => {
      for (let toast of visibleToasts) {
        if (toast.timer) {
          toast.timer.pause();
        }
      }
    },
    resumeAll: () => {
      for (let toast of visibleToasts) {
        if (toast.timer) {
          toast.timer.resume();
        }
      }
    }
  };
}

class ToastQueue<T> {
  queue: QueuedToast<T>[] = [];
  maxVisibleToasts: number;

  constructor(maxVisibleToasts: number) {
    this.maxVisibleToasts = maxVisibleToasts;
  }

  add(toast: QueuedToast<T>) {
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

    return low;
  }

  remove(key: string) {
    let index = this.queue.findIndex(t => t.key === key);
    if (index >= 0) {
      this.queue[index].onClose?.();
      this.queue.splice(index, 1);
    }
  }

  getVisibleToasts(): QueuedToast<T>[] {
    return this.queue.slice(0, this.maxVisibleToasts);
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
