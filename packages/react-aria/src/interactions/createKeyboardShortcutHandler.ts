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

import {isMac} from '../utils/platform';
import {KeyboardEvent} from '@react-types/shared';

export type KeyboardShortcutAction = (e: KeyboardEvent) => (boolean | Partial<{shouldContinuePropagation?: boolean, shouldPreventDefault?: boolean}>);

/** Maps shortcut strings (e.g. `"Mod+s"`, `"Ctrl+Shift+a"`) to handlers. */
export type KeyboardShortcutBindings = Record<string, KeyboardShortcutAction>;

/** Modifier names in shortcut strings (case-insensitive). Order in the string does not matter. */
const MODIFIER_NAMES = new Set([
  'shift',
  'alt',
  'ctrl',
  'control',
  'meta',
  'mod', // OS dependent - Cmd on Mac, Ctrl on Windows/Linux
  'sel' // OS dependent - Alt on Mac, Ctrl on Windows/Linux
]);

/** Canonical modifier order for stable keys (sorted, fixed order). */
const CANONICAL_MODIFIER_ORDER = ['Alt', 'Ctrl', 'Meta', 'Shift'] as const;

export interface ParsedKeyboardShortcut {
  shift: boolean,
  alt: boolean,
  ctrl: boolean,
  meta: boolean,
  /** Platform primary: Cmd on Mac, Ctrl on Windows/Linux — expands to Meta or Ctrl in canonical form. */
  mod: boolean,
  /** Platform secondary: Alt on Mac, Ctrl on Windows/Linux. */
  sel: boolean,
  key: string
}

/**
 * Builds the set of canonical modifier tokens for a binding.
 * `Mod` contributes Meta (Mac) or Ctrl (non-Mac); explicit Ctrl/Meta add those keys too.
 */
export function modifierSetFromParsed(parsed: ParsedKeyboardShortcut): Set<string> {
  let set = new Set<string>();
  if (parsed.alt) {
    set.add('Alt');
  }
  if (parsed.shift) {
    set.add('Shift');
  }
  if (parsed.ctrl) {
    set.add('Ctrl');
  }
  if (parsed.meta) {
    set.add('Meta');
  }
  if (parsed.mod) {
    set.add(isMac() ? 'Meta' : 'Ctrl');
  }
  if (parsed.sel) { // Todo: I think there was a conflict or difference in behaviour in the original code based on this.
    set.add(isMac() ? 'Alt' : 'Ctrl');
  }
  return set;
}

/** Modifier set from a keydown event (native flags only). */
export function modifierSetFromEvent(e: KeyboardEvent): Set<string> {
  let set = new Set<string>();
  if (e.altKey) {
    set.add('Alt');
  }
  if (e.ctrlKey) {
    set.add('Ctrl');
  }
  if (e.metaKey) {
    set.add('Meta');
  }
  if (e.shiftKey) {
    set.add('Shift');
  }
  return set;
}

function sortedModifierTokens(set: Set<string>): string[] {
  return CANONICAL_MODIFIER_ORDER.filter(name => set.has(name));
}

/**
 * Parses a shortcut like `"Mod+Shift+z"`, `"Ctrl+Alt+Enter"`, or `"Escape"`.
 * Modifiers are case-insensitive; order does not matter. `control` is an alias for `ctrl`.
 */
export function parseKeyboardShortcut(spec: string): ParsedKeyboardShortcut {
  let parts = spec.split('+').reduce<ParsedKeyboardShortcut>((prev, part) => {
    let lower = part.toLowerCase();
    if (MODIFIER_NAMES.has(lower)) {
      if (lower === 'shift') {
        prev.shift = true;
      } else if (lower === 'alt') {
        prev.alt = true;
      } else if (lower === 'ctrl' || lower === 'control') {
        prev.ctrl = true;
      } else if (lower === 'meta') {
        prev.meta = true;
      } else if (lower === 'mod') {
        prev.mod = true;
      } else if (lower === 'sel') {
        prev.sel = true;
      }
    } else {
      prev.key = part;
    }
    return prev;
  }, {shift: false, alt: false, ctrl: false, meta: false, mod: false, sel: false, key: ''});
  if (parts.key === '') {
    throw new Error(`Invalid keyboard shortcut: "${spec}". Must include exactly one non-modifier key (e.g. "a", "Enter", "ArrowDown"). Combine any of Shift, Alt, Ctrl, Meta, and Mod.`);
  }
  return parts;
}

function normalizeEventKey(key: string): string {
  return key.toLowerCase();
}

/** Short aliases for common keys (shortcut side, before match). */
const KEY_ALIASES: Record<string, string> = {
  space: ' ',
  esc: 'escape',
  del: 'delete',
  ins: 'insert',
  left: 'arrowleft',
  right: 'arrowright',
  up: 'arrowup',
  down: 'arrowdown',
  pageup: 'pageup',
  pagedown: 'pagedown'
};

/** Canonical key segment (lowercase); aliases like `down` → `arrowdown`. */
function canonicalKeyFromSpecKey(specKey: string): string {
  let k = normalizeEventKey(specKey);
  let aliased = KEY_ALIASES[k];
  return aliased != null ? aliased : k;
}

/** Canonical shortcut string for a binding (modifiers sorted: Alt, Ctrl, Meta, Shift, then key). */
export function canonicalKeyboardShortcut(parsed: ParsedKeyboardShortcut): string {
  let mods = sortedModifierTokens(modifierSetFromParsed(parsed));
  let key = canonicalKeyFromSpecKey(parsed.key);
  return mods.length > 0 ? `${mods.join('+')}+${key}` : key;
}

/** Canonical shortcut string for a keydown event. */
export function keyboardEventToCanonicalShortcut(e: KeyboardEvent): string {
  let mods = sortedModifierTokens(modifierSetFromEvent(e));
  let key = normalizeEventKey(e.key);
  let prefix = mods.length > 0 ? `${mods.join('+')}+` : '';
  return prefix + key;
}

/**
 * Returns a keydown handler that runs the action only for an exact modifier+key match.
 * Modifier order in the string does not matter (`Shift+Mod+a` ≡ `Mod+Shift+a`).
 * Any combination of **Shift**, **Alt**, **Ctrl**, **Meta**, and **Mod** is allowed; **Mod** means
 * Cmd on Apple platforms and Ctrl on Windows/Linux (same as before). **control** aliases **ctrl**.
 *
 * Duplicate bindings that normalize to the same shortcut: later object entries win.
 *
 * @example
 * ```tsx
 * let onKeyDown = createKeyboardShortcutHandler({
 *   'Mod+s': (e) => { e.preventDefault(); save(); },
 *   'Ctrl+Shift+k': () => palette(),
 *   'Meta+Alt+ArrowLeft': () => back(),
 * });
 * ```
 */
export function createKeyboardShortcutHandler(
  bindings: KeyboardShortcutBindings
): (e: KeyboardEvent) => void {
  let map = new Map<string, KeyboardShortcutAction>();
  for (let [spec, action] of Object.entries(bindings)) {
    let parsed = parseKeyboardShortcut(spec);
    map.set(canonicalKeyboardShortcut(parsed), action);
  }

  return (e: KeyboardEvent) => {
    let canonical = keyboardEventToCanonicalShortcut(e);
    let action = map.get(canonical);
    let result = action?.(e);
    if (typeof result === 'boolean') {
      result = {shouldContinuePropagation: !result, shouldPreventDefault: result};
    }
    if (result?.shouldPreventDefault) {
      e.preventDefault();
    }
    if (!action || result?.shouldContinuePropagation) {
      e.continuePropagation();
    }
  };
}
