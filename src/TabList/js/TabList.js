import autobind from 'autobind-decorator';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import TabListBase from './TabListBase';

importSpectrumCSS('tabs');

// For backward compatibility
const VARIANTS = {
  'panel': '',
  'anchored': '',
  'page': 'compact'
};

/**
 * A TabList displays a list of tabs
 */
@autobind
export default class TabList extends React.Component {
  static propTypes = {
    /** The visual style of the tab list */
    variant: PropTypes.oneOf(['compact', 'panel', 'anchored']),

    /** Whether the tab list should render using a quiet style */
    quiet: PropTypes.bool,

    /** The layout orientation of the tabs */
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),

    /**
     * The index of the Tab that should be selected (open). When selectedIndex is
     * specified, the component is in a controlled state and a Tab can only be selected by changing the
     * selectedIndex prop value. By default, the first Tab will be selected.
     */
    selectedIndex: PropTypes.number,

    /**
     * The same as selectedIndex except that the component is in an uncontrolled
     * state.
     */
    defaultSelectedIndex: PropTypes.number,

    /**
     * A function that will be called when an Tab is selected or deselected. It will be passed
     * the updated selected index.
     */
    onChange: PropTypes.func
  };

  static defaultProps = {
    variant: '',
    quiet: false,
    orientation: 'horizontal'
  };

  state = {
    selectedIndex: TabListBase.getDefaultSelectedIndex(this.props),
    tabArray: []
  };

  componentWillReceiveProps(nextProps) {
    if ('selectedIndex' in nextProps) {
      this.setState({
        selectedIndex: nextProps.selectedIndex
      });
    }
  }

  componentDidMount() {
    this.updateTabs();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      this.updateTabs();
    }
  }

  updateTabs() {
    if (this.tablistRef) {
      // Measure the tabs so we can position the line below correctly
      const tabArray = ReactDOM.findDOMNode(this.tablistRef).querySelectorAll('.spectrum-Tabs-item');
      this.setState({tabArray});
    }
  }

  onChange(selectedIndex) {
    var lastSelectedIndex = this.state.selectedIndex;

    // If selectedIndex is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedIndex' in this.props)) {
      this.setState({
        selectedIndex
      });
    }
    if (lastSelectedIndex !== selectedIndex && this.props.onChange) {
      this.props.onChange(selectedIndex);
    }
  }

  setTabListRef(tablist) {
    this.tablistRef = tablist;
  }

  render() {
    let {
      className,
      orientation = 'horizontal',
      variant = '',
      quiet,
      children,
      defaultSelectedIndex,
      ...otherProps
    } = this.props;

    let {
      selectedIndex,
      tabArray
    } = this.state;

    let selectedTab = tabArray[selectedIndex];

    // For backwards compatibility
    // let mappedVariant = VARIANTS[variant] !== undefined ? VARIANTS[variant] : variant;
    if (VARIANTS[variant] != null) {
      let message = `The "${variant}" variant of TabList has been deprecated.`;
      if (VARIANTS[variant]) {
        message += ` Please use the "${VARIANTS[variant]}" variant instead.`;
      } else {
        message += ' Please remove the variant prop to use the default variant instead.';
      }

      console.warn(message);
      variant = VARIANTS[variant];
    }

    return (
      <TabListBase
        ref={this.setTabListRef.bind(this)}
        orientation={orientation}
        defaultSelectedIndex={defaultSelectedIndex || null}
        selectedIndex={selectedIndex}
        {...otherProps}
        className={classNames(
          'spectrum-Tabs',
          `spectrum-Tabs--${orientation}`,
          {'spectrum-Tabs--quiet': quiet},
          variant ? `spectrum-Tabs--${variant}` : '',
          className
        )}
        onChange={this.onChange}>
        {children}
        {selectedTab &&
          <TabLine orientation={orientation} selectedTab={selectedTab} />
        }
      </TabListBase>
    );
  }
}

function TabLine({orientation, selectedTab}) {
  // Ideally this would be a DNA variable, but vertical tabs aren't even in DNA, soo...
  let verticalSelectionIndicatorOffset = 12;

  const style = {
    transform: orientation === 'vertical'
      ? `translateY(${selectedTab.offsetTop + verticalSelectionIndicatorOffset / 2}px)`
      : `translateX(${selectedTab.offsetLeft}px) `
  };

  if (orientation === 'horizontal') {
    style.width = `${selectedTab.offsetWidth}px`;
  } else {
    style.height = `${selectedTab.offsetHeight - verticalSelectionIndicatorOffset}px`;
  }

  return <div className="spectrum-Tabs-selectionIndicator" role="presentation" style={style} />;
}
