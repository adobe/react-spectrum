import type {EventMapType} from '@react-types/shared';

export const getOwnerDocument = (el: Element | null | undefined): Document => {
  return el?.ownerDocument ?? document;
};

export const getOwnerWindow = (
  el: (Window & typeof globalThis) | Element | null | undefined
): Window & typeof globalThis => {
  if (el && 'window' in el && el.window === el) {
    return el;
  }

  const doc = getOwnerDocument(el as Element | null | undefined);
  return doc.defaultView || window;
};

/**
 * Type guard that checks if a value is a Node. Verifies the presence and type of the nodeType
 * property.
 */
function isNode(value: unknown): value is Node {
  return (
    value !== null &&
    typeof value === 'object' &&
    'nodeType' in value &&
    typeof (value as Node).nodeType === 'number'
  );
}
/**
 * Type guard that checks if a node is a ShadowRoot. Uses nodeType and host property checks to
 * distinguish ShadowRoot from other DocumentFragments.
 */
export function isShadowRoot(node: Node | null): node is ShadowRoot {
  return isNode(node) && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && 'host' in node;
}

/**
 * Attaches an event listener on target(s) and returns a cleanup function.
 *
 * Some events are `composed: false` and do not propagate out of shadow roots,
 * even in the capture phase. For those, a listener on `window`/`document` alone
 * will miss events that fire inside a shadow root. Pass the array from
 * `getPropagationTargets(global, refNode)`
 * (react-aria/private/utils/shadowdom/DOMFunctions) as `target` so the listener
 * is attached to the global target *and* every enclosing shadow root.
 *
 * Known `composed: false` events (non-exhaustive):
 *
 * - `scroll`
 * - `scrollend`
 * - `change`
 * - `submit`
 * - `reset`
 * - `select`
 * - `selectstart`
 * - `slotchange`
 */
export function addEvent<T extends EventTarget, K extends keyof EventMapType<Exclude<T, null>>>(
  target: T | EventTarget[] | null,
  event: Extract<K, string> | (string & {}),
  listener?: (this: T, ev: EventMapType<Exclude<T, null>>[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  if (listener == null || target == null) {
    return () => {};
  }

  let eventTargets = Array.isArray(target) ? target : [target];

  for (let eventTarget of eventTargets) {
    eventTarget.addEventListener(event, listener as EventListener, options);
  }

  return () => {
    for (let eventTarget of eventTargets) {
      eventTarget.removeEventListener(event, listener as EventListener, options);
    }
  };
}
