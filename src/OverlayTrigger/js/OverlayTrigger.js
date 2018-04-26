
import autobind from 'autobind-decorator';
import Overlay from './Overlay';
import PropTypes from 'prop-types';
import React, {cloneElement, Component} from 'react';
import ReactDOM from 'react-dom';

const triggerType = PropTypes.oneOf(['click', 'hover', 'focus']);

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
     * An element or text to overlay next to the target.
     */
    onBlur: PropTypes.func,
    onClick: PropTypes.func,
    onFocus: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    onShow: PropTypes.func,
    onHide: PropTypes.func,
    show: PropTypes.oneOf([null]),
    offset: PropTypes.number,
    crossOffset: PropTypes.number,
    flip: PropTypes.bool,
    disabled: PropTypes.bool,
    boundariesElement: PropTypes.oneOfType([
      PropTypes.func, PropTypes.string
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
    boundariesElement: 'container'
  };

  constructor(props, context) {
    super(props, context);
    this._mountNode = null;
    this.state = {
      show: props.defaultShow
    };
  }

  componentDidMount() {
    this._mountNode = document.createElement('div');
    this.renderOverlay();

    this._scrollParents = getScrollParents(ReactDOM.findDOMNode(this));
    for (let node of this._scrollParents) {
      node.addEventListener('scroll', this.hide, false);
    }
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

    const delay = this.props.delayHide != null ?
      this.props.delayHide : this.props.delay;

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

  makeOverlay(overlay, props) {
    const overlayProps = {...props};
    delete overlayProps.crossOffset;
    delete overlayProps.defaultShow;
    delete overlayProps.flip;
    delete overlayProps.boundariesElement;
    delete overlayProps.shouldUpdatePosition;
    return (
      <Overlay
        {...props}
        show={this.state.show}
        onHide={this.hide}
        target={this.props.target || this}
        rootClose={isOneOf('click', this.props.trigger)}>
        {cloneElement(overlay, overlayProps)}
      </Overlay>
    );
  }

  renderOverlay() {
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this, this._overlay, this._mountNode
    );
  }

  render() {
    const {
      trigger,
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


    if (this.state.show && overlayChild.type.name === 'Tooltip') {
      triggerProps['aria-describedby'] = overlayChild.props.id;
    }

    if (isOneOf('click', trigger)) {
      triggerProps.onClick = this.handleToggle;
    }

    if (isOneOf('hover', trigger)) {
      triggerProps.onMouseOver = this.handleMouseOverOut.bind(this, this.handleDelayedShow);
      triggerProps.onMouseOut = this.handleMouseOverOut.bind(this, this.handleDelayedHide);
    }

    if (isOneOf('focus', trigger)) {
      triggerProps.onFocus = this.handleDelayedShow;
      triggerProps.onBlur = this.handleDelayedHide;
    }

    triggerProps.selected = this.state.show;

    this._overlay = this.makeOverlay(overlayChild, props);
    return cloneElement(triggerChild, triggerProps);
  }
}
