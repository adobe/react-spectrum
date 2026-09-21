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

import {act, fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {ActionButton} from '../src/ActionButton';
import React from 'react';
import {Tooltip, TooltipTrigger, TooltipVariant} from '../src/Tooltip';
import userEvent from '@testing-library/user-event';

function TestTooltip(props: {variant?: TooltipVariant; hideArrow?: boolean}) {
  return (
    <TooltipTrigger delay={0}>
      <ActionButton aria-label="Trigger">Trigger</ActionButton>
      <Tooltip {...props}>Tooltip label</Tooltip>
    </TooltipTrigger>
  );
}

describe('Tooltip', () => {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('defaults to the neutral variant', async () => {
    let {getByRole} = render(<TestTooltip />);
    let button = getByRole('button');

    fireEvent.mouseMove(document.body);
    await user.hover(button);
    act(() => jest.runAllTimers());

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.querySelector('svg')).toBeInTheDocument();
  });

  it.each(['neutral', 'informative', 'negative'] as const)(
    'renders a distinct className for the %s variant',
    async variant => {
      let {getByRole} = render(<TestTooltip variant={variant} />);
      let button = getByRole('button');

      fireEvent.mouseMove(document.body);
      await user.hover(button);
      act(() => jest.runAllTimers());

      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.className.length).toBeGreaterThan(0);
    }
  );

  it('renders different classNames for different variants', async () => {
    let neutral = render(<TestTooltip variant="neutral" />);
    let button = neutral.getByRole('button');
    fireEvent.mouseMove(document.body);
    await user.hover(button);
    act(() => jest.runAllTimers());
    let neutralClassName = neutral.getByRole('tooltip').className;
    await user.unhover(button);
    act(() => jest.runAllTimers());
    neutral.unmount();

    let negative = render(<TestTooltip variant="negative" />);
    button = negative.getByRole('button');
    fireEvent.mouseMove(document.body);
    await user.hover(button);
    act(() => jest.runAllTimers());
    let negativeClassName = negative.getByRole('tooltip').className;

    expect(neutralClassName).not.toBe(negativeClassName);
  });

  it('renders the directional arrow by default', async () => {
    let {getByRole} = render(<TestTooltip />);
    let button = getByRole('button');

    fireEvent.mouseMove(document.body);
    await user.hover(button);
    act(() => jest.runAllTimers());

    let tooltip = getByRole('tooltip');
    expect(tooltip.querySelector('svg')).toBeInTheDocument();
  });

  it('hides the directional arrow when hideArrow is set', async () => {
    let {getByRole} = render(<TestTooltip hideArrow />);
    let button = getByRole('button');

    fireEvent.mouseMove(document.body);
    await user.hover(button);
    act(() => jest.runAllTimers());

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.querySelector('svg')).toBeNull();
  });

  it('does not forward variant or hideArrow as DOM attributes', async () => {
    let {getByRole} = render(<TestTooltip variant="negative" hideArrow />);
    let button = getByRole('button');

    fireEvent.mouseMove(document.body);
    await user.hover(button);
    act(() => jest.runAllTimers());

    let tooltip = getByRole('tooltip');
    expect(tooltip).not.toHaveAttribute('variant');
    expect(tooltip).not.toHaveAttribute('hidearrow');
  });
});
