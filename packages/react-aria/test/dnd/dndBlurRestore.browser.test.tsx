/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {describe, expect, it} from 'vitest';

describe('Blur restore semantics in real Chromium', () => {
  it('element.blur() with no replacement focus produces FocusEvent.relatedTarget === null', () => {
    let a = document.createElement('div');
    a.tabIndex = 0;
    document.body.appendChild(a);
    a.focus();
    expect(document.activeElement).toBe(a);

    let captured: Array<{type: string; relatedTarget: EventTarget | null}> = [];
    let listener = (e: FocusEvent) => {
      captured.push({type: e.type, relatedTarget: e.relatedTarget});
    };
    window.addEventListener('blur', listener, true);

    a.blur();

    expect(captured.length).toBe(1);
    expect(captured[0].type).toBe('blur');
    // This is the exact condition that makes DragManager.onBlur misbehave:
    // its first early-return is `if (e.relatedTarget === activateButton)` and
    // activateButton is `null` when no drop item exposes one. null === null = true,
    // so the handler exits before the restore-focus branch.
    expect(captured[0].relatedTarget).toBeNull();

    window.removeEventListener('blur', listener, true);
    document.body.removeChild(a);
  });

  it('DragManager.onBlur-style handler: null===null collision skips focus restore', () => {
    let dragTarget = document.createElement('div');
    dragTarget.tabIndex = 0;
    dragTarget.id = 'drag';
    let dropTarget = document.createElement('div');
    dropTarget.tabIndex = 0;
    dropTarget.id = 'drop';
    document.body.append(dragTarget, dropTarget);

    // Faithful reproduction of the relevant part of DragManager.onBlur, with
    // currentDropTarget set to dropTarget and no activate button.
    let activateButton: HTMLElement | null = null;
    let currentDropTarget: HTMLElement | null = dropTarget;

    let onBlur = (e: FocusEvent) => {
      if (e.relatedTarget === activateButton) {
        return;
      }
      if (!e.relatedTarget || !(e.relatedTarget instanceof HTMLElement)) {
        if (currentDropTarget) {
          currentDropTarget.focus();
        } else {
          dragTarget.focus();
        }
      }
    };
    window.addEventListener('blur', onBlur, true);

    dropTarget.focus();
    expect(document.activeElement).toBe(dropTarget);
    dropTarget.blur();

    // The bug: focus collapses to body (or html) because the first guard returned early.
    expect(document.activeElement).not.toBe(dropTarget);

    window.removeEventListener('blur', onBlur, true);
    document.body.removeChild(dragTarget);
    document.body.removeChild(dropTarget);
  });

  it('Proposed fix: guard activateButton non-null before relatedTarget compare', () => {
    let dragTarget = document.createElement('div');
    dragTarget.tabIndex = 0;
    let dropTarget = document.createElement('div');
    dropTarget.tabIndex = 0;
    document.body.append(dragTarget, dropTarget);

    let activateButton: HTMLElement | null = null;
    let currentDropTarget: HTMLElement | null = dropTarget;

    let onBlur = (e: FocusEvent) => {
      // Fix: only treat this as "focus moving to activate button" when one exists.
      if (activateButton && e.relatedTarget === activateButton) {
        return;
      }
      if (!e.relatedTarget || !(e.relatedTarget instanceof HTMLElement)) {
        if (currentDropTarget) {
          currentDropTarget.focus();
        } else {
          dragTarget.focus();
        }
      }
    };
    window.addEventListener('blur', onBlur, true);

    dropTarget.focus();
    dropTarget.blur();

    expect(document.activeElement).toBe(dropTarget);

    window.removeEventListener('blur', onBlur, true);
    document.body.removeChild(dragTarget);
    document.body.removeChild(dropTarget);
  });
});
