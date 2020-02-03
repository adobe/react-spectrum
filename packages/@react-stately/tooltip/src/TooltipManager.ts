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
    this.visibleTooltips = {triggerId, state};
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






  showTooltipDelayed(state, triggerId) {

    if (this.hoverHideTimeout != null && this.visibleTooltips.triggerId === triggerId) {
      clearTimeout(this.hoverHideTimeout);
      this.hoverHideTimeout = null;
      return;
    }

    this.hoverShowTimeout = setTimeout(() => {
      this.hoverShowTimeout = null;
      state.setOpen(true);
      // Close previously open tooltip
      if (this.visibleTooltips) {
        this.visibleTooltips.state.setOpen(false);
      }
      this.visibleTooltips = {triggerId, state};
    }, 200);

  }


  hideTooltipDelayed(state) {
    if (this.hoverShowTimeout != null) {
      clearTimeout(this.hoverShowTimeout);
      this.hoverShowTimeout = null;
      return;
    }

    this.hoverHideTimeout = setTimeout(() => {
      this.hoverHideTimeout = null;
      state.setOpen(false);
      this.visibleTooltips = null;
    }, 200);

  }


}
