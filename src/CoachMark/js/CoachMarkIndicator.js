import autobind from 'autobind-decorator';
import classNames from 'classnames';
import CoachMark from './CoachMark';
import PropTypes from 'prop-types';
import React from 'react';

const FASTEST_SETINTERVAL_TIMEOUT = 10;

@autobind
export default class CoachMarkIndicator extends React.Component {
  static propTypes = {
    /** The selector is used to select the element the coach mark should attach to.
     * Any valid element query that will only return 1 element
     **/
    selector: PropTypes.string.isRequired,

    /** Quiet variant, uses a smaller indicator */
    quiet: PropTypes.bool,

    /** Fires when the coachmark changes position  */
    onPositioned: PropTypes.func
  };

  static defaultProps = {
    quiet: false,
    onPositioned: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      style: {
        position: 'relative'
      }
    };

    this.indicatorRef = null;
    this.debouncedResizeUpdate = null;
  }

  calculateDOMLocation(targetNode) {
    let {x, y, width, height} = targetNode.getBoundingClientRect();

    if (this.indicatorRef) {
      let {
        height: indicatorDiameter
      } = this.indicatorRef.getBoundingClientRect();

      indicatorDiameter += CoachMark.INDICATOR_OFFSET;
      this.setState({
        style: {
          position: 'absolute',
          top: y + (height / 2) - (indicatorDiameter / 2),
          left: x + (width / 2) - (indicatorDiameter / 2)
        }
      });
    }
  }

  resizeListener() {
    if (!this.debouncedResizeUpdate) {
      this.debouncedResizeUpdate = setTimeout(() => {
        this.updateTargetNode();
        this.debouncedResizeUpdate = null;
      }, 50);
    }
  }

  updateTargetNode() {
    if (this.indicatorRef) {
      let targetNode = document.querySelector(this.props.selector);

      if (targetNode) {
        this.calculateDOMLocation(targetNode);
      }

      return targetNode;
    }
    return null;
  }

  tryAttachToDOM() {
    if (!this.updateTargetNode()) {
      let tryCount = 0;

      if (this.attachInterval) {
        this.clearAttachInterval();
      }

      this.attachInterval = setInterval(() => {
        if (this.updateTargetNode() || tryCount > 10) {
          this.clearAttachInterval();
        }

        tryCount++;
      }, FASTEST_SETINTERVAL_TIMEOUT);
    }
  }

  async componentDidMount() {
    this.tryAttachToDOM();
    window.addEventListener('resize', this.resizeListener);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.selector !== this.props.selector) {
      this.tryAttachToDOM();
    }
    if (prevState.style.top !== this.state.style.top || prevState.style.left !== this.state.style.left) {
      this.props.onPositioned();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
    this.clearDebouncedResizeUpdateInterval();
    this.clearAttachInterval();
  }

  clearDebouncedResizeUpdateInterval() {
    if (this.debouncedResizeUpdate) {
      clearTimeout(this.debouncedResizeUpdate);
      this.debouncedResizeUpdate = null;
    }
  }

  clearAttachInterval() {
    if (this.attachInterval) {
      clearInterval(this.attachInterval);
      this.attachInterval = null;
    }
  }

  setReference(ref) {
    this.indicatorRef = ref;
  }

  render() {
    let {
      quiet,
      onClick
    } = this.props;

    let {
      style
    } = this.state;

    return (<div
      className={classNames(
        'spectrum-CoachMarkIndicator',
        {
          'spectrum-CoachMarkIndicator--quiet': quiet
        },
      )}
      onClick={onClick}
      ref={this.setReference}
      style={style}>
      <div className="spectrum-CoachMarkIndicator-ring" />
      <div className="spectrum-CoachMarkIndicator-ring" />
      <div className="spectrum-CoachMarkIndicator-ring" />
    </div>);
  }
}
