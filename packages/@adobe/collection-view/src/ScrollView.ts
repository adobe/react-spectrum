import DOMBackend from './dom/DOMBackend';
import {Point} from './Point';
import Scroller from './Scroller';
import {Size} from './Size';
import {View} from './View';

const MIN_DRAG_DELTA = 5;
const DECELERATION_FRICTION = 0.95;
const RUBBER_BAND_FRICTION = 0.55;
const ELASTIC_DECELERATION = 0.03;
const ELASTIC_ACCELERATION = 0.08;
const HIDE_INDICATORS = 0.1;
const MIN_VELOCITY = 0.01;

export interface ScrollViewOptions {
  backend?: any,
  rubberBandEffect?: {
    horizontal: boolean,
    vertical: boolean
  },
}

export class ScrollView extends View {
  backend: any;
  horizontalRubberBand: boolean;
  verticalRubberBand: boolean;
  protected _size: Size;
  protected _contentSize: Size;
  protected _contentOffset: Point;
  private _lineOffset: number;
  protected _scrolling: boolean;
  private _scrollTimeout: any;
  private _scrollEndTime: number;
  private _decelerating: boolean;
  private _dragging: boolean;
  private _tracking: boolean;
  private _startPosition: Point;
  private _startTouchPosition: Point;
  private _decelerationTimer: number;
  private _velocity: Point;
  protected inner: View;
  private verticalScroller: Scroller;
  private horizontalScroller: Scroller;

  constructor(options: ScrollViewOptions = {}) {
    super();

    this.backend = options.backend || DOMBackend;
    let {horizontal, vertical} = options.rubberBandEffect
                               ? options.rubberBandEffect
                               : {horizontal: false, vertical: true};
    this.horizontalRubberBand = horizontal;
    this.verticalRubberBand = vertical;

    this._size = new Size(0, 0);
    this._contentSize = new Size(0, 0);
    this._contentOffset = new Point(0, 0);
    this._lineOffset = 10;
    this._scrolling = false;
    this._scrollEndTime = 0;
    this._decelerating = false;
    this._dragging = false;
    this._tracking = false;

    // Add an attribute so other things can detect that our fake scrollview is actually scrollable.
    this.setAttribute('data-scrollable', 'true');

    this.css({
      position: 'relative',
      overflow: 'hidden'
    });

    this.bindScrollEvents();

    this.inner = new View;
    this.inner.css({
      position: 'absolute',
      transform: 'translate3d(0, 0, 0)'
    });

    this.updateAccessibilityAttributes(options);

    this.addChild(this.inner);

    this._decelerationAnimation = this._decelerationAnimation.bind(this);

    this.verticalScroller = new Scroller(this, 'vertical');
    this.addChild(this.verticalScroller);
    this.horizontalScroller = new Scroller(this, 'horizontal');
    this.addChild(this.horizontalScroller);
  }

  protected updateAccessibilityAttributes(props) {
    if (!props.role && !this.attrs.role) {
      this.setAttribute('role', 'presentation');
      if (this.inner) {
        this.inner.setAttribute('role', 'presentation');
      }
    }
    for (let key in props) {
      let value = props[key];
      switch (key) {
        case 'aria-multiselectable':
          // ignore aria-multiselectable
          break;
        case 'role':
          this.setAttribute(key, value);
          if (this.inner) {
            // set WAI-ARIA role of inner so that the scrolling content region has no role.
            this.inner.setAttribute('role', value === 'grid' ? 'rowgroup' : 'presentation');
          }
          break;
        default:
          if ((key === 'id' || /^aria-\w+/.test(key)) &&
              value !== this.attrs[key]) {
            this.setAttribute(key, value);
          }
          break;
      }
    }
  }

  private bindScrollEvents() {
    this.onEvent('wheel', this.scroll.bind(this));
    this.onEvent('touchStart', this.touchStart.bind(this));
    this.onEvent('touchMove', this.touchMove.bind(this));
    this.onEvent('touchEnd', this.touchEnd.bind(this));
    this.onEvent('touchCancel', this.touchEnd.bind(this));
    this.onEvent('scroll', this._onScroll.bind(this));
  }

  render() {
    return super.renderBackendView(this.backend);
  }

  /**
   * Get the outer size of the scroll view
   */
  get size(): Size {
    return this._size;
  }

  /**
   * Set the outer size of the scroll view
   */
  set size(size: Size) {
    this.setSize(size);
  }

  setSize(size: Size) {
    this._size = size;
    this.inner.css({
      width: size.width + 'px'
    });

    this.verticalScroller.updateScrollViewSize();
    this.horizontalScroller.updateScrollViewSize();
  }

  setContentSize(size: Size) {
    let oldSize = this._contentSize;
    this._contentSize = size;
    this.inner.css({
      width: size.width + 'px',
      height: size.height + 'px'
    });

    this.verticalScroller.updateScrollViewSize();
    this.horizontalScroller.updateScrollViewSize();

    if (oldSize.height < this.size.height && oldSize.height > this.size.height) {
      this.verticalScroller.flash();
    }
    if (oldSize.width < this.size.width && oldSize.width > this.size.width) {
      this.horizontalScroller.flash();
    }
  }

  /**
   * Get the height of the scrollable content
   */
  get contentSize(): Size {
    return this._contentSize;
  }

  /**
   * Set the height of the scrollable content
   */
  set contentSize(contentSize: Size) {
    this.setContentSize(contentSize);
  }

  /**
   * Prevent ScrollView itself from scrolling in response to focus events or screen reader
   */
  private _onScroll(e: MouseEvent) {
    e.preventDefault();
    const node = this.getDOMNode();
    if (node && node.scrollTop !== 0) {
      node.scrollTop = 0;
    }
  }

  protected scroll(e: WheelEvent) {
    let deltaX = e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? e.deltaX : e.deltaX * this._lineOffset; // TODO - lineOffset?
    let deltaY = e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? e.deltaY : e.deltaY * this._lineOffset;

    if (!this._scrolling) {
      this.scrollStarted(deltaX, deltaY);
    }

    if (this.setContentOffset(new Point(this._contentOffset.x + deltaX, this._contentOffset.y + deltaY))) {
      e.stopPropagation();
      e.preventDefault();
    }

    // So we don't constantly call clearTimeout and setTimeout,
    // keep track of the current timeout time and only reschedule
    // the timer when it is getting close.
    let now = Date.now();
    if (this._scrollEndTime <= now + 50) {
      this._scrollEndTime = now + 300;

      clearTimeout(this._scrollTimeout);
      this._scrollTimeout = setTimeout(() => {
        this.scrollEnded();
      }, 300);
    }
  }

  private scrollStarted(deltaX, deltaY) {
    this._scrolling = true;
    this.inner.css({pointerEvents: 'none'});
    if (deltaX !== 0) {
      this.horizontalScroller.scrollStarted();
    }
    if (deltaY !== 0) {
      this.verticalScroller.scrollStarted();
    }
  }

  protected scrollEnded() {
    this._scrolling = false;
    this.inner.css({pointerEvents: 'auto'});
    this.verticalScroller.scrollEnded();
    this.horizontalScroller.scrollEnded();
  }

  private _rubberBand(offset, d) {
    let x = Math.abs(offset);
    let res = (RUBBER_BAND_FRICTION * x * d) / (d + RUBBER_BAND_FRICTION * x);
    return offset < 0 ? -res : res;
  }

  /**
   * Updates offset of the inner scrollable view
   * @param offset
   * @returns true if offset changed, false otherwise
   */
  setContentOffset(offset: Point): boolean {
    // If decelerating, allow any offset, otherwise constrain it
    let constrainedX = this._decelerating ? offset.x : Math.max(0, Math.min(this._contentSize.width - this.size.width, offset.x));
    let constrainedY = this._decelerating ? offset.y : Math.max(0, Math.min(this._contentSize.height - this.size.height, offset.y));

    // If dragging, allow rubber banding
    if (this._dragging) {
      if (this.horizontalRubberBand) {
        constrainedX += this._rubberBand(offset.x - constrainedX, this.size.width);
      }
      if (this.verticalRubberBand) {
        constrainedY += this._rubberBand(offset.y - constrainedY, this.size.height);
      }
    }
    let newContentOffset = new Point(constrainedX, constrainedY);
    if (this._contentOffset.equals(newContentOffset)) {
      return false;
    }
    this._contentOffset = newContentOffset;

    let transform = `translate3d(${-this._contentOffset.x}px, ${-this._contentOffset.y}px, 0)`;
    this.inner.css({
      WebkitTransform: transform,
      transform: transform
    });

    let value = this._contentOffset.y / (this._contentSize.height - this.size.height);
    this.verticalScroller.setValue(value);
    value = this._contentOffset.x / (this._contentSize.width - this.size.width);
    this.horizontalScroller.setValue(value);

    this.emit('scroll', this._contentOffset);

    // Emit a fake scroll event on the actual DOM node so other things can pick it up.
    this.triggerEvent('scroll');
    return true;
  }

  /**
   * Get the scroll content offset
   */
  get contentOffset(): Point {
    return this._contentOffset;
  }

  /**
   * Set the scroll content offset
   */
  set contentOffset(offset: Point) {
    this.setContentOffset(offset);
  }

  private _getEventX(e: any) {
    // touch event
    if (e.targetTouches && e.targetTouches.length >= 1) {
      return e.targetTouches[0].clientX;
    }

    // mouse event
    return e.clientX;
  }

  private _getEventY(e: any) {
    // touch event
    if (e.targetTouches && e.targetTouches.length >= 1) {
      return e.targetTouches[0].clientY;
    }

    // mouse event
    return e.clientY;
  }

  private touchStart(event: TouchEvent) {
    if (this._tracking) {
      return;
    }

    event.preventDefault();

    // Cancel the current deceleration animation
    if (this._decelerating) {
      this._decelerating = false;
      cancelAnimationFrame(this._decelerationTimer);
    }

    this._tracking = true;
    this._dragging = false;

    this._startPosition = this._contentOffset;
    this._startTouchPosition = new Point(this._getEventX(event), this._getEventY(event));
    this._velocity = new Point(0, 0);
  }

  private touchMove(event: TouchEvent) {
    if (!this._tracking) {
      return;
    }

    let x = this._getEventX(event);
    let y = this._getEventY(event);
    let deltaX = this._startTouchPosition.x - x;
    let deltaY = this._startTouchPosition.y - y;

    if (!this._dragging) {
      if (Math.abs(deltaX) >= MIN_DRAG_DELTA || Math.abs(deltaY) >= MIN_DRAG_DELTA) {
        this._dragging = true;
        this._startTouchPosition = new Point(x, y);

        this.verticalScroller.scrollStarted();
        this.horizontalScroller.scrollStarted();
      }
    }

    if (this._dragging) {
      event.stopPropagation();

      let lastContentOffset = this._contentOffset;
      this.setContentOffset(new Point(this._startPosition.x + deltaX, this._startPosition.y + deltaY));

      let v = this._contentOffset.x - lastContentOffset.x;
      this._velocity.x = 0.8 * v + 0.2 * this._velocity.x;
      v = this._contentOffset.y - lastContentOffset.y;
      this._velocity.y = 0.8 * v + 0.2 * this._velocity.y;
    }
  }

  private touchEnd(event: TouchEvent) {
    this._tracking = false;

    if (this._dragging) {
      this._dragging = false;
      event.stopPropagation();

      this._decelerate(event);

      if (!this._decelerating) {
        this.verticalScroller.scrollEnded();
        this.horizontalScroller.scrollEnded();
      }
    }
  }

  private _decelerate(event: TouchEvent) {
    let isRubberBanding = this._contentOffset.x < 0 || this._contentOffset.x > this._contentSize.width - this.size.width ||
                          this._contentOffset.y < 0 || this._contentOffset.y > this._contentSize.height - this.size.height;
    if (Math.abs(this._velocity.x) > 1 || Math.abs(this._velocity.y) > 1 || isRubberBanding) {
      this._decelerating = true;
      this._decelerationTimer = requestAnimationFrame(this._decelerationAnimation);
    }
  }

  private _decelerationAnimation(t: number) {
    if (!this._decelerating) {
      return;
    }

    // Decelerate
    this._velocity.x *= DECELERATION_FRICTION;
    this._velocity.y *= DECELERATION_FRICTION;

    // Bounce back if we hit the edge
    let rubberBandX = 0;
    let rubberBandY = 0;

    if (this._contentOffset.x < 0) {
      rubberBandX = -this._contentOffset.x;
    } else if (this._contentOffset.x > this._contentSize.width - this.size.width) {
      rubberBandX = this._contentSize.width - this.size.width - this._contentOffset.x;
    }
    if (this._contentOffset.y < 0) {
      rubberBandY = -this._contentOffset.y;
    } else if (this._contentOffset.y > this._contentSize.height - this.size.height) {
      rubberBandY = this._contentSize.height - this.size.height - this._contentOffset.y;
    }

    if (rubberBandX !== 0) {
      if (rubberBandX * this._velocity.x <= 0) {
        this._velocity.x += rubberBandX * ELASTIC_DECELERATION;
      } else {
        this._velocity.x = rubberBandX * ELASTIC_ACCELERATION;
      }
    }
    if (rubberBandY !== 0) {
      if (rubberBandY * this._velocity.y <= 0) {
        this._velocity.y += rubberBandY * ELASTIC_DECELERATION;
      } else {
        this._velocity.y = rubberBandY * ELASTIC_ACCELERATION;
      }
    }

    this.setContentOffset(new Point(this._contentOffset.x + this._velocity.x, this._contentOffset.y + this._velocity.y));

    let vX = Math.abs(this._velocity.x);
    let vY = Math.abs(this._velocity.y);
    if (vX < HIDE_INDICATORS) {
      this.horizontalScroller.scrollEnded();
    }
    if (vY < HIDE_INDICATORS) {
      this.verticalScroller.scrollEnded();
    }

    if (vX < MIN_VELOCITY && vY < MIN_VELOCITY) {
      this._decelerating = false;
    }

    if (this._decelerating) {
      this._decelerationTimer = requestAnimationFrame(this._decelerationAnimation);
    }
  }
}
