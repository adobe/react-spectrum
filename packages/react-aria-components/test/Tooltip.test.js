/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render} from '@react-spectrum/test-utils';
import {Button, OverlayArrow, Tooltip, TooltipTrigger} from 'react-aria-components';
import React from 'react';
import userEvent from '@testing-library/user-event';

let renderTooltip = () => render(
  <TooltipTrigger delay={0}>
    <Button><span aria-hidden="true">✏️</span></Button>
    <Tooltip data-test="tooltip">
      <OverlayArrow>
        <svg width={8} height={8}>
          <path d="M0 0,L4 4,L8 0" />
        </svg>
      </OverlayArrow>
      Edit
    </Tooltip>
  </TooltipTrigger>
);

describe('Tooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('shows on hover', () => {
    let {getByRole} = renderTooltip();
    let button = getByRole('button');

    fireEvent.mouseMove(document.body);
    userEvent.hover(button);
    act(() => jest.runAllTimers());

    let tooltip = getByRole('tooltip');
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveClass('react-aria-Tooltip');
    expect(tooltip).toHaveAttribute('data-placement', 'top');
    expect(tooltip).toHaveStyle('position: absolute');
    expect(tooltip).toHaveAttribute('data-test', 'tooltip');

    let arrow = tooltip.querySelector('.react-aria-OverlayArrow');
    expect(arrow).toHaveStyle('position: absolute');
  });

  it('shows on focus', () => {
    let {getByRole} = renderTooltip();
    let button = getByRole('button');

    userEvent.tab();

    let tooltip = getByRole('tooltip');
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveClass('react-aria-Tooltip');
    expect(tooltip).toHaveAttribute('data-placement', 'top');
    expect(tooltip).toHaveStyle('position: absolute');

    let arrow = tooltip.querySelector('.react-aria-OverlayArrow');
    expect(arrow).toHaveStyle('position: absolute');
  });

  it('should support render props', () => {
    const {getByRole} = render(
      <TooltipTrigger delay={0}>
        <Button><span aria-hidden="true">✏️</span></Button>
        <Tooltip placement="bottom start">{({placement}) => `Content at ${placement}`}</Tooltip>
      </TooltipTrigger>
    );

    userEvent.tab();

    let tooltip = getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Content at bottom');
  });
});
