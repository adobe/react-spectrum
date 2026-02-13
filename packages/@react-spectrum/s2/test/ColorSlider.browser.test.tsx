/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {ColorSlider} from '../src';
import {describe, expect, it, vi} from 'vitest';
import {fireEvent} from '@testing-library/react';
import React from 'react';
import {render} from './utils/render';
import userEvent from '@testing-library/user-event';

describe('ColorSlider browser interactions', () => {
  it('supports pointer and keyboard interactions and fires change end', async () => {
    let onChange = vi.fn();
    let onChangeEnd = vi.fn();
    let user = userEvent.setup();

    let screen = await render(
      <ColorSlider
        channel="hue"
        defaultValue="hsl(0, 100%, 50%)"
        onChange={onChange}
        onChangeEnd={onChangeEnd} />
    );

    let slider = screen.getByRole('slider');

    fireEvent.pointerDown(slider, {pointerId: 1, buttons: 1});
    fireEvent.input(slider, {target: {value: '120'}});
    fireEvent.pointerUp(slider, {pointerId: 1});

    act(() => {slider.focus();});
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalled();
    expect(onChangeEnd).toHaveBeenCalled();
    expect(slider).toHaveAttribute('aria-valuetext');
  });
});
