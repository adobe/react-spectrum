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

import {
  canonicalKeyboardShortcut,
  createKeyboardShortcutHandler,
  keyboardEventToCanonicalShortcut,
  parseKeyboardShortcut
} from '../../src/interactions/createKeyboardShortcutHandler';

function makeEvent(key, mods = {}) {
  return {
    key,
    altKey: !!mods.alt,
    ctrlKey: !!mods.ctrl,
    metaKey: !!mods.meta,
    shiftKey: !!mods.shift,
    preventDefault: jest.fn(),
    continuePropagation: jest.fn()
  };
}

describe('createKeyboardShortcutHandler', () => {
  describe('parseKeyboardShortcut', () => {
    it('throws when the shortcut has no non-modifier key', () => {
      expect(() => parseKeyboardShortcut('Mod+Shift')).toThrow(/Invalid keyboard shortcut/);
    });

    it('throws on an empty string', () => {
      expect(() => parseKeyboardShortcut('')).toThrow(/Invalid keyboard shortcut/);
    });

    it('parses modifiers case-insensitively and ignores order', () => {
      expect(parseKeyboardShortcut('SHIFT+mod+A')).toEqual({
        shift: true,
        alt: false,
        ctrl: false,
        meta: false,
        mod: true,
        key: 'A'
      });
    });

    it('treats control as an alias for ctrl', () => {
      let parsed = parseKeyboardShortcut('Control+a');
      expect(parsed.ctrl).toBe(true);
      expect(parsed.meta).toBe(false);
    });
  });

  describe('canonicalKeyboardShortcut', () => {
    let platformMock;
    afterEach(() => {
      platformMock?.mockRestore();
    });

    it('is order-independent (Shift+Mod+a === Mod+Shift+a)', () => {
      platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
      expect(canonicalKeyboardShortcut(parseKeyboardShortcut('Shift+Mod+a'))).toBe(
        canonicalKeyboardShortcut(parseKeyboardShortcut('Mod+Shift+a'))
      );
    });

    it('expands Mod to Meta on Mac and Control on Windows', () => {
      platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
      expect(canonicalKeyboardShortcut(parseKeyboardShortcut('Mod+s'))).toBe('Meta+s');
      platformMock.mockImplementation(() => 'Win32');
      expect(canonicalKeyboardShortcut(parseKeyboardShortcut('Mod+s'))).toBe('Control+s');
    });

    it.each`
      alias         | canonical
      ${'space'}    | ${' '}
      ${'esc'}      | ${'escape'}
      ${'del'}      | ${'delete'}
      ${'ins'}      | ${'insert'}
      ${'left'}     | ${'arrowleft'}
      ${'right'}    | ${'arrowright'}
      ${'up'}       | ${'arrowup'}
      ${'down'}     | ${'arrowdown'}
      ${'pageup'}   | ${'pageup'}
      ${'pagedown'} | ${'pagedown'}
    `('maps key alias "$alias" to "$canonical"', ({alias, canonical}) => {
      expect(canonicalKeyboardShortcut(parseKeyboardShortcut(alias))).toBe(canonical);
    });
  });

  describe('keyboardEventToCanonicalShortcut', () => {
    it('lowercases the key and sorts modifiers into canonical order', () => {
      expect(keyboardEventToCanonicalShortcut(makeEvent('A', {shift: true, meta: true}))).toBe(
        'Meta+Shift+a'
      );
    });
  });

  describe('handler behavior', () => {
    let platformMock;
    beforeEach(() => {
      platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
    });
    afterEach(() => {
      platformMock?.mockRestore();
    });

    it('runs the matching action and, on undefined return, prevents default and stops propagation', () => {
      let action = jest.fn();
      let handler = createKeyboardShortcutHandler({'Mod+s': action});
      let e = makeEvent('s', {meta: true});

      handler(e);

      expect(action).toHaveBeenCalledTimes(1);
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      expect(e.continuePropagation).not.toHaveBeenCalled();
    });

    it('does not run the action and continues propagation when there is no match', () => {
      let action = jest.fn();
      let handler = createKeyboardShortcutHandler({'Mod+s': action});
      let e = makeEvent('s', {ctrl: true});

      handler(e);

      expect(action).not.toHaveBeenCalled();
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(e.continuePropagation).toHaveBeenCalledTimes(1);
    });

    it('treats a boolean true return as preventDefault + stop propagation', () => {
      let handler = createKeyboardShortcutHandler({Escape: () => true});
      let e = makeEvent('Escape');

      handler(e);

      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      expect(e.continuePropagation).not.toHaveBeenCalled();
    });

    it('treats a boolean false return as continue propagation without preventDefault', () => {
      let handler = createKeyboardShortcutHandler({Escape: () => false});
      let e = makeEvent('Escape');

      handler(e);

      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(e.continuePropagation).toHaveBeenCalledTimes(1);
    });

    it('lets an object return finely control preventDefault and propagation', () => {
      let handler = createKeyboardShortcutHandler({
        Escape: () => ({shouldPreventDefault: false, shouldContinuePropagation: true})
      });
      let e = makeEvent('Escape');

      handler(e);

      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(e.continuePropagation).toHaveBeenCalledTimes(1);
    });

    it('matches regardless of modifier order in the spec', () => {
      let action = jest.fn(() => true);
      let handler = createKeyboardShortcutHandler({'Shift+Mod+a': action});

      handler(makeEvent('a', {meta: true, shift: true}));

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('lets later duplicate bindings win', () => {
      let first = jest.fn();
      let second = jest.fn();
      // Both specs canonicalize to the same shortcut; the later entry should win.
      let handler = createKeyboardShortcutHandler({'Mod+Shift+a': first, 'Shift+Mod+a': second});

      handler(makeEvent('a', {meta: true, shift: true}));

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });

    it('passes the event through to the action', () => {
      let received;
      let handler = createKeyboardShortcutHandler({Escape: e => (received = e)});
      let e = makeEvent('Escape');

      handler(e);

      expect(received).toBe(e);
    });
  });
});
