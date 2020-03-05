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
    let tooltipManager = new TooltipManager();
    let setOpenSpy = jest.fn();
    let tooltip = {open: false, setOpen: setOpenSpy, tooltipManager};
    let triggerId = 'triggerId-1';

    expect(tooltipManager.visibleTooltips).toBeNull();
    expect(tooltipManager.hoverHideTimeout).toBeNull();
    expect(tooltipManager.hoverShowTimeout).toBeNull();

    tooltipManager.showTooltipDelayed(tooltip, triggerId);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
    jest.runAllTimers();

    expect(setOpenSpy).toHaveBeenCalledWith(true);
    expect(tooltipManager.visibleTooltips).toStrictEqual({triggerId, state: tooltip});
    expect(tooltipManager.hoverHideTimeout).toBeNull();
    expect(tooltipManager.hoverShowTimeout).toBeNull();
  });

  it('can hide the currently visible tooltip', () => {
    jest.useFakeTimers();
    let tooltipManager = new TooltipManager();
    let setOpenSpy = jest.fn();
    let tooltip = {open: false, setOpen: setOpenSpy, tooltipManager};
    let triggerId = 'triggerId-1';

    tooltipManager.showTooltipDelayed(tooltip, triggerId);

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
    jest.runAllTimers();

    expect(setOpenSpy).toHaveBeenCalledWith(true);
    expect(tooltipManager.visibleTooltips).toStrictEqual({triggerId, state: tooltip});
    expect(tooltipManager.hoverHideTimeout).toBeNull();
    expect(tooltipManager.hoverShowTimeout).toBeNull();

    tooltipManager.hideTooltipDelayed(tooltip, triggerId);

    expect(tooltipManager.visibleTooltips).toStrictEqual({triggerId, state: tooltip});
    expect(tooltipManager.hoverHideTimeout).toBeTruthy();
    expect(tooltipManager.hoverShowTimeout).toBeNull();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
    jest.runAllTimers();
    expect(setOpenSpy).toHaveBeenCalledWith(false);
    expect(tooltipManager.visibleTooltips).toBeNull();
    expect(tooltipManager.hoverHideTimeout).toBeNull();
    expect(tooltipManager.hoverShowTimeout).toBeNull();
  });

  it('will close the currently open tooltip when showing a new one', () => {
    jest.useFakeTimers();
    let tooltipManager = new TooltipManager();
    let setOpenSpy = jest.fn();
    let tooltip = {open: false, setOpen: setOpenSpy, tooltipManager};
    let triggerId = 'triggerId-1';

    tooltipManager.showTooltipDelayed(tooltip, triggerId);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
    jest.runAllTimers();

    let setOpenSpy2 = jest.fn();
    let tooltip2 = {open: false, setOpen: setOpenSpy2, tooltipManager};
    let triggerId2 = 'triggerId-2';

    tooltipManager.showTooltipDelayed(tooltip2, triggerId2);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
    jest.runAllTimers();

    expect(setOpenSpy).toHaveBeenLastCalledWith(false);
    expect(setOpenSpy2).toHaveBeenCalledWith(true);
    expect(tooltipManager.visibleTooltips).toStrictEqual({triggerId: triggerId2, state: tooltip2});
    expect(tooltipManager.hoverHideTimeout).toBeNull();
    expect(tooltipManager.hoverShowTimeout).toBeNull();
  });

  it('will not show the tooltip if hidden before the delayed show completes', () => {
    jest.useFakeTimers();
    let tooltipManager = new TooltipManager();
    let setOpenSpy = jest.fn();
    let tooltip = {open: false, setOpen: setOpenSpy, tooltipManager};
    let triggerId = 'triggerId-1';

    tooltipManager.showTooltipDelayed(tooltip, triggerId);

    expect(tooltipManager.hoverShowTimeout).not.toBeNull();
    expect(tooltipManager.hoverHideTimeout).toBeNull();

    jest.advanceTimersByTime(100);
    expect(tooltipManager.visibleTooltips).toBeNull();
    expect(tooltipManager.hoverShowTimeout).not.toBeNull();
    expect(tooltipManager.hoverHideTimeout).toBeNull();

    tooltipManager.hideTooltip(tooltip);

    expect(setOpenSpy).toHaveBeenCalledWith(false);
    expect(tooltipManager.visibleTooltips).toBeNull();
  });

  it('will not show the first delayed tooltip if a second is delay shown before the first shows', () => {
    jest.useFakeTimers();
    let tooltipManager = new TooltipManager();
    let setOpenSpy = jest.fn();
    let tooltip = {open: false, setOpen: setOpenSpy, tooltipManager};
    let triggerId = 'triggerId-1';

    tooltipManager.showTooltipDelayed(tooltip, triggerId);
    expect(tooltipManager.hoverShowTimeout).not.toBeNull();
    expect(tooltipManager.hoverHideTimeout).toBeNull();

    jest.advanceTimersByTime(100);
    expect(tooltipManager.visibleTooltips).toBeNull();
    expect(tooltipManager.hoverShowTimeout).not.toBeNull();
    expect(tooltipManager.hoverHideTimeout).toBeNull();

    let setOpenSpy2 = jest.fn();
    let tooltip2 = {open: false, setOpen: setOpenSpy2, tooltipManager};
    let triggerId2 = 'triggerId-2';

    tooltipManager.showTooltipDelayed(tooltip2, triggerId2);

    expect(tooltipManager.hoverShowTimeout).not.toBeNull();
    expect(tooltipManager.hoverHideTimeout).toBeNull();
    expect(tooltipManager.visibleTooltips).toBeNull();

    // run past first tooltips show timer
    jest.advanceTimersByTime(150);
    // finish all the timers
    jest.runAllTimers();
    expect(setOpenSpy2).toHaveBeenCalledWith(true);
    expect(tooltipManager.visibleTooltips).toStrictEqual({triggerId: triggerId2, state: tooltip2});
  });
});
