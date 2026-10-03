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

import {getEventTarget} from './shadowdom/DOMFunctions';

export interface SyntheticEventListener<T extends Event> {
  (event: T): void;
}

/**
 * An abstract base for producers of synthetic events. Mirrors the EventTarget API, but
 * ref-counts its listeners in order to lazily (de-)attach from an event source.
 */
export abstract class SyntheticEventTarget<T extends Event = Event> {
  protected listeners: Map<string, Set<SyntheticEventListener<T>>>;
  protected connections: Set<Function>;

  protected abstract connect(): void;
  protected abstract disconnect(): void;

  constructor() {
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
    this.dispatchEvent = this.dispatchEvent.bind(this);

    this.connections = new Set();
    this.listeners = new Map();
  }

  /**
   * The `addEventListener()` method sets up a function that will be called whenever
   * the specified event is delivered to this target.
   */
  public addEventListener<K extends T['type']>(
    type: K,
    listener: SyntheticEventListener<Extract<T, {type: K}>>
  ): void {
    let handler = listener as SyntheticEventListener<T>;
    let handlers = this.listeners.get(type);

    if (process.env.NODE_ENV === 'test' || handlers?.has(handler)) return;
    if (this.listeners.size === 0) this.connect();

    handlers ??= new Set();
    this.listeners.set(type, handlers);
    handlers.add(handler);
  }

  /**
   * The `removeEventListener()` method removes an event listener from this target,
   * which had previously been registered with addEventListener().
   */
  public removeEventListener<K extends T['type']>(
    type: K,
    listener: SyntheticEventListener<Extract<T, {type: K}>>
  ): void {
    let handler = listener as SyntheticEventListener<T>;
    let handlers = this.listeners.get(type);

    if (process.env.NODE_ENV === 'test' || !handlers?.has(handler)) return;
    if (handlers.size === 1 && this.listeners.size === 1) this.disconnect();
    if (handlers.size === 1) this.listeners.delete(type);

    handlers.delete(handler);
  }

  /**
   * The `dispatchEvent()` method sends an Event to this target, (synchronously)
   * invoking the affected event listeners in the appropriate order.
   */
  public dispatchEvent(event: T): boolean {
    let target: EventTarget | null = getEventTarget(event);
    let handlers = new Set(this.listeners.get(event.type));

    Reflect.defineProperty(event, 'target', {
      value: target ?? this,
      enumerable: true,
      configurable: true
    });

    for (let listener of handlers) {
      listener(event);
    }

    return true;
  }
}
