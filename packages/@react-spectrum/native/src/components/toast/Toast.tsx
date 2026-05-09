import React, {useEffect, useRef, useState} from 'react';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type ToastVariant = 'neutral' | 'info' | 'positive' | 'negative';

export interface ToastOptions {
  actionLabel?: string;
  duration?: number;
  onAction?: () => void;
  onClose?: () => void;
  shouldCloseOnAction?: boolean;
}

export interface ToastEntry extends ToastOptions {
  id: number;
  message: string;
  variant: ToastVariant;
}

type Listener = (entries: ToastEntry[]) => void;

const DEFAULT_DURATION = 5000;

class ToastQueueManager {
  #entries: ToastEntry[] = [];
  #listeners = new Set<Listener>();
  #nextId = 1;

  subscribe(listener: Listener) {
    this.#listeners.add(listener);
    listener(this.#entries);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  add(message: string, variant: ToastVariant, options: ToastOptions = {}) {
    let id = this.#nextId++;
    let entry: ToastEntry = {id, message, variant, ...options};
    this.#entries = [...this.#entries, entry];
    this.#emit();
    return id;
  }

  remove(id: number) {
    let entry = this.#entries.find(e => e.id === id);
    this.#entries = this.#entries.filter(e => e.id !== id);
    entry?.onClose?.();
    this.#emit();
  }

  clear() {
    this.#entries = [];
    this.#emit();
  }

  #emit() {
    for (let listener of this.#listeners) {
      listener(this.#entries);
    }
  }
}

const queue = new ToastQueueManager();

export const ToastQueue = {
  neutral: (message: string, options?: ToastOptions) => queue.add(message, 'neutral', options),
  info: (message: string, options?: ToastOptions) => queue.add(message, 'info', options),
  positive: (message: string, options?: ToastOptions) => queue.add(message, 'positive', options),
  negative: (message: string, options?: ToastOptions) => queue.add(message, 'negative', options),
  remove: (id: number) => queue.remove(id),
  clear: () => queue.clear()
};

const variantContainerClass: Record<ToastVariant, string> = {
  info: 'bg-informative',
  negative: 'bg-negative',
  neutral: 'bg-textMuted',
  positive: 'bg-positive'
};

const variantTextClass: Record<ToastVariant, string> = {
  info: 'text-white',
  negative: 'text-white',
  neutral: 'text-white',
  positive: 'text-white'
};

function ToastView({entry}: {entry: ToastEntry}) {
  let timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  let duration = entry.duration ?? DEFAULT_DURATION;

  useEffect(() => {
    if (duration <= 0) {
      return;
    }
    timer.current = setTimeout(() => queue.remove(entry.id), duration);
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [duration, entry.id]);

  let handleAction = () => {
    entry.onAction?.();
    if (entry.shouldCloseOnAction !== false) {
      queue.remove(entry.id);
    }
  };

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className={cn(
        'mt-200 flex-row items-center gap-300 rounded-md px-300 py-200 shadow-md',
        variantContainerClass[entry.variant]
      )}>
      <Text className={cn('flex-1 text-200', variantTextClass[entry.variant])}>
        {entry.message}
      </Text>
      {entry.actionLabel ? (
        <Pressable
          accessibilityRole="button"
          className="px-200 py-100"
          onPress={handleAction}>
          <Text className={cn('text-200 font-medium underline', variantTextClass[entry.variant])}>
            {entry.actionLabel}
          </Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
        className="px-200 py-100"
        onPress={() => queue.remove(entry.id)}>
        <Text className={cn('text-200 font-bold', variantTextClass[entry.variant])}>×</Text>
      </Pressable>
    </View>
  );
}

export interface ToastContainerProps {
  className?: string;
  position?: 'top' | 'bottom';
}

export function ToastContainer({className, position = 'bottom'}: ToastContainerProps) {
  let [entries, setEntries] = useState<ToastEntry[]>([]);

  useEffect(() => queue.subscribe(setEntries), []);

  if (entries.length === 0) {
    return null;
  }

  return (
    <View
      className={cn(
        'absolute left-300 right-300',
        position === 'top' ? 'top-600' : 'bottom-600',
        className
      )}
      pointerEvents="box-none">
      {entries.map(entry => (
        <ToastView entry={entry} key={entry.id} />
      ))}
    </View>
  );
}

export const Toast = ToastView;
