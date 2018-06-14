import autobind from 'autobind-decorator';
import classNames from 'classnames';
import createId from '../../utils/createId';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

importSpectrumCSS('splitview');

const COLLAPSE_THREASHOLD = 50;
const ORIENTATIONS = {
  horizontal: 'width',
  vertical: 'height'
};

const CURSORS = {
  horizontal: {
    default: 'ew-resize',
    min: ['e-resize', 'w-resize'],
    max: ['w-resize', 'e-resize']
  },
  vertical: {
    default: 'ns-resize',
    min: ['s-resize', 'n-resize'],
    max: ['n-resize', 's-resize']
  }
};

@autobind
@focusRing
export default class SplitView extends React.Component {
  static propTypes = {
    /** A custom class name to apply to the split view */
    className: PropTypes.string,

    /** The orientation of the split view panes - horizontal or vertical */
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),

    /** Whether the split view is resizable */
    resizable: PropTypes.bool,

    /** Whether the primary pane of the split view is collapsible */
    collapsible: PropTypes.bool,

    /** A function that should be applied when the split view is dragged */
    onResize: PropTypes.func,

    /** A function that should be applied when dragging ends on the split view */
    onResizeEnd: PropTypes.func,

    /** The child index of the primary pane of the split view. 0 by default, meaning either left or top depending on orientation. */
    primaryPane: PropTypes.oneOf([0, 1]),

    /** The minimum size of the primary pane */
    primaryMin: PropTypes.number,

    /** The maximum size of the primary pane */
    primaryMax: PropTypes.number,

    /** The default size of the primary pane */
    primaryDefault: PropTypes.number,

    /** The minimum size of the secondary pane */
    secondaryMin: PropTypes.number,

    /** The maximum size of the secondary pane */
    secondaryMax: PropTypes.number
  };

  static defaultProps = {
    orientation: 'horizontal',
    resizable: true,
    collapsible: false,
    primaryPane: 0,
    primaryMin: 304,
    primaryMax: Infinity,
    primaryDefault: 304,
    secondaryMin: 304,
    secondaryMax: Infinity
  };

  primaryId = createId();
  state = {
    dividerPosition: this.props.primaryDefault,
    hovered: false,
    dragging: false
  };

  render() {
    let children = React.Children.toArray(this.props.children);
    if (children.length !== 2) {
      throw new Error(`SplitView must have 2 children, ${children.length} found.`);
    }

    let {primaryPane, orientation, resizable} = this.props;
    let dimension = ORIENTATIONS[orientation];
    let secondaryPane = Number(!primaryPane);
    let primary = (
      <div
        className="spectrum-SplitView-pane"
        style={{[dimension]: this.state.dividerPosition}}
        id={this.primaryId}>
        {children[primaryPane]}
      </div>
    );

    let secondary = (
      <div
        className="spectrum-SplitView-pane"
        style={{flex: 1}}>
        {children[secondaryPane]}
      </div>
    );

    return (
      <div
        ref={r => this.container = r}
        className={classNames('spectrum-SplitView', `spectrum-SplitView--${orientation}`, this.props.className)}
        onMouseMove={resizable ? this.onMouseMove : null}
        onMouseDown={resizable ? this.onMouseDown : null}
        onMouseLeave={resizable ? this.onMouseLeave : null}>
        {primaryPane === 0 ? primary : secondary}
        <div
          className={classNames('spectrum-SplitView-splitter', {
            'is-draggable': resizable,
            'is-hovered': this.state.hovered,
            'is-active': this.state.dragging,
            'is-collapsed-start': this.state.dividerPosition === 0 && primaryPane === 0,
            'is-collapsed-end': this.state.dividerPosition === 0 && primaryPane === 1,
          })}
          tabIndex={resizable ? 0 : null}
          role="separator"
          aria-valuenow={(this.state.dividerPosition - this.state.minPos) / (this.state.maxPos - this.state.minPos) * 100 | 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-controls={this.primaryId}
          aria-label={this.props['aria-label']}
          aria-labelledby={this.props['aria-labelledby']}
          onKeyDown={this.onKeyDown}>
          {resizable ? <div className="spectrum-SplitView-gripper" /> : null}
        </div>
        {primaryPane === 1 ? primary : secondary}
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize, false);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize, false);
  }

  onMouseMove(e) {
    this._over = true;
    if (this.state.dragging) {
      return;
    }

    this.updateCursor(e);
  }

  onMouseDown(e) {
    if (this.state.hovered) {
      window.addEventListener('mousemove', this.onMouseDragged, false);
      window.addEventListener('mouseup', this.onMouseUp, false);
      this.setState({dragging: true});
      this._offset = this.getOffset();
    }
  }

  getOffset() {
    let rect = this.container.getBoundingClientRect();
    return this.props.orientation === 'horizontal' ? rect.left : rect.top;
  }

  getPosition(e) {
    return this.props.orientation === 'horizontal' ? e.clientX : e.clientY;
  }

  onMouseDragged(e) {
    if (!this.state.dragging) {
      return;
    }

    e.preventDefault();

    let {primaryPane, collapsible} = this.props;
    let pos = this.getPosition(e) - this._offset;
    if (primaryPane === 1) {
      pos = this._size - pos;
    }

    if (collapsible && pos < this.state.minPos - COLLAPSE_THREASHOLD) {
      pos = 0;
    }

    this.updatePosition(pos);
    this.updateCursor(e);
  }

  onMouseUp(e) {
    if (!this.state.dragging) {
      return;
    }

    window.removeEventListener('mouseup', this.mouseUp, false);
    window.removeEventListener('mousemove', this.mouseDragged, false);

    this.setState({dragging: false});
    this.updateCursor(e);
    if (!this._over) {
      document.body.style.cursor = null;
    }

    if (this.props.onResizeEnd) {
      this.props.onResizeEnd(this.state.dividerPosition);
    }
  }

  onMouseLeave() {
    this._over = false;
    this.setState({hovered: false});
    if (!this.state.dragging) {
      document.body.style.cursor = null;
    }
  }

  resize() {
    this._size = this.props.orientation === 'horizontal' ? this.container.offsetWidth : this.container.offsetHeight;

    let {primaryMin, primaryMax, secondaryMin, secondaryMax} = this.props;
    this.setState({
      minPos: Math.max(primaryMin, this._size - secondaryMax),
      maxPos: Math.min(primaryMax, this._size - secondaryMin)
    }, () => {
      this.updatePosition(this.state.dividerPosition);
    });
  }

  updatePosition(x, isKeyboard = false) {
    this._lastPosition = this.state.dividerPosition;

    let pos = Math.max(this.state.minPos, Math.min(this.state.maxPos, x));
    if (this.props.collapsible && x === 0) {
      pos = 0;
    }

    if (pos !== this.state.dividerPosition) {
      this.setState({dividerPosition: pos});
      if (this.props.onResize) {
        this.props.onResize(pos);
      }

      if (isKeyboard && this.props.onResizeEnd) {
        this.props.onResizeEnd(pos);
      }
    }
  }

  updateCursor(e) {
    let over = this.state.dragging || this.dividerContainsPoint(this.getPosition(e));
    let wasOver = this.state.dragging ? false : this.state.hovered;

    if (!wasOver && over) {
      let {primaryPane, orientation} = this.props;
      let cursors = CURSORS[orientation];
      let cursor = cursors.default;
      if (this.state.dividerPosition <= this.state.minPos) {
        cursor = cursors.min[primaryPane];
      } else if (this.state.dividerPosition >= this.state.maxPos) {
        cursor = cursors.max[primaryPane];
      }

      this.setState({hovered: this._over});
      document.body.style.cursor = cursor;
    } else if (wasOver && !over) {
      this.setState({hovered: false});
      document.body.style.cursor = null;
    }
  }

  dividerContainsPoint(x) {
    x -= this.getOffset();
    if (this.props.primaryPane === 1) {
      x = this._size - x;
    }

    let padding = 10;

    let d1 = this.state.dividerPosition - padding;
    let d2 = this.state.dividerPosition + padding;

    return x >= d1 && x <= d2;
  }

  decrement(e) {
    e.preventDefault();
    this.updatePosition(this.state.dividerPosition + (this.props.primaryPane === 0 ? -10 : 10), true);
  }

  increment(e) {
    e.preventDefault();
    this.updatePosition(this.state.dividerPosition + (this.props.primaryPane === 0 ? 10 : -10), true);
  }

  onKeyDown(e) {
    if (!this.props.resizable) {
      return;
    }

    let {orientation, collapsible} = this.props;

    switch (e.key) {
      case 'Left':
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          this.decrement(e);
        }
        break;
      case 'Up':
      case 'ArrowUp':
        if (orientation === 'vertical') {
          this.decrement(e);
        }
        break;
      case 'Right':
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          this.increment(e);
        }
        break;
      case 'Down':
      case 'ArrowDown':
        if (orientation === 'vertical') {
          this.increment(e);
        }
        break;
      case 'Home':
        e.preventDefault();
        this.updatePosition(this.state.minPos, true);
        break;
      case 'End':
        e.preventDefault();
        this.updatePosition(this.state.maxPos, true);
        break;
      case 'Enter':
        if (collapsible) {
          e.preventDefault();
          this.updatePosition(this.state.dividerPosition === 0 ? this._lastPosition || this.state.minPos : 0, true);
        }
        break;
    }
  }
}
