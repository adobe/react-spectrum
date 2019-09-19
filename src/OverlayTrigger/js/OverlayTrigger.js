/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import autobind from 'autobind-decorator';
import {chain} from '../../utils/events';
import createId from '../../utils/createId';
import {modalManager} from '../../ModalContainer/js/ModalContainer.js';
import Overlay from './Overlay';
import ownerDocument from 'react-overlays/lib/utils/ownerDocument';
import PropTypes from 'prop-types';
import React, {cloneElement, Component} from 'react';
import ReactDOM from 'react-dom';

const triggerType = PropTypes.oneOf(['click', 'longClick', 'hover', 'focus']);
const MOUSE_BUTTONS = {left: 0};

/**
 * Check if value one is inside or equal to the of value
 *
 * @param {string} one
 * @param {string|array} of
 * @returns {boolean}
 */
function isOneOf(one, of) {
  if (Array.isArray(of)) {
    return of.indexOf(one) >= 0;
  }
  return one === of;
}

/**
 * Find all of the scrollable parents of a DOM node
 */
function getScrollParents(node) {
  let nodes = [];
  while (node.parentNode) {
    var style = window.getComputedStyle(node);

    // Look for scrollable nodes, both real and fake.
    if (/auto|scroll/.test(style.overflow + style.overflowY) || node.hasAttribute('data-scrollable')) {
      nodes.push(node);
    }

    node = node.parentNode;
  }

  return nodes;
}

/*
 * Class based on React-bootstrap
 * https://github.com/react-bootstrap/react-bootstrap/blob/master/src/OverlayTrigger.js
 */
@autobind
export default class OverlayTrigger extends Component {
  static propTypes = {
    ...Overlay.propTypes,
    /**
     * Specify which action or actions trigger Overlay visibility
     */
    trigger: PropTypes.oneOfType([
      triggerType, PropTypes.arrayOf(triggerType)
    ]),
    /**
     * A millisecond delay amount to show and hide the Overlay once triggered
     */
    delay: PropTypes.number,
    /**
     * A millisecond delay amount before showing the Overlay once triggered.
     */
    delayShow: PropTypes.number,
    /**
     * A millisecond delay amount before hiding the Overlay once triggered.
     */
    delayHide: PropTypes.number,
    /**
     * The initial visibility state of the Overlay. For more nuanced visibility
     * control, consider using the Overlay component directly.
     */
    defaultShow: PropTypes.bool,
    /**
     * Callback when the overlay trigger is blurred.
     */
    onBlur: PropTypes.func,
    /**
     * Callback when the overlay trigger is clicked.
     */
    onClick: PropTypes.func,
    /**
     * Callback when the overlay trigger receives focus.
     */
    onFocus: PropTypes.func,
    /**
     * Callback when the mouse leaves the overlay trigger.
     */
    onMouseOut: PropTypes.func,
    /**
     * Callback when the mouse is over the overlay trigger.
     */
    onMouseOver: PropTypes.func,
    /**
     * Callback when the overlay show is invoked, determined by the 'trigger' prop.
     */
    onShow: PropTypes.func,
    /**
     * Callback when the overlay is hidden.
     */
    onHide: PropTypes.func,
    /**
     * Will cause the overlay to show in a controlled state.
     */
    show: PropTypes.bool,
    /**
     * Overlay will be shifted by specified units in the placement's axis direction.
     */
    offset: PropTypes.number,
    /**
     * Overlay will be shifted by specified units in the placement's cross-axis direction.
     */
    crossOffset: PropTypes.number,
    /**
     * Whether overlay should be allowed to flip if it hits the boundary
     */
    flip: PropTypes.bool,
    /**
     * Grey's out the trigger and removes interaction.
     */
    disabled: PropTypes.bool,
    /**
     * By default, the body of the owning document. The overlay will do a hit test to see if it
     * extends outside the boundaries and move it to a new position if it collides.
     * Unused it would seem...
     */
    boundariesElement: PropTypes.oneOfType([
      PropTypes.func, PropTypes.string
    ]),
    /**
     * The last component or element to have focus before the overlay opened.
     * If undefined, overlay will use the document.activeElement before it opened as the lastFocus.
     * Set the lastFocus prop to override this default behavior.
     */
    lastFocus: PropTypes.oneOfType([
      PropTypes.element, PropTypes.object
    ])
  };

  static defaultProps = {
    defaultShow: false,
    trigger: ['hover', 'focus'],
    placement: 'left',
    offset: 0,
    crossOffset: 0,
    flip: true,
    disabled: false,
    delayHide: 100
  };

  constructor(props, context) {
    super(props, context);
    this.overlayId = createId();
    this._mountNode = null;
    this.longPressTimeout = null;
    this._lastFocus = props.lastFocus;
    this.boundariesElement = props.boundariesElement ? props.boundariesElement : () => ownerDocument(this).body;
    this.state = {
      show: props.show === undefined ? props.defaultShow : props.show
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('lastFocus' in nextProps && nextProps.lastFocus !== this.props.lastFocus) {
      this._lastFocus = nextProps.lastFocus;
    }
    if (nextProps.show !== this.props.show) {
      nextProps.show ? this.handleDelayedShow() : this.handleDelayedHide();
    }
  }

  componentDidMount() {
    this._mountNode = document.createElement('div');
    this.renderOverlay();

    this._scrollParents = getScrollParents(ReactDOM.findDOMNode(this));
    for (let node of this._scrollParents) {
      node.addEventListener('scroll', this.hide, false);
    }

    document.body.addEventListener('mouseUp', this.windowMouseUp);
  }

  componentDidUpdate(prevProps) {
    const isDisabled = prevProps.disabled;
    const shouldDisable = this.props.disabled;
    if (!isDisabled && shouldDisable) {
      this.hide();
    }
    this.renderOverlay();
  }

  componentWillUnmount() {
    modalManager.removeFromModal(this._overlay);
    ReactDOM.unmountComponentAtNode(this._mountNode);
    this._mountNode = null;

    clearTimeout(this._hoverShowDelay);
    clearTimeout(this._hoverHideDelay);

    if (this._scrollParents) {
      for (let node of this._scrollParents) {
        node.removeEventListener('scroll', this.hide, false);
      }

      this._scrollParents = null;
    }
    document.body.removeEventListener('mouseUp', this.windowMouseUp);
  }

  handleToggle(e) {
    if (this.state.show) {
      this.hide(e);
    } else {
      this.show(e);
    }
  }

  handleDelayedShow(e) {
    if (this._hoverHideDelay != null) {
      clearTimeout(this._hoverHideDelay);
      this._hoverHideDelay = null;
      return;
    }

    if (this.state.show || this._hoverShowDelay != null) {
      return;
    }

    const delay = this.props.delayShow != null ?
      this.props.delayShow : this.props.delay;

    if (!delay) {
      this.show(e);
      return;
    }

    this._hoverShowDelay = setTimeout(() => {
      this._hoverShowDelay = null;
      this.show(e);
    }, delay);
  }

  handleDelayedHide(e) {
    if (this._hoverShowDelay != null) {
      clearTimeout(this._hoverShowDelay);
      this._hoverShowDelay = null;
      return;
    }

    if (!this.state.show || this._hoverHideDelay != null) {
      return;
    }

    let delay = (!this.props.delayHide || this.props.delayHide === OverlayTrigger.defaultProps.delayHide) && this.props.delay != null ? this.props.delay : this.props.delayHide;

    if (!delay) {
      this.hide(e);
      return;
    }

    this._hoverHideDelay = setTimeout(() => {
      this._hoverHideDelay = null;
      this.hide(e);
    }, delay);
  }

  // Simple implementation of mouseEnter and mouseLeave.
  // React's built version is broken: https://github.com/facebook/react/issues/4251
  // for cases when the trigger is disabled and mouseOut/Over can cause flicker
  // moving from one child element to another.
  handleMouseOverOut(handler, e) {
    const target = e.currentTarget;
    const related = e.relatedTarget || e.nativeEvent.toElement;

    if (!related || related !== target && !target.contains(related)) {
      handler(e);
    }
  }

  show(e) {
    if (!this.state.show && !this.props.disabled) {
      this._lastFocus = this.rememberedFocus();
      this.setState({show: true});
      if (this.props.onShow) {
        this.props.onShow(e);
      }
    }
  }

  hide(e) {
    if (this.state.show) {
      this.setState({show: false});
      if (this.props.onHide) {
        this.props.onHide(e);
      }
    }
  }

  onMouseDown = (e) => {
    if (!this.props.disabled && e.button === MOUSE_BUTTONS.left) {
      this.longPressTimeout = setTimeout(() => {
        this.longPressTimeout = null;
        if (this.props.onLongClick) {
          this.props.onLongClick();
        }
        this.show(e);
      }, 250);
    }
  };

  onMouseUp = (e) => {
    if (!this.props.disabled && this.longPressTimeout && e.button === MOUSE_BUTTONS.left) {
      if (this.props.onClick) {
        this.props.onClick(e);
      }
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  };

  windowMouseUp = (e) => {
    if (e.button === MOUSE_BUTTONS.left && !ReactDOM.findDOMNode(this).contains(e.target) && this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  };

  onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      if (e.altKey || e.target === ReactDOM.findDOMNode(this.dropdownRef.triggerRef)) {
        e.preventDefault();
        this.show(e);
      }
    }
  }

  onHide(e) {
    // if we are in longClick mode and the onHide comes from the mouse up on the trigger, then ignore it
    // it's actually an onHide coming from rootClose
    if (
      isOneOf('longClick', this.props.trigger)
      && ReactDOM.findDOMNode(this).contains(e.target)
    ) {
      return;
    }
    if (this.props.show === undefined) {
      this.hide(e);
    } else if (this.props.onHide) {
      this.props.onHide(e);
    }
  }

  onExited(e) {
    this.restoreFocus(e);
    if (this.props.onExited) {
      this.props.onExited(e);
    }
  }

  rememberedFocus() {
    if (!this._lastFocus && document && document.activeElement !== document.body) {
      this._lastFocus = document.activeElement;
    }

    return this._lastFocus;
  }

  restoreFocus(overlay) {
    if (this._lastFocus && typeof this._lastFocus.focus === 'function') {
      if (document) {
        let node;
        if (overlay) {
          node = ReactDOM.findDOMNode(overlay);
        }
        if ((node &&
          (node === document.activeElement ||
            node.contains(document.activeElement))) ||
          document.activeElement === document.body) {
          this._lastFocus.focus();
        }
      }
      if (!this.props.lastFocus) {
        this._lastFocus = null;
      }
    }
  }

  makeOverlay(overlay, props) {
    let {
      target = this
    } = this.props;
    let {
      rootClose = true,
      ...overlayProps
    } = props;
    delete overlayProps.crossOffset;
    delete overlayProps.defaultShow;
    delete overlayProps.flip;
    delete overlayProps.boundariesElement;
    let topOverlayProps = {
      id: overlay.props.id || overlayProps.id,
      ...props
    };
    if (!overlay.props.id) {
      overlayProps.id = this.overlayId;
    }
    return (
      <Overlay
        {...topOverlayProps}
        show={this.state.show}
        onHide={this.onHide}
        onExited={this.onExited}
        target={target}
        rootClose={rootClose}>
        {cloneElement(overlay, overlayProps)}
      </Overlay>
    );
  }

  renderOverlay() {
    // Only add overlay to modalManager when it is shown.
    if (this._overlay.props.show) {
      modalManager.addToModal(this._overlay, true);
    }

    ReactDOM.unstable_renderSubtreeIntoContainer(
      this, this._overlay, this._mountNode
    );
  }

  render() {
    const {
      trigger,
      show,
      selected = this.state.show,
      ...props
    } = this.props;

    delete props.delay;
    delete props.delayShow;
    delete props.delayHide;
    delete props.defaultShow;
    delete props.onShow;
    delete props.onHide;

    const [triggerChild, overlayChild] = React.Children.toArray(this.props.children);
    const triggerProps = {};
    delete props.children;

    // When Tooltip is shown,
    if (this.state.show && overlayChild.type && overlayChild.props.role === 'tooltip') {
      // Tooltip element id should match trigger element's aria-describedby value,
      if (!props.id) {
        props.id = overlayChild.props.id || this.overlayId;
      }

      // Tooltip should add aria-describedby attribute to trigger element.
      triggerProps['aria-describedby'] = props.id;
    }

    // Attach trigger events in case on un-controlled overlay
    if (show === undefined) {
      if (isOneOf('click', trigger) && !isOneOf('longClick', trigger)) {
        triggerProps.onClick = chain(this.props.onClick, this.handleToggle);
      }

      if (isOneOf('longClick', trigger)) {
        delete props.onClick;
        triggerProps.onMouseDown = this.onMouseDown;
        triggerProps.onMouseUp = this.onMouseUp;
        triggerProps.onKeyDown = this.onKeyDown;
      }

      if (isOneOf('hover', trigger)) {
        triggerProps.onMouseOver = this.handleMouseOverOut.bind(this, this.handleDelayedShow);
        triggerProps.onMouseOut = this.handleMouseOverOut.bind(this, this.handleDelayedHide);
        props.onMouseOver = this.handleMouseOverOut.bind(this, this.handleDelayedShow);
        props.onMouseOut = this.handleMouseOverOut.bind(this, this.handleDelayedHide);
        // overlay should not trap focus when trigger is 'hover'
        props.trapFocus = false;
      }

      if (isOneOf('focus', trigger)) {
        triggerProps.onFocus = this.handleDelayedShow;
        triggerProps.onBlur = this.handleDelayedHide;
        props.onFocus = this.handleDelayedShow;
        props.onBlur = this.handleDelayedHide;

        // overlay should not trap focus when trigger is 'focus'
        props.trapFocus = false;
      }
    }

    triggerProps.selected = selected;

    // Remove previous overlay from modalManager
    if (this._overlay) {
      modalManager.removeFromModal(this._overlay);
    }

    this._overlay = this.makeOverlay(overlayChild, props);

    return cloneElement(triggerChild, triggerProps);
  }
}
