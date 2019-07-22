import {View} from './View';
import {ScrollView} from './ScrollView';

const KNOB_PADDING = 2;
const MIN_KNOB_HEIGHT = 20;
const MIN_OVERSCROLL_HEIGHT = 8;
const IS_MOBILE = 'ontouchstart' in global;
const KNOB_THICKNESS = IS_MOBILE ? 3 : 8;
const KNOB_COLOR = IS_MOBILE ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)';

export default class Scroller extends View {
  scrollView: ScrollView;
  knobWidth: number;
  knobHeight: number;
  trackHeight: number;
  value: number;
  hidden: boolean;
  isVertical: boolean;
  private _mouseDown: boolean;
  private _mouseOver: boolean;
  private _scrolling: boolean;
  private _dragOffset: number;
  private _valueAtDragStart: number;

  constructor(scrollView: ScrollView, orientation: 'horizontal' | 'vertical') {
    super();
    this.scrollView = scrollView;

    this.knobWidth = KNOB_THICKNESS;
    this.knobHeight = 0;
    this.trackHeight = 0;
    this.value = 0;
    this.hidden = false;
    this.isVertical = orientation !== 'horizontal';

    this.css({
      position: 'absolute',
      width: this.knobWidth + 'px',
      height: this.knobWidth + 'px',
      backgroundColor: KNOB_COLOR,
      borderRadius: KNOB_THICKNESS + 'px',
      top: 0,
      left: 0,
      opacity: 0,
      transition: 'opacity 200ms'
    });

    // set WAI-ARIA role="presentation" so that the scrollbar has no role
    this.setAttribute('role', 'presentation');

    this.onEvent('mouseDown', this.mouseDown.bind(this));
    this.onEvent('mouseOver', this.mouseOver.bind(this));
    this.onEvent('mouseOut', this.mouseOut.bind(this));

    this._mouseDown = false;
    this._mouseOver = false;
    this._scrolling = false;
    this._dragOffset = 0;
    this._valueAtDragStart = 0;

    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
  }

  updateScrollViewSize() {
    let hidden = this.isVertical ?
                 this.scrollView.contentSize.height <= this.scrollView.size.height :
                 this.scrollView.contentSize.width <= this.scrollView.size.width;
    if (hidden !== this.hidden) {
      this.css({visibility: hidden ? 'hidden' : 'visible'});
      this.hidden = hidden;
    }

    if (!hidden) {
      this.updateKnob();
    }
  }

  updateKnob() {
    let scrollViewSize = this.isVertical ? this.scrollView.size.height : this.scrollView.size.width;
    let contentSize = this.isVertical ? this.scrollView.contentSize.height : this.scrollView.contentSize.width;

    let proportion = scrollViewSize / contentSize;
    let knobHeight = Math.max(MIN_KNOB_HEIGHT, proportion * scrollViewSize);
    let trackHeight = scrollViewSize - knobHeight - (KNOB_PADDING * 2);

    let x = this.isVertical
      ? this.scrollView.size.width - this.knobWidth - KNOB_PADDING
      : KNOB_PADDING + trackHeight * this.value;
    let y = this.isVertical
      ? KNOB_PADDING + trackHeight * this.value
      : this.scrollView.size.height - this.knobWidth - KNOB_PADDING;

    let minVal = KNOB_PADDING;
    let maxVal = scrollViewSize - knobHeight - KNOB_PADDING;
    let val = this.isVertical ? y : x;

    if (val < minVal) {
      knobHeight = Math.max(MIN_OVERSCROLL_HEIGHT, knobHeight + (val + minVal));
      val = minVal;
    } else if (val > maxVal) {
      knobHeight = Math.max(MIN_OVERSCROLL_HEIGHT, knobHeight - (val - maxVal));
      val = scrollViewSize - knobHeight - KNOB_PADDING;
    }

    if (knobHeight !== this.knobHeight) {
      this.knobHeight = knobHeight;
      this.trackHeight = scrollViewSize - knobHeight - (KNOB_PADDING * 2);

      if (this.isVertical) {
        this.css({height: this.knobHeight + 'px'});
      } else {
        this.css({width: this.knobHeight + 'px'});
      }
    }

    [x, y] = this.isVertical ? [x, val] : [val, y];
    let transform = `translate3d(${x}px, ${y}px, 0)`;
    this.css({
      WebkitTransformorm: transform,
      transform: transform
    });
  }

  setValue(value: number) {
    this.value = value;
    this.updateKnob();
  }

  getDragOffset(e: MouseEvent) {
    return this.isVertical
         ? e.clientY - this.scrollView.getRect().y
         : e.clientX - this.scrollView.getRect().x;
  }

  private mouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    this._mouseDown = true;
    this._dragOffset = this.getDragOffset(e);
    this._valueAtDragStart = this.value;

    document.addEventListener('mousemove', this.mouseMove, false);
    document.addEventListener('mouseup', this.mouseUp, false);
  }

  private mouseMove(e: MouseEvent) {
    e.preventDefault();

    let offset = this.getDragOffset(e);
    let delta = offset - this._dragOffset;

    this.setValue(this._valueAtDragStart + delta / this.trackHeight);
    let contentOffset = this.scrollView.contentOffset.copy();
    if (this.isVertical) {
      contentOffset.y = this.value * (this.scrollView.contentSize.height - this.scrollView.size.height);
    } else {
      contentOffset.x = this.value * (this.scrollView.contentSize.width - this.scrollView.size.width);
    }
    this.scrollView.setContentOffset(contentOffset);
  }

  private mouseUp(e: MouseEvent) {
    e.preventDefault();

    this._mouseDown = false;

    document.removeEventListener('mousemove', this.mouseMove, false);
    document.removeEventListener('mouseup', this.mouseUp, false);

    setTimeout(() => {
      this.hide();
    }, 1000);
  }

  private mouseOver() {
    this._mouseOver = true;
  }

  private mouseOut() {
    this._mouseOver = false;

    setTimeout(() => {
      this.hide();
    }, 1000);
  }

  show() {
    this.css({opacity: 1});
  }

  hide() {
    if (!this._mouseOver && !this._mouseDown && !this._scrolling) {
      this.css({opacity: 0});
    }
  }

  scrollStarted() {
    if (!this._scrolling) {
      this._scrolling = true;
      this.show();
    }
  }

  scrollEnded() {
    if (this._scrolling) {
      this._scrolling = false;
      this.hide();
    }
  }

  flash() {
    if (this._scrolling || this._mouseDown || this._mouseOver) {
      return;
    }

    this.show();
    setTimeout(() => {
      this.hide();
    }, 1300);
  }
}
