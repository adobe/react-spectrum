/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Grid} from '@react-spectrum/layout';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {render} from '@testing-library/react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

export function testSlotsAPI(Component, {defaultSlot, props, testSlotName, targetChild= 0} = {}) {
  let slotName = testSlotName || 'dummySlot';
  let {getByTestId, rerender, debug} = render(
    <Provider theme={theme}>
      <Grid data-testid="grid" slots={{[slotName]: {UNSAFE_className: 'slotClassName'}}}>
        <Component slot={testSlotName ? undefined : slotName} {...props} />
      </Grid>
    </Provider>
  );
  let root = getByTestId('grid');
  expect(root.children[targetChild]).toHaveClass('slotClassName');

  if (defaultSlot) {
    rerender(
      <Provider theme={theme}>
        <Grid data-testid="grid" slots={{[defaultSlot]: {UNSAFE_className: 'slotClassName'}}}>
          <Component {...props} />
        </Grid>
      </Provider>
    );
    root = getByTestId('grid');
    expect(root.firstChild).toHaveClass('slotClassName');
  }
}
