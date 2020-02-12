import {TooltipManager} from '../';

describe('TooltipManager', () => {

  it('can show a tooltip', async function () {
    let tooltipManager = new TooltipManager();
    let setOpenSpy = jest.fn();
    let tooltip = {open: false, setOpen: setOpenSpy, tooltipManager};
    let triggerId = 'triggerId-1';
    expect(tooltipManager.visibleTooltips).toBeNull();
    expect(tooltipManager.hoverHideTimeout).toBeNull();
    expect(tooltipManager.hoverShowTimeout).toBeNull();
    tooltipManager.showTooltipDelayed(tooltip, triggerId);
    await new Promise((a) => setTimeout(a, 200));
    expect(setOpenSpy).toHaveBeenCalledWith(true);
    expect(tooltipManager.visibleTooltips).toStrictEqual({triggerId, state: tooltip});
    expect(tooltipManager.hoverHideTimeout).toBeNull();
    expect(tooltipManager.hoverShowTimeout).toBeNull();
  });

  // More are coming ...
});
