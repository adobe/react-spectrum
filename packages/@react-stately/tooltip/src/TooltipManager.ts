export class TooltipManager {

  // TODO: figure out a type for visibleTooltips ... undefined at first then becomes an object
  visibleTooltips?: any;
  hoverHideTimeout?: () => void;
  hoverShowTimeout?: () => void;

  // Arbitrary timeout lengths in place for current demo purposes. Delays to be adjusted for warmup / cooldown logic PR
    // https://git.corp.adobe.com/Spectrum/spectrum-dna/blob/master/data/elements/tooltip/TooltipBase.mjs
    // https://git.corp.adobe.com/Spectrum/spectrum-dna/blob/aab3963cebeb16df0081a805a1394fbc2d46a851/data/globals/GlobalAnimation.mjs
  constructor() {
    this.visibleTooltips = null;
    this.hoverHideTimeout = null;
    this.hoverShowTimeout = null;
  }

  isSameTarget(currentTriggerId) {
    return currentTriggerId === visibleTooltips.triggerId;
  }

  updateTooltipState(state, triggerId)  {
    state.setOpen(!state.open);
    visibleTooltips = {triggerId, state};
  }

  showTooltip(tooltip) {
    state.setOpen(true);
    // Close previously open tooltip
    if (visibleTooltips) {
      visibleTooltips.state.setOpen(false);
    }
  }

  hideTooltip() {
    state.setOpen(false);
    visibleTooltips = null;
  }








  showTooltipDelayed(isDisabled, triggerId, state) {
    if (isDisabled) {
      return;
    }

    if (hoverHideTimeout != null && visibleTooltips.triggerId === triggerId) {
      clearTimeout(hoverHideTimeout);
      hoverHideTimeout = null;
      return;
    }

    hoverShowTimeout = setTimeout(() => {
      hoverShowTimeout = null;
      state.setOpen(true);
      // Close previously open tooltip
      if (visibleTooltips) {
        visibleTooltips.state.setOpen(false);
      }
      visibleTooltips = {triggerId, state};
    }, 300);

  }


  hideTooltipDelayed(state) {
    if (hoverShowTimeout != null) {
      clearTimeout(hoverShowTimeout);
      hoverShowTimeout = null;
      return;
    }

    hoverHideTimeout = setTimeout(() => {
      hoverHideTimeout = null;
      state.setOpen(false);
      visibleTooltips = null;
    }, 300);

  }


}
