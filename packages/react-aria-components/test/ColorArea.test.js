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

import {ColorArea, ColorAreaContext, ColorThumb} from '../';
import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestColorArea = ({sliderProps, thumbProps}) => (
  <ColorArea defaultValue="rgb(255, 0, 0)" xChannel="red" yChannel="green" {...sliderProps}>
    <ColorThumb {...thumbProps} />
  </ColorArea>
);

let renderColorArea = (sliderProps, thumbProps) => render(<TestColorArea {...{sliderProps, thumbProps}} />);

describe('ColorArea', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should render a color area with default class', () => {
    let {getByRole} = renderColorArea();
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'react-aria-ColorArea');
    expect(group.querySelector('.react-aria-ColorThumb')).toBeInTheDocument();
  });

  it('should render a slider with custom class', () => {
    let {getByRole} = renderColorArea({className: 'test'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = renderColorArea({'data-foo': 'bar'}, {'data-bar': 'foo'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-foo', 'bar');
    expect(group.querySelector('.react-aria-ColorThumb')).toHaveAttribute('data-bar', 'foo');
  });

  it('should support render props', () => {
    let {getByTestId} = render(
      <ColorArea isDisabled defaultValue="rgb(255, 0, 0)" xChannel="red" yChannel="green">
        {({isDisabled}) => (
          <div className={isDisabled ? 'disabled' : ''} data-testid="wrapper">
            <ColorThumb />
          </div>
        )}
      </ColorArea>
    );
    expect(getByTestId('wrapper')).toHaveClass('disabled');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ColorAreaContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestColorArea sliderProps={{slot: 'test'}} />
      </ColorAreaContext.Provider>
    );

    let group = getByRole('group');
    expect(group).toHaveAttribute('slot', 'test');
    expect(getByRole('slider')).toHaveAttribute('aria-label', 'test, Color picker');
  });

  it('should support focus ring', async () => {
    let {getByRole} = renderColorArea({}, {className: ({isFocusVisible}) => `thumb ${isFocusVisible ? 'focus' : ''}`});
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
    let {getByRole} = renderColorArea({}, {className: ({isDragging}) => `thumb ${isDragging ? 'dragging' : ''}`});
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
    let {getByRole} = renderColorArea({}, {className: ({isHovered}) => `thumb ${isHovered ? 'hovered' : ''}`, onHoverStart: hoverStartThumbSpy, onHoverChange: hoverChangeThumbSpy, onHoverEnd: hoverEndThumbSpy});
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
    let {getByRole} = renderColorArea({isDisabled: true, className: ({isDisabled}) => isDisabled ? 'disabled' : ''}, {className: ({isDisabled}) => `thumb ${isDisabled ? 'disabled' : ''}`});
    let wrapper = getByRole('group');
    let slider = getByRole('slider');
    let thumb = slider.closest('.thumb');

    expect(slider).toBeDisabled();
    expect(thumb).toHaveAttribute('data-disabled', 'true');
    expect(thumb).toHaveClass('disabled');

    expect(wrapper).toHaveAttribute('data-disabled', 'true');
    expect(wrapper).toHaveClass('disabled');
  });
});
