import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {getBoundingClientRect} from './getBoundingClientRect';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import TabLine from './TabLine';
import TabListBase from './TabListBase';
import TabListDropdown from './TabListDropdown';
import '../style/index.styl';

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
    variant: PropTypes.oneOf(['compact', 'panel', 'anchored', '']),

    /** Whether the tab list should render using a quiet style */
    quiet: PropTypes.bool,

    /** The layout orientation of the tabs */
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),

    /**
     * Whether selection should be 'automatic' when a Tab receives keyboard focus
     * or 'manual' using Enter or Space key to select.
     */
    keyboardActivation: PropTypes.oneOf(['automatic', 'manual']),

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
    onChange: PropTypes.func,

    /**
     * If the parent is display flex or an explicit width is given to this component, then it can be
     * collapsible and you may set this to true.
     */
    collapsible: PropTypes.bool,
    
    /**
     * Whether to autoFocus first selected Tab or first Tab.
     */
    autoFocus: PropTypes.bool
  };

  static defaultProps = {
    variant: '',
    quiet: false,
    orientation: 'horizontal',
    collapsible: false,
    autoFocus: false
  };

  constructor(props) {
    super(props);

    this.debouncedResizeUpdate = null;
  }

  state = {
    selectedIndex: TabListBase.getDefaultSelectedIndex(this.props),
    tabArray: [],
    tooNarrow: false
  };

  componentWillReceiveProps(nextProps) {
    if ('selectedIndex' in nextProps) {
      this.setState({
        selectedIndex: nextProps.selectedIndex
      });
    }
    if (this.state.selectedIndex >= React.Children.toArray(nextProps.children).length) {
      this.onChange(TabListBase.getDefaultSelectedIndex(nextProps));
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeListener);
    this.updateTabs();
    this.widthCheck();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
    this.clearDebouncedResizeUpdateInterval();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      this.updateTabs();
      this.widthCheck();
    }
  }

  resizeListener() {
    if (!this.debouncedResizeUpdate) {
      this.debouncedResizeUpdate = setTimeout(() => {
        this.widthCheck();
        this.debouncedResizeUpdate = null;
      }, 50);
    }
  }

  clearDebouncedResizeUpdateInterval() {
    if (this.debouncedResizeUpdate) {
      clearTimeout(this.debouncedResizeUpdate);
      this.debouncedResizeUpdate = null;
    }
  }

  // will need to change to left probably if dealing with rtl
  getFurthestPoint(elem) {
    return getBoundingClientRect(elem).right;
  }

  widthCheck() {
    const tabList = ReactDOM.findDOMNode(this);
    // since tab array is in state, we don't necessarily have the most recent if we just use
    // state.tabArray, so get the tabs for the width check
    const tabs = ReactDOM.findDOMNode(this).querySelectorAll('.spectrum-Tabs-item');

    let farEdgeTabList = this.getFurthestPoint(tabList);
    let farEdgeLastTab = this.getFurthestPoint(tabs[tabs.length - 1]);
    if (farEdgeTabList < farEdgeLastTab) {
      this.setState({tooNarrow: true});
    } else {
      this.setState({tooNarrow: false});
    }
  }

  updateTabs() {
    // Measure the tabs so we can position the line below correctly
    const tabArray = ReactDOM.findDOMNode(this).querySelectorAll('.spectrum-Tabs-item');
    this.setState({tabArray});
  }

  onChange(selectedIndex) {
    let lastSelectedIndex = this.state.selectedIndex;

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

  getTabList() {
    let {
      className,
      orientation = 'horizontal',
      variant = '',
      quiet,
      children,
      defaultSelectedIndex,
      collapsible,
      ...otherProps
    } = this.props;

    let {
      selectedIndex,
      tabArray,
      tooNarrow
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

    let tooNarrowProps = {};
    let shouldHide = false;
    if (collapsible && tooNarrow && orientation !== 'vertical') {
      tooNarrowProps['aria-hidden'] = tooNarrow;
      shouldHide = true;
    }

    return (
      <TabListBase
        {...tooNarrowProps}
        orientation={orientation}
        defaultSelectedIndex={defaultSelectedIndex || null}
        selectedIndex={selectedIndex}
        {...otherProps}
        className={classNames(
          'spectrum-Tabs',
          `spectrum-Tabs--${orientation}`,
          {
            'spectrum-Tabs--quiet': quiet,
            [`spectrum-Tabs--${variant}`]: variant,
            'react-spectrum-Tabs--container': collapsible,
            'react-spectrum-Tabs--hidden': shouldHide
          },
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

  getDropdown() {
    let {
      quiet,
      children,
      'aria-labelledby': ariaLabelledby,
      'aria-label': ariaLabel
    } = this.props;

    let {
      selectedIndex
    } = this.state;

    return (
      <TabListDropdown
        className={classNames(
          {'spectrum-Tabs--quiet': quiet}
        )}
        selectedIndex={selectedIndex}
        onChange={this.onChange}
        quiet={quiet}
        aria-labelledby={ariaLabelledby}
        aria-label={ariaLabel}>
        {children}
      </TabListDropdown>
    );
  }

  render() {
    let {
      collapsible,
      orientation
    } = this.props;

    let {
      tooNarrow
    } = this.state;

    if (collapsible && orientation !== 'vertical') {
      return (
        <div className={classNames('react-spectrum-Tabs--collapsible')}>
          {this.getTabList()}
          {tooNarrow &&
            this.getDropdown()
          }
        </div>
      );
    } else {
      return this.getTabList();
    }
  }
}
