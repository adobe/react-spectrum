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

import {screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('PopoverOverlay SSR', () => {
  it('hydrates an open popover and its custom overlay in StrictMode', async () => {
    await testSSR(
      __filename,
      `
      import {Button} from '../exports/Button.ts';
      import {Dialog, DialogTrigger, Popover, PopoverOverlay} from '../exports/Popover.ts';

      <React.StrictMode>
        <DialogTrigger defaultOpen>
          <Button>Open popover</Button>
          <PopoverOverlay data-testid="backdrop">
            <Popover><Dialog aria-label="Popover">Content</Dialog></Popover>
          </PopoverOverlay>
        </DialogTrigger>
      </React.StrictMode>
      `,
      () => {
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.queryByTestId('backdrop')).toBeNull();
      }
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('backdrop')).toHaveClass('react-aria-PopoverOverlay');
  });
});
