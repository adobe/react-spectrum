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
import {Breadcrumb, Breadcrumbs} from '../src/Breadcrumbs';
import React, {act} from 'react';
import {render} from './utils/render';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('does not collapse breadcrumbs when fonts finish loading after render', async () => {
  let finishLoadingFonts: (fonts: FontFaceSet) => void;

  const fontsReady = new Promise<FontFaceSet>(resolve => {
    finishLoadingFonts = resolve;
  });

  vi.spyOn(document.fonts, 'ready', 'get').mockReturnValue(fontsReady);

  const {getByRole} = await render(
    <div style={{width: '800px'}}>
      <Breadcrumbs>
        <Breadcrumb href="/">Home</Breadcrumb>
        <Breadcrumb href="/trendy">Trendy</Breadcrumb>
        <Breadcrumb>March 2020 Assets</Breadcrumb>
      </Breadcrumbs>
    </div>
  );

  await expect.poll(() => getByRole('listitem').all()).toHaveLength(3);

  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

  await act(async () => {
    finishLoadingFonts(document.fonts);
  });

  expect(getByRole('listitem').all()).toHaveLength(3);
});
