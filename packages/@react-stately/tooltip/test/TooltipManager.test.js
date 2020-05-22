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

import {TooltipManager} from '../';

describe('TooltipManager', () => {

  it('can show a tooltip', () => {
    jest.useFakeTimers();
    let state = {
      open: jest.fn(),
      close: jest.fn()
    };
    
    let tooltipManager = new TooltipManager(state);

    expect(tooltipManager.visibleTooltip).toBeNull();
    tooltipManager.openTooltipDelayed();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 350);
    jest.runAllTimers();

    expect(state.open).toHaveBeenCalled();
    expect(tooltipManager.warmedup).toBeTruthy();

    expect(tooltipManager.visibleTooltip).toStrictEqual(state);
  });

  it('can hide the currently visible tooltip', () => {
    jest.useFakeTimers();
    let state = {
      open: jest.fn(),
      close: jest.fn()
    };
    let tooltipManager = new TooltipManager(state);
    tooltipManager.openTooltipDelayed();

    expect(tooltipManager.warmedup).toBeTruthy();
    tooltipManager.closeTooltipDelayed();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 220);
    jest.runAllTimers();

    expect(tooltipManager.visibleTooltip).toBeNull();
  });

  it('will close the currently open tooltip when showing a new one', () => {
    let state1 = {
      open: jest.fn(),
      close: jest.fn()
    };
    let tooltipManager1 = new TooltipManager(state1);
    expect(tooltipManager1.warmedup).toBeFalsy();

    tooltipManager1.openTooltip();

    let state2 = {
      open: jest.fn(),
      close: jest.fn()
    };
    let tooltipManager2 = new TooltipManager(state2);
    expect(tooltipManager1.warmedup).toBeFalsy();

    tooltipManager2.openTooltip();

    expect(state1.close).toHaveBeenCalled();
    expect(state2.open).toHaveBeenCalled();
    expect(tooltipManager1.visibleTooltip).toStrictEqual(state2);
    expect(tooltipManager2.visibleTooltip).toStrictEqual(state2);
  });

  it('will close the currently open tooltip without delay after warmup', () => {
    let state1 = {
      open: jest.fn(),
      close: jest.fn()
    };
    let tooltipManager1 = new TooltipManager(state1);
    expect(tooltipManager1.warmedup).toBeFalsy();

    tooltipManager1.openTooltipDelayed();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 350);
    jest.runAllTimers();
    expect(tooltipManager1.warmedup).toBeTruthy();

    let state2 = {
      open: jest.fn(),
      close: jest.fn()
    };
    let tooltipManager2 = new TooltipManager(state2);
    tooltipManager2.openTooltipDelayed();

    expect(setTimeout).not.toHaveBeenCalledTimes(2);
  
    expect(state1.close).toHaveBeenCalled();
    expect(state2.open).toHaveBeenCalled();
    expect(tooltipManager1.visibleTooltip).toStrictEqual(state2);
    expect(tooltipManager2.visibleTooltip).toStrictEqual(state2);
  });
});
