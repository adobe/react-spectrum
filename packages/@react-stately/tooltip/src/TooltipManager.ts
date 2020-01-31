class TooltipManager {
  constructor() {
    this.visibleTooltip = null;
    this.hoverHideTimeout = null;
    this.hoverShowTimeout = null;
  }
  showTooltipDelayed(tooltip, delay) {
    // do timing checks
    // this.showTooltip(tooltip)
  }
  showTooltip(tooltip) {
    // if this.visibleTooltip then this.hideTooltip
    // set this.visibleTooltip
    // set state to show
  }
  hideTooltipDelayed(delay) {
    // do timing checks
    // hideCurrentTooltip
  }
  hideCurrentTooltip() {
    // set this.visibleTooltip state to false
    // set this.visibleTooltip to null
  }
  isSameTarget(currentTriggerId, nextTriggertId) {
    currentTriggerId === nextTriggertId ? true : false
  }
};

let toolTipManager = new TooltipManager();
