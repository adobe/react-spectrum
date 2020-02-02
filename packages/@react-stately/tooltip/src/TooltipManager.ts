export class TooltipManager {

  visibleTooltip?: any;
  hoverHideTimeout?: () => void;
  hoverShowTimeout?: () => void;

  constructor() {
    this.visibleTooltip = null;
    this.hoverHideTimeout = null;
    this.hoverShowTimeout = null;
  }

  showTooltipDelayed(tooltip, delay) {
    // do timing checks
    // this.showTooltip(tooltip)
    console.log('show tooltip delayed');
  }

  showTooltip(tooltip) {
    // if this.visibleTooltip then this.hideTooltip
    // set this.visibleTooltip
    // set state to show
  }

  hideTooltipDelayed(delay) {
    // do timing checks
    // hideCurrentTooltip
    console.log('hide tooltip delayed');
  }

  hideCurrentTooltip() {
    // set this.visibleTooltip state to false
    // set this.visibleTooltip to null
  }

  isSameTarget(currentTriggerId, nextTriggertId) {
    return currentTriggerId === nextTriggertId ? true : false;
  }
}

// let toolTipManager = new TooltipManager();
