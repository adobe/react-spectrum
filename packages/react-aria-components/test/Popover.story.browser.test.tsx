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

import {composeStory} from '@storybook/react';
import {expect, it, vi} from 'vitest';
import meta, {CustomOverlay} from '../stories/Popover.stories';
import {page, userEvent} from 'vitest/browser';
import React from 'react';
import {render} from 'vitest-browser-react';

// Parcel exposes this stylesheet as CSS Modules. Preserve Vite's real stylesheet
// side effect and provide the class names used by this story.
vi.mock('../stories/styles.css', async importOriginal => {
  await importOriginal();
  return {default: {'popover-base': 'popover-base', animation: 'animation'}};
});

const CustomOverlayStory = composeStory(CustomOverlay, meta);

it('keeps the custom overlay example usable in a short, narrow viewport', async () => {
  let viewport = {width: window.innerWidth, height: window.innerHeight};
  let result: Awaited<ReturnType<typeof render>> | undefined;
  try {
    await page.viewport(295, 189);
    result = await render(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <CustomOverlayStory />
      </div>
    );
    let trigger = page.getByRole('button', {name: 'Open popover'});
    await userEvent.click(trigger);
    let dialog = page.getByRole('dialog', {name: 'Custom backdrop'});
    let popover = dialog.element().closest('[data-placement]') as HTMLElement;
    let overlay = document.querySelector('.custom-popover-overlay') as HTMLElement;
    await expect.element(overlay).not.toHaveAttribute('data-entering');
    await expect.element(popover).not.toHaveAttribute('data-entering');

    let bounds = popover.getBoundingClientRect();
    expect(bounds.top).toBeGreaterThanOrEqual(-1);
    expect(bounds.left).toBeGreaterThanOrEqual(-1);
    expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
    expect(bounds.right).toBeLessThanOrEqual(window.innerWidth + 1);
    expect(popover.scrollHeight).toBeGreaterThan(popover.clientHeight);

    let close = page.getByRole('button', {name: 'Close', exact: true});
    await expect.element(dialog).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(close).toHaveFocus();
    let closeBounds = close.element().getBoundingClientRect();
    expect(closeBounds.top).toBeGreaterThanOrEqual(bounds.top - 1);
    expect(closeBounds.bottom).toBeLessThanOrEqual(bounds.bottom + 1);
    expect(closeBounds.left).toBeGreaterThanOrEqual(bounds.left - 1);
    expect(closeBounds.right).toBeLessThanOrEqual(bounds.right + 1);
    expect(window.scrollY).toBe(0);

    await userEvent.keyboard('{Enter}');
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(overlay).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  } finally {
    await result?.unmount();
    await page.viewport(viewport.width, viewport.height);
  }
});
