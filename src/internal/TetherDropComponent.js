/* eslint react/no-unused-prop-types: 0 */
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Drop from 'tether-drop';

export default class TetherDropComponent extends Component {
  static propTypes = {
    position: PropTypes.string,
    classPrefix: PropTypes.string,
    dropClassName: PropTypes.string,
    openOn: PropTypes.string,
    // Customize how to constrain the popover so it pins to the edge of the window,
    // scroll container, etc, or if it flips when it would otherwise be clipped.
    // This is passed to tether internally. See http://tether.io/#constraints
    constraints: PropTypes.shape({
      to: PropTypes.string,
      attachment: PropTypes.string,
      pin: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
      ])
    }),
    content: PropTypes.node,
    children: PropTypes.node,
    hoverOpenDelay: PropTypes.number,
    hoverCloseDelay: PropTypes.number,
    onClickOutside: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    // Additional options to be passed to tether
    tetherOptions: PropTypes.shape({
      offset: PropTypes.string,
      targetOffset: PropTypes.string,
      targetModifier: PropTypes.string
    })
  };

  static defaultProps = {
    position: 'right center',
    classPrefix: 'coral-drop',
    dropClassName: '',
    openOn: null, // Null means we'll manually call .open() and .close() on the drop instance.
    constraints: null,
    onClickOutside: null,
    onOpen: function () {},
    onClose: function () {}
  };

  componentDidMount() {
    const {onClickOutside, open, openOn} = this.props;

    this.renderDrop();
    if (!openOn) {
      this.setVisibility(open);
    }

    if (onClickOutside) {
      document.addEventListener('click', this.handleClickOutside.bind(this), true);
    }
  }

  componentDidUpdate(previousProps) {
    const {content, children, classPrefix, openOn, open} = this.props;

    if (this.tetherDrop) {
      // TODO: There is not an easy way that I've found to update the position after it's set
      // with Tether.
      // if (position !== previousProps.position) { }
      if (content !== previousProps.content || classPrefix !== previousProps.classPrefix) {
        this.renderDropContent(content, classPrefix);
      }
      if (children !== previousProps.children) {
        this.tetherDrop.position();
      }
      if (!openOn && open !== previousProps.open) {
        this.setVisibility(open);
      }
    }
  }

  componentWillUnmount() {
    const {onClickOutside} = this.props;

    this.destroyDrop();

    if (onClickOutside) {
      document.removeEventListener('click', this.handleClickOutside.bind(this), true);
    }
  }

  getTetherDropNode() {
    return this.tetherDrop && this.tetherDrop.drop;
  }

  setVisibility(visible) {
    if (visible) {
      this.tetherDrop.open();
    } else {
      this.tetherDrop.close();
    }
  }

  handleClickOutside = e => {
    const {onClickOutside} = this.props;
    const tetherDropNode = this.getTetherDropNode();

    if (onClickOutside && tetherDropNode && !tetherDropNode.contains(e.target)) {
      onClickOutside(e);
    }
  };

  destroyDrop() {
    if (this.tetherDrop) {
      this.tetherDrop.destroy(); // this also cleans up the drop DOM node
      delete this.tetherDrop;
    }
  }

  renderDrop() {
    const {
      position,
      content,
      openOn,
      constraints,
      hoverOpenDelay,
      hoverCloseDelay,
      classPrefix,
      dropClassName,
      tetherOptions
    } = this.props;

    /** eslint new-cap **/
    const CoralDropContext = new Drop.createContext({
      classPrefix
    });

    this.tetherDrop = new CoralDropContext({
      target: this.refs.target,
      classes: dropClassName,
      position,
      openOn,
      hoverOpenDelay,
      hoverCloseDelay,
      content: ' ', // We'll manage the content ourselves
      tetherOptions: {
        constraints: constraints ? [constraints] : [],
        ...tetherOptions || {}
      }
    });

    this.tetherDrop.on('open', () => {
      // this.props.onOpen could change at any time.
      this.props.onOpen();
    });

    this.tetherDrop.on('close', () => {
      // this.props.onClose could change at any time.
      this.props.onClose();
    });

    this.renderDropContent(content, classPrefix);
  }

  renderDropContent(content, classPrefix) {
    const tooltipNode = this.getTetherDropNode();
    const contentNode = tooltipNode && tooltipNode.querySelector(`.${ classPrefix }-content`);
    if (contentNode) {
      ReactDOM.unstable_renderSubtreeIntoContainer(this, content, contentNode);
    }
  }

  render() {
    const {className, children} = this.props;
    return (
      <div className={ className } ref="target">
        { children }
      </div>
    );
  }
}

TetherDropComponent.displayName = 'TetherDropComponent';
