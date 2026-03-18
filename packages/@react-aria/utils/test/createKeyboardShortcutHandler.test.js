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
  parseKeyboardShortcut
} from '../src/createKeyboardShortcutHandler';

function keydown(init) {
  return new KeyboardEvent('keydown', init);
}

const base = {ctrl: false, meta: false};

describe('parseKeyboardShortcut', () => {
  it('parses plain key', () => {
    expect(parseKeyboardShortcut('a')).toEqual({...base, shift: false, alt: false, mod: false, key: 'a'});
    expect(parseKeyboardShortcut('Enter')).toEqual({...base, shift: false, alt: false, mod: false, key: 'Enter'});
  });

  it('parses modifiers case-insensitively', () => {
    expect(parseKeyboardShortcut('MOD+shift+A')).toEqual({
      ...base,
      shift: true,
      alt: false,
      mod: true,
      key: 'A'
    });
  });

  it('parses ctrl, meta, control alias', () => {
    expect(parseKeyboardShortcut('Ctrl+Meta+x')).toEqual({
      shift: false,
      alt: false,
      ctrl: true,
      meta: true,
      mod: false,
      key: 'x'
    });
    expect(parseKeyboardShortcut('control+b')).toEqual({
      shift: false,
      alt: false,
      ctrl: true,
      meta: false,
      mod: false,
      key: 'b'
    });
  });
});

describe('canonicalKeyboardShortcut', () => {
  let platformMock;
  beforeEach(() => {
    platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
  });
  afterEach(() => {
    platformMock.mockRestore();
  });

  it('sorts modifiers regardless of spec order', () => {
    let a = parseKeyboardShortcut('Shift+Alt+Ctrl+x');
    let b = parseKeyboardShortcut('Ctrl+Shift+Alt+x');
    expect(canonicalKeyboardShortcut(a)).toBe(canonicalKeyboardShortcut(b));
    expect(canonicalKeyboardShortcut(a)).toBe('Alt+Ctrl+Shift+x');
  });

  it('expands Mod to Meta on Mac', () => {
    expect(canonicalKeyboardShortcut(parseKeyboardShortcut('Mod+k'))).toBe('Meta+k');
  });
});

describe('createKeyboardShortcutHandler', () => {
  describe('Mac (Mod = Meta)', () => {
    let platformMock;
    beforeEach(() => {
      platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
    });
    afterEach(() => {
      platformMock.mockRestore();
    });

    it('matches Mod+key with metaKey', () => {
      let save = jest.fn();
      let h = createKeyboardShortcutHandler({'Mod+s': save});
      h(keydown({key: 's', metaKey: true}));
      expect(save).toHaveBeenCalledTimes(1);
      h(keydown({key: 's', ctrlKey: true}));
      expect(save).toHaveBeenCalledTimes(1);
    });

    it('plain key ignores meta', () => {
      let a = jest.fn();
      let h = createKeyboardShortcutHandler({a});
      h(keydown({key: 'a', metaKey: true}));
      expect(a).not.toHaveBeenCalled();
    });

    it('Ctrl+Shift distinct from Mod+Shift', () => {
      let modShift = jest.fn();
      let ctrlShift = jest.fn();
      let h = createKeyboardShortcutHandler({
        'Mod+Shift+a': modShift,
        'Ctrl+Shift+a': ctrlShift
      });
      h(keydown({key: 'a', metaKey: true, shiftKey: true}));
      expect(modShift).toHaveBeenCalled();
      expect(ctrlShift).not.toHaveBeenCalled();
      modShift.mockClear();
      h(keydown({key: 'a', ctrlKey: true, shiftKey: true}));
      expect(ctrlShift).toHaveBeenCalled();
      expect(modShift).not.toHaveBeenCalled();
    });

    it('Meta+Ctrl+Alt combination', () => {
      let fn = jest.fn();
      let h = createKeyboardShortcutHandler({'Meta+Ctrl+Alt+z': fn});
      h(keydown({key: 'z', metaKey: true, ctrlKey: true, altKey: true}));
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('Windows (Mod = Ctrl)', () => {
    let platformMock;
    beforeEach(() => {
      platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'Win32');
    });
    afterEach(() => {
      platformMock.mockRestore();
    });

    it('matches Mod+key with ctrlKey', () => {
      let save = jest.fn();
      let h = createKeyboardShortcutHandler({'Mod+s': save});
      h(keydown({key: 's', ctrlKey: true}));
      expect(save).toHaveBeenCalledTimes(1);
      h(keydown({key: 's', metaKey: true}));
      expect(save).toHaveBeenCalledTimes(1);
    });

    it('expands Mod to Ctrl in canonical map', () => {
      let fn = jest.fn();
      let h = createKeyboardShortcutHandler({'Mod+j': fn});
      h(keydown({key: 'j', ctrlKey: true}));
      expect(fn).toHaveBeenCalled();
    });
  });

  it('Shift+Alt and key aliases', () => {
    let down = jest.fn();
    let h = createKeyboardShortcutHandler({
      'Shift+Alt+down': down
    });
    h(keydown({key: 'ArrowDown', shiftKey: true, altKey: true}));
    expect(down).toHaveBeenCalled();
  });

  describe('binding specificity', () => {
    let platformMock;
    beforeEach(() => {
      platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
    });
    afterEach(() => {
      platformMock.mockRestore();
    });

    it('Mod+Shift+a matches only that binding, not Mod+a', () => {
      let modA = jest.fn();
      let modShiftA = jest.fn();
      let h = createKeyboardShortcutHandler({
        'Mod+a': modA,
        'Mod+Shift+a': modShiftA
      });
      h(keydown({key: 'a', metaKey: true, shiftKey: true}));
      expect(modShiftA).toHaveBeenCalled();
      expect(modA).not.toHaveBeenCalled();
      modShiftA.mockClear();
      h(keydown({key: 'a', metaKey: true, shiftKey: false}));
      expect(modA).toHaveBeenCalled();
      expect(modShiftA).not.toHaveBeenCalled();
    });
  });

  it('passes event to handler', () => {
    let ev = keydown({key: 'Escape'});
    let fn = jest.fn();
    createKeyboardShortcutHandler({Escape: fn})(ev);
    expect(fn).toHaveBeenCalledWith(ev);
  });
});
