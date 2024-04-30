/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ColorThumb, ColorWheel, ColorWheelContext} from '../';
import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestColorWheel = ({wheelProps, thumbProps}) => (
  <ColorWheel defaultValue="hsl(0, 100%, 50%)" outerRadius={100} innerRadius={80} {...wheelProps}>
    <ColorThumb {...thumbProps} />
  </ColorWheel>
);

let renderColorWheel = (wheelProps, thumbProps) => render(<TestColorWheel wheelProps={wheelProps} thumbProps={thumbProps} />);

describe('ColorWheel', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should render a color wheel with default class', () => {
    let {getByRole} = renderColorWheel();
    let slider = getByRole('slider');
    expect(slider.parentElement.parentElement).toHaveAttribute('class', 'react-aria-ColorWheel');
    expect(slider).toHaveAttribute('aria-label', 'Hue');
    expect(slider.parentElement.parentElement.querySelector('.react-aria-ColorThumb')).toBeInTheDocument();
  });

  it('should render a color wheel with custom class', () => {
    let {getByRole} = renderColorWheel({className: 'test'});
    let slider = getByRole('slider');
    expect(slider.parentElement.parentElement).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = renderColorWheel({'data-foo': 'bar'});
    let wrapper = getByRole('slider').parentElement.parentElement;
    expect(wrapper).toHaveAttribute('data-foo', 'bar');
  });

  it('should support render props', () => {
    let {getByTestId} = render(
      <ColorWheel isDisabled defaultValue="hsl(0, 100%, 50%)" outerRadius={100} innerRadius={80}>
        {({isDisabled}) => (
          <div className={`${isDisabled ? 'disabled' : ''}`} data-testid="wrapper">
            <ColorThumb />
          </div>
        )}
      </ColorWheel>
    );
    expect(getByTestId('wrapper')).toHaveClass('disabled');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ColorWheelContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestColorWheel wheelProps={{slot: 'test'}} />
      </ColorWheelContext.Provider>
    );

    let slider = getByRole('slider');
    expect(slider.parentElement.parentElement).toHaveAttribute('slot', 'test');
    expect(slider).toHaveAttribute('aria-label', 'test');
  });

  it('should support focus ring', async () => {
    let {getByRole} = renderColorWheel({}, {className: ({isFocusVisible}) => `thumb ${isFocusVisible ? 'focus' : ''}`});
    let slider = getByRole('slider');
    let thumb = slider.closest('.thumb');

    expect(thumb).not.toHaveAttribute('data-focus-visible');
    expect(thumb).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(slider);
    expect(thumb).toHaveAttribute('data-focus-visible', 'true');
    expect(thumb).toHaveClass('focus');

    await user.tab();
    expect(thumb).not.toHaveAttribute('data-focus-visible');
    expect(thumb).not.toHaveClass('focus');
  });

  it('should support dragging state', () => {
    let {getByRole} = renderColorWheel({}, {className: ({isDragging}) => `thumb ${isDragging ? 'dragging' : ''}`});
    let thumb = getByRole('slider').closest('.thumb');

    expect(thumb).not.toHaveAttribute('data-dragging');
    expect(thumb).not.toHaveClass('dragging');

    fireEvent.mouseDown(thumb);
    expect(thumb).toHaveAttribute('data-dragging', 'true');
    expect(thumb).toHaveClass('dragging');

    fireEvent.mouseUp(thumb);
    expect(thumb).not.toHaveAttribute('data-dragging');
    expect(thumb).not.toHaveClass('dragging');
  });

  it('should support hover state', async () => {
    let hoverStartThumbSpy = jest.fn();
    let hoverChangeThumbSpy = jest.fn();
    let hoverEndThumbSpy = jest.fn();
    let {getByRole} = renderColorWheel({}, {className: ({isHovered}) => `thumb ${isHovered ? 'hovered' : ''}`, onHoverStart: hoverStartThumbSpy, onHoverChange: hoverChangeThumbSpy, onHoverEnd: hoverEndThumbSpy});
    let thumb = getByRole('slider').closest('.thumb');

    expect(thumb).not.toHaveAttribute('data-hovered');
    expect(thumb).not.toHaveClass('hovered');

    await user.hover(thumb);
    expect(thumb).toHaveAttribute('data-hovered', 'true');
    expect(thumb).toHaveClass('hovered');
    expect(hoverStartThumbSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeThumbSpy).toHaveBeenCalledTimes(1);

    await user.unhover(thumb);
    expect(thumb).not.toHaveAttribute('data-hovered');
    expect(thumb).not.toHaveClass('hovered');
    expect(hoverEndThumbSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeThumbSpy).toHaveBeenCalledTimes(2);
  });

  it('should support disabled state', () => {
    let {getByRole} = renderColorWheel({isDisabled: true, className: ({isDisabled}) => isDisabled ? 'disabled' : ''}, {className: ({isDisabled}) => `thumb ${isDisabled ? 'disabled' : ''}`});
    let slider = getByRole('slider');
    let wrapper = slider.parentElement.parentElement;
    let thumb = slider.closest('.thumb');

    expect(slider).toBeDisabled();
    expect(thumb).toHaveAttribute('data-disabled', 'true');
    expect(thumb).toHaveClass('disabled');

    expect(wrapper).toHaveAttribute('data-disabled', 'true');
    expect(wrapper).toHaveClass('disabled');
  });
});
