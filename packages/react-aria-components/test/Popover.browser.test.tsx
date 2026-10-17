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
import {commands, page, userEvent} from 'vitest/browser';
import {DialogTrigger} from '../src/Dialog';
import {expect, it, vi} from 'vitest';
import {Popover, PopoverOverlay} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';

function AnimatedPopover({
  transition = false,
  entry = false,
  shouldSkipAnimation = false,
  isOpen
}: {
  transition?: boolean;
  entry?: boolean;
  shouldSkipAnimation?: boolean;
  isOpen?: boolean;
}) {
  return (
    <>
      <style>{`
        @keyframes popover-overlay-exit { to { opacity: 0; } }
        @keyframes popover-overlay-enter { from { opacity: 0; } }
        ${entry ? '.animated-overlay[data-entering], .animated-popover[data-entering] { animation: popover-overlay-enter 100s; }' : ''}
        .animated-overlay, .animated-popover { opacity: 1; }
        .animated-overlay[data-exiting], .animated-popover[data-exiting] {
          ${transition ? 'opacity: 0; transition: opacity 100s;' : 'animation: popover-overlay-exit 100s;'}
        }
      `}</style>
      <DialogTrigger isOpen={isOpen}>
        <Button>Open popover</Button>
        <PopoverOverlay className="animated-overlay" data-testid="backdrop">
          <Popover
            className="animated-popover"
            aria-label="Animated popover"
            shouldSkipAnimation={shouldSkipAnimation}>
            Popover content
          </Popover>
        </PopoverOverlay>
      </DialogTrigger>
    </>
  );
}

it('animates the backdrop and popover entry independently after positioning', async () => {
  await render(<AnimatedPopover entry />);
  await userEvent.click(page.getByRole('button', {name: 'Open popover'}));
  let popover = page.getByRole('dialog').element() as HTMLElement;
  let overlay = page.getByTestId('backdrop').element() as HTMLElement;
  await expect.element(overlay).toHaveAttribute('data-entering');
  await expect.element(popover).toHaveAttribute('data-entering');
  expect(overlay.getAnimations()).toHaveLength(1);
  expect(popover.getAnimations()).toHaveLength(1);
  overlay.getAnimations()[0].finish();
  await expect.element(overlay).not.toHaveAttribute('data-entering');
  expect(popover).toHaveAttribute('data-entering');
  popover.getAnimations()[0].finish();
  await expect.element(popover).not.toHaveAttribute('data-entering');
});

it.each(['overlay', 'popover'])(
  'waits for both exit animations when the %s finishes first',
  async first => {
    await render(<AnimatedPopover />);
    await userEvent.click(page.getByRole('button', {name: 'Open popover'}));
    let popover = page.getByRole('dialog').element() as HTMLElement;
    let overlay = page.getByTestId('backdrop').element() as HTMLElement;
    await userEvent.keyboard('{Escape}');
    await expect.element(overlay).toHaveAttribute('data-exiting');
    await expect.element(popover).toHaveAttribute('data-exiting');
    expect(overlay.getAnimations()).toHaveLength(1);
    expect(popover.getAnimations()).toHaveLength(1);
    let elements = first === 'overlay' ? [overlay, popover] : [popover, overlay];
    elements[0].getAnimations()[0].finish();
    await expect
      .poll(() =>
        elements[0].getAnimations().every(animation => animation.playState === 'finished')
      )
      .toBe(true);
    expect(overlay).toBeInTheDocument();
    expect(popover).toBeInTheDocument();
    elements[1].getAnimations()[0].finish();
    await expect.element(popover).not.toBeInTheDocument();
    await expect.element(overlay).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', {name: 'Open popover'})).toHaveFocus();
  }
);

it('waits for overlay and popover exit transitions', async () => {
  await render(<AnimatedPopover transition />);
  await userEvent.click(page.getByRole('button', {name: 'Open popover'}));
  let popover = page.getByRole('dialog').element() as HTMLElement;
  let overlay = page.getByTestId('backdrop').element() as HTMLElement;
  await userEvent.keyboard('{Escape}');
  await expect.element(overlay).toHaveAttribute('data-exiting');
  expect(overlay.getAnimations()).toHaveLength(1);
  expect(popover.getAnimations()).toHaveLength(1);
  overlay.getAnimations()[0].finish();
  await expect.poll(() => overlay.getAnimations().length).toBe(0);
  expect(popover).toBeInTheDocument();
  popover.getAnimations()[0].finish();
  await expect.element(overlay).not.toBeInTheDocument();
  await expect.element(popover).not.toBeInTheDocument();
});

it('keeps a reopened popover mounted after cancelling its exit animation', async () => {
  let result = await render(<AnimatedPopover isOpen />);
  let overlay = page.getByTestId('backdrop').element() as HTMLElement;
  await result.rerender(<AnimatedPopover isOpen={false} />);
  let animations = overlay.getAnimations();
  expect(animations).toHaveLength(1);
  let finished = Promise.allSettled(animations.map(animation => animation.finished));
  await result.rerender(<AnimatedPopover isOpen />);
  await expect.element(overlay).not.toHaveAttribute('data-exiting');
  await finished;
  await expect.element(page.getByRole('dialog')).toBeInTheDocument();
  await result.unmount();
});

it('blocks elevated outside controls and restores their interactivity after dismissal', async () => {
  let onPress = vi.fn();
  await render(
    <>
      <Button
        onPress={onPress}
        data-testid="outside"
        style={{position: 'fixed', top: 50, left: 500, zIndex: 5}}>
        Outside action
      </Button>
      <DialogTrigger>
        <Button>Open popover</Button>
        <PopoverOverlay data-testid="backdrop" style={{zIndex: 10}}>
          <Popover aria-label="Popover" style={{zIndex: 11}}>
            Popover content
          </Popover>
        </PopoverOverlay>
      </DialogTrigger>
    </>
  );
  await userEvent.click(page.getByRole('button', {name: 'Open popover'}));
  let overlay = page.getByTestId('backdrop').element();
  expect(getComputedStyle(overlay).zIndex).toBe('10');
  // A real pointer press at the outside button's position tests browser hit testing.
  await commands.mouseDownOnElement(page.getByTestId('outside').selector);
  await commands.mouseUp();
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  expect(onPress).not.toHaveBeenCalled();
  await userEvent.click(page.getByRole('button', {name: 'Outside action'}));
  expect(onPress).toHaveBeenCalledTimes(1);
});

it('skips both automatic exit animations when shouldSkipAnimation is set', async () => {
  await render(<AnimatedPopover shouldSkipAnimation />);
  await userEvent.click(page.getByRole('button', {name: 'Open popover'}));
  let popover = page.getByRole('dialog').element();
  let overlay = page.getByTestId('backdrop').element();
  await userEvent.keyboard('{Escape}');
  expect(popover).not.toBeInTheDocument();
  expect(overlay).not.toBeInTheDocument();
});

it('skips both automatic entry animations when shouldSkipAnimation is set', async () => {
  await render(<AnimatedPopover entry shouldSkipAnimation />);
  await userEvent.click(page.getByRole('button', {name: 'Open popover'}));
  let popover = page.getByRole('dialog').element() as HTMLElement;
  let overlay = page.getByTestId('backdrop').element() as HTMLElement;
  expect(popover).not.toHaveAttribute('data-entering');
  expect(overlay).not.toHaveAttribute('data-entering');
  expect(popover.getAnimations()).toHaveLength(0);
  expect(overlay.getAnimations()).toHaveLength(0);
});
