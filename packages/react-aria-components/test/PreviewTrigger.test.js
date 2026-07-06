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

import {
  act,
  fireEvent,
  installPointerEvent,
  pointerMap,
  render
} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import {Link} from '../src/Link';
import {PreviewTrigger} from '../src/PreviewTrigger';
import {Popover} from '../src/Popover';
import React from 'react';
import userEvent from '@testing-library/user-event';

function TestPreviewTrigger(props) {
  return (
    <>
      <PreviewTrigger delay={0} closeDelay={0} {...props}>
        <Link href="https://example.com">Example</Link>
        <Popover data-testid="preview">
          <p>Preview content</p>
          <Button>Action</Button>
        </Popover>
      </PreviewTrigger>
      <button data-testid="after">After</button>
    </>
  );
}

describe('PreviewTrigger', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Close any open preview and run out the global warmup/cooldown timer so it doesn't leak
    // into the next test (the warmup state in useTooltipTriggerState is module-level).
    fireEvent.keyDown(document.activeElement, {key: 'Escape'});
    fireEvent.keyUp(document.activeElement, {key: 'Escape'});
    act(() => jest.runAllTimers());
  });

  describe('safe area', () => {
    installPointerEvent();

    let mockRect = (el, rect) => {
      el.getBoundingClientRect = () => ({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top,
        x: rect.left,
        y: rect.top,
        toJSON() {}
      });
    };

    it('opens on hover, stays open across the safe area, and closes when the pointer leaves', async () => {
      let {getByRole, getByTestId, queryByTestId} = render(<TestPreviewTrigger />);
      let link = getByRole('link');

      fireEvent.mouseMove(document.body);
      await user.hover(link);
      act(() => jest.runAllTimers());

      let preview = getByTestId('preview');
      expect(preview).toBeInTheDocument();
      expect(link.getAttribute('aria-describedby')).toContain(preview.id);

      // Link at the top, popover directly below with a gap between them.
      mockRect(link, {left: 0, right: 100, top: 0, bottom: 20});
      mockRect(preview, {left: 0, right: 100, top: 40, bottom: 140});

      // Pointer in the gap between the link and the popover is still within the safe area.
      fireEvent.pointerMove(document.body, {clientX: 50, clientY: 30, pointerType: 'mouse'});
      act(() => jest.runAllTimers());
      expect(queryByTestId('preview')).toBeInTheDocument();

      // Pointer over the popover: stays open.
      fireEvent.pointerMove(document.body, {clientX: 50, clientY: 100, pointerType: 'mouse'});
      act(() => jest.runAllTimers());
      expect(queryByTestId('preview')).toBeInTheDocument();

      // Pointer well outside both the link and popover: closes (even with closeDelay of 0).
      fireEvent.pointerMove(document.body, {clientX: 500, clientY: 500, pointerType: 'mouse'});
      act(() => jest.runAllTimers());
      expect(queryByTestId('preview')).not.toBeInTheDocument();
    });
  });

  it('opens on keyboard focus', async () => {
    let {getByRole, getByTestId} = render(<TestPreviewTrigger />);
    let link = getByRole('link');

    await user.tab();
    expect(document.activeElement).toBe(link);

    let preview = getByTestId('preview');
    expect(preview).toBeInTheDocument();
    expect(link.getAttribute('aria-describedby')).toContain(preview.id);
  });

  it('exposes aria-haspopup, aria-expanded, and aria-controls on the trigger', async () => {
    let {getByRole, getByTestId} = render(<TestPreviewTrigger />);
    let link = getByRole('link');

    // Closed: haspopup is always present, not expanded, and controls nothing.
    expect(link).toHaveAttribute('aria-haspopup', 'dialog');
    expect(link).toHaveAttribute('aria-expanded', 'false');
    expect(link).not.toHaveAttribute('aria-controls');

    // Open via keyboard focus: expanded and controlling the popover.
    await user.tab();
    let preview = getByTestId('preview');
    expect(link).toHaveAttribute('aria-haspopup', 'dialog');
    expect(link).toHaveAttribute('aria-expanded', 'true');
    expect(link).toHaveAttribute('aria-controls', preview.id);
  });

  it('delays opening on keyboard focus', async () => {
    let {getByRole, getByTestId, queryByTestId} = render(<TestPreviewTrigger delay={300} />);
    let link = getByRole('link');

    await user.tab();
    expect(document.activeElement).toBe(link);
    // Not open until the delay elapses, unlike a tooltip.
    expect(queryByTestId('preview')).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(300));
    expect(getByTestId('preview')).toBeInTheDocument();
  });

  it('does not open when tabbing through before the delay elapses', async () => {
    let {getByRole, getByTestId, queryByTestId} = render(<TestPreviewTrigger delay={300} />);
    let link = getByRole('link');

    await user.tab(); // focus the link, schedules the warmup
    expect(document.activeElement).toBe(link);

    // Tab to the next element before the delay elapses; the preview should never open.
    act(() => jest.advanceTimersByTime(150));
    await user.tab();
    expect(document.activeElement).toBe(getByTestId('after'));

    act(() => jest.runAllTimers());
    expect(queryByTestId('preview')).not.toBeInTheDocument();
  });

  it('is non-modal (no underlay)', async () => {
    let {getByRole, queryByTestId} = render(<TestPreviewTrigger />);

    await user.tab();
    expect(getByRole('link')).toBeInTheDocument();
    expect(queryByTestId('underlay')).not.toBeInTheDocument();
  });

  it('moves focus into the preview when tabbing from the link', async () => {
    let {getByRole} = render(<TestPreviewTrigger />);
    let link = getByRole('link');

    await user.tab();
    expect(document.activeElement).toBe(link);

    await user.tab();
    let action = getByRole('button', {name: 'Action'});
    expect(document.activeElement).toBe(action);
  });

  it('stays open while focus is inside the preview', async () => {
    let {getByRole, getByTestId} = render(<TestPreviewTrigger />);

    await user.tab(); // focus link, opens preview
    await user.tab(); // focus into preview
    act(() => jest.runAllTimers());

    expect(getByTestId('preview')).toBeInTheDocument();
    expect(document.activeElement).toBe(getByRole('button', {name: 'Action'}));
  });

  it('tabs out of the preview to the element after the trigger', async () => {
    let {getByRole, getByTestId} = render(<TestPreviewTrigger />);

    await user.tab(); // link, opens
    await user.tab(); // into preview (Action)
    expect(document.activeElement).toBe(getByRole('button', {name: 'Action'}));

    // The popover's FocusScope manages tabbing out relative to the trigger, so tabbing forward
    // past the last element in the preview moves focus to the element after the link.
    await user.tab();
    expect(document.activeElement).toBe(getByTestId('after'));
  });

  it('closes on Escape and restores focus to the link', async () => {
    let {getByRole, queryByTestId} = render(<TestPreviewTrigger />);
    let link = getByRole('link');

    await user.tab(); // link, opens
    await user.tab(); // into preview
    expect(document.activeElement).toBe(getByRole('button', {name: 'Action'}));

    await user.keyboard('{Escape}');
    act(() => jest.runAllTimers());

    expect(queryByTestId('preview')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(link);
  });

  it('does not reopen when closed via the popover Dismiss button (focus restore)', async () => {
    let {getByRole, queryByTestId} = render(<TestPreviewTrigger />);
    let link = getByRole('link');

    await user.tab(); // link, opens
    await user.tab(); // into preview
    expect(document.activeElement).toBe(getByRole('button', {name: 'Action'}));

    // A screen reader can press the hidden Dismiss button inside the popover. Closing this way
    // causes the popover's FocusScope to restore focus to the trigger, which must not reopen the
    // preview (handled via the react-aria-focus-scope-restore event).
    // Use fireEvent.click (not user.click) so the interaction modality stays "keyboard"; otherwise
    // the restored focus wouldn't be focus-visible and onFocus wouldn't try to reopen, making the
    // test pass trivially.
    let dismiss = getByRole('button', {name: 'Dismiss'});
    fireEvent.click(dismiss);
    act(() => jest.runAllTimers());

    expect(queryByTestId('preview')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(link);

    // It stays closed and does not reopen from the restored focus.
    act(() => jest.runAllTimers());
    expect(queryByTestId('preview')).not.toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    let {getByRole, queryByTestId} = render(<TestPreviewTrigger isDisabled />);
    let link = getByRole('link');

    fireEvent.mouseMove(document.body);
    await user.hover(link);
    act(() => jest.runAllTimers());
    expect(queryByTestId('preview')).not.toBeInTheDocument();
  });

  it('supports controlled open state', async () => {
    let onOpenChange = jest.fn();
    let {getByTestId} = render(<TestPreviewTrigger isOpen onOpenChange={onOpenChange} />);
    expect(getByTestId('preview')).toBeInTheDocument();
  });

  describe('long press (touch)', () => {
    installPointerEvent();

    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('opens on long press and moves focus into the popover', () => {
      let {getByRole, getByTestId} = render(<TestPreviewTrigger />);
      let link = getByRole('link');

      fireEvent.pointerDown(link, {pointerType: 'touch'});
      // Advance past the long press threshold (500ms).
      act(() => jest.advanceTimersByTime(600));

      let preview = getByTestId('preview');
      expect(preview).toBeInTheDocument();
      // The popover itself receives focus so touch screen readers move into the preview.
      expect(preview).toHaveAttribute('tabindex', '-1');
      expect(document.activeElement).toBe(preview);

      fireEvent.pointerUp(link, {pointerType: 'touch'});
    });

    let touchDescriptor;
    let setTouchCapable = () => {
      touchDescriptor = Object.getOwnPropertyDescriptor(window, 'ontouchstart');
      window.ontouchstart = null;
    };
    let restoreTouchCapable = () => {
      if (touchDescriptor) {
        Object.defineProperty(window, 'ontouchstart', touchDescriptor);
      } else {
        delete window.ontouchstart;
      }
    };

    it('only describes the long press interaction when using touch', async () => {
      setTouchCapable();
      try {
        let {getByRole, queryByText} = render(<TestPreviewTrigger />);
        let link = getByRole('link');

        // Keyboard modality: the long press hint would be confusing, so it is not present.
        await user.tab();
        expect(queryByText('Long press to open preview')).not.toBeInTheDocument();

        // Switch to pointer modality on a touch-capable device: the hint is present and linked to
        // the trigger. Fire both pointer and mouse events so it works regardless of which global
        // modality listeners are active.
        fireEvent.pointerDown(document.body, {pointerType: 'touch'});
        fireEvent.mouseDown(document.body);
        let desc = queryByText('Long press to open preview');
        expect(desc).toBeInTheDocument();
        expect(link.getAttribute('aria-describedby')).toContain(desc.id);
      } finally {
        restoreTouchCapable();
      }
    });
  });
});
