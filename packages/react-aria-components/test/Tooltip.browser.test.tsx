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

import {Button} from '../src/Button';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {expect, it, vi} from 'vitest';
import {Focusable} from 'react-aria/Focusable';
import {Popover} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Tooltip, TooltipTrigger} from '../src/Tooltip';

function Example({showTrigger}: {showTrigger: boolean}) {
  return (
    <>
      <DialogTrigger defaultOpen>
        <Button>Open</Button>
        <Popover>
          <Dialog>Popover open</Dialog>
        </Popover>
      </DialogTrigger>
      {showTrigger && (
        <TooltipTrigger>
          <Focusable>
            <span role="button" tabIndex={0}>
              3
            </span>
          </Focusable>
          <Tooltip>Three items</Tooltip>
        </TooltipTrigger>
      )}
    </>
  );
}

it('does not warn when a Focusable trigger mounts behind an open popover', async () => {
  let warn = vi.spyOn(console, 'warn');
  let screen = await render(<Example showTrigger={false} />);
  await screen.rerender(<Example showTrigger />);

  let trigger = screen.getByText('3').element();
  expect(trigger.closest('[inert]')).not.toBeNull();
  expect(warn).not.toHaveBeenCalledWith(
    '<Focusable> child must be focusable. Please ensure the tabIndex prop is passed through.'
  );
  warn.mockRestore();
});
