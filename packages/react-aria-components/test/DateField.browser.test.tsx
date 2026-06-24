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

import {CalendarDate} from '@internationalized/date';
import {DateField, DateInput, DateSegment} from '../src/DateField';
import {expect, it} from 'vitest';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

function DateFieldWithSiblingInput() {
  return (
    <>
      <input aria-label="text" data-testid="sibling" />
      <DateField aria-label="date" defaultValue={new CalendarDate(2020, 2, 3)}>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      </DateField>
    </>
  );
}

// Regression test for a Firefox-only focus steal. useDateSegment installs a document-level
// 'selectionchange' listener that re-collapses the window selection onto the segment whenever
// the selection anchor is inside it. In Firefox the caret inside an <input> is not reflected
// in the document selection, so a stale anchor remains parked in a segment after focus moves to
// a sibling input; collapsing onto the contentEditable segment then steals focus back into it.
// See https://github.com/adobe/react-spectrum/issues/10259
it('does not steal focus into a date segment when typing in a sibling input', async () => {
  let {container} = await render(<DateFieldWithSiblingInput />);

  let input = container.querySelector('[data-testid="sibling"]') as HTMLInputElement;
  let segments = [...container.querySelectorAll('[role="spinbutton"]')] as HTMLElement[];
  let lastSegment = segments[segments.length - 1];
  let initialSegmentText = lastSegment.textContent;

  // Focus a date segment first so its onFocus handler parks the document selection inside it.
  await userEvent.click(lastSegment);
  expect(document.activeElement).toBe(lastSegment);

  // Move focus to the sibling input and type. The stale selection anchor (still in the segment
  // on Firefox) must not cause the segment to grab focus back on the resulting selectionchange.
  await userEvent.click(input);
  expect(document.activeElement).toBe(input);

  await userEvent.keyboard('123');

  // Focus must remain in the input and the digits must land there, not in the segment.
  expect(document.activeElement).toBe(input);
  expect(input.value).toBe('123');
  expect(lastSegment.textContent).toBe(initialSegmentText);
});
