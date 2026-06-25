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

import {afterEach, expect, it, vi} from 'vitest';
import {CalendarDate} from '@internationalized/date';
import {DateField, DateInput, DateSegment} from '../src/DateField';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

function DateFieldWithSibling() {
  return (
    <>
      <button type="button" data-testid="sibling">
        sibling
      </button>
      <DateField aria-label="date" defaultValue={new CalendarDate(2020, 2, 3)}>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      </DateField>
    </>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

// Regression test for a Firefox-only focus steal. useDateSegment installs a document-level
// 'selectionchange' listener that re-collapses the window selection onto the segment whenever the
// selection anchor is inside it. In Firefox the caret inside a sibling <input> is not reflected in
// the document selection, so a stale anchor remains parked in a segment after focus moves away;
// collapsing onto the contentEditable segment there steals focus back into it (e.g. while typing
// in a neighbouring input). The fix gates the collapse on the segment being the active element.
// See https://github.com/adobe/react-spectrum/issues/10259
//
// The natural reproduction is Firefox-specific and impossible to set up faithfully through the
// test harness: in Chromium/WebKit focusing another element collapses the document selection, so
// the stale anchor never survives, and re-parking the real selection onto the contentEditable
// segment triggers the very focus steal we're guarding against. Instead we reproduce the guarded
// precondition deterministically — a selection anchored inside the segment while a *different*
// element genuinely holds focus — by stubbing window.getSelection for the single selectionchange,
// and assert on the guarded behaviour itself: the handler must not collapse the selection onto the
// segment. This fails in every browser without the fix.
it('does not collapse the selection onto a date segment while another element is focused', async () => {
  let {container} = await render(<DateFieldWithSibling />);

  let button = container.querySelector('[data-testid="sibling"]') as HTMLButtonElement;
  let segments = [...container.querySelectorAll('[role="spinbutton"]')] as HTMLElement[];
  let lastSegment = segments[segments.length - 1];

  // Genuinely move focus to a sibling element, so getActiveElement() !== the segment.
  await userEvent.click(button);
  expect(document.activeElement).toBe(button);

  // Present the Firefox state: a stale selection anchor still inside the segment. Stubbing
  // window.getSelection keeps real focus untouched (collapsing onto the contentEditable segment
  // for real would itself steal focus on Firefox, defeating the setup).
  let collapse = vi.fn();
  let staleSelection = {
    anchorNode: lastSegment.firstChild ?? lastSegment,
    collapse
  } as unknown as Selection;
  vi.spyOn(window, 'getSelection').mockReturnValue(staleSelection);

  document.dispatchEvent(new Event('selectionchange'));

  // Without the fix the handler calls selection.collapse(segment) here — the focus steal on Firefox.
  expect(collapse).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(button);
});
