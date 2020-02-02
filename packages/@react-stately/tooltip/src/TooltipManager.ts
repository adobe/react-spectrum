import {TooltipManagerDelegate} from './types';

export class TooltipManager {

  delegate: TooltipManagerDelegate;
  visibleTooltip?: any; // TODO: figure out a type for this
  hoverHideTimeout?: () => void;
  hoverShowTimeout?: () => void;

  constructor() {
    this.visibleTooltip = null;
    this.hoverHideTimeout = null;
    this.hoverShowTimeout = null;
  }

  _closeTooltip(toggleOption: boolean) {
    this.delegate.closeTooltip(toggleOption);
  }

  _openTooltip(toggleOption: boolean) {
    this.delegate.openTooltip(toggleOption);
  }

  isSameTarget(currentTriggerId, nextTriggertId) {
    return currentTriggerId === nextTriggertId;
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
    console.log("hiding!!!!")
  }

}
