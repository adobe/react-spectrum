import autobind from 'autobind-decorator';
import {chain} from '../../utils/events';
import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import FocusManager from '../../utils/FocusManager';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Children, cloneElement, Component} from 'react';
import '../style/index.styl';

importSpectrumCSS('sidenav');

const SIDENAV_ITEM_SELECTOR = '.spectrum-SideNav-itemLink:not(.is-hidden):not(.is-disabled)';
const SELECTED_SIDENAV_ITEM_SELECTOR = SIDENAV_ITEM_SELECTOR + '.is-selected';

const isNestedSelected = (props, value) => props.children && props.children.filter(c => {
  const {children} = c.props;
  if (children && typeof children !== 'string') {
    return isNestedSelected(c.props, value);
  }
  return c.props.value === value;
}).length !== 0;

@autobind
@focusRing
export default class SideNav extends Component {
  static propTypes = {
    /**
     * The variant of sidenav to display
     */
    variant: PropTypes.oneOf(['default', 'multiLevel']),

    /**
     * Whether SideNav should use roving tabIndex so that only one item can receive focus at a time. With multiLevel, this defaults to true.
     */
    manageTabIndex: PropTypes.bool,

    /**
     * Whether SideNav should use alphanumeric search to locate next item to focus. With multiLevel, this defaults to true.
     */
    typeToSelect: PropTypes.bool,

    /**
     * Custom className of sidenav to apply
     */
    className: PropTypes.string,

    /**
     * Value of selected Sidenav Item (use for controlled selection)
     */
    value: PropTypes.string,

    /**
     * Value of selected Sidenav Item at initialization
     */
    defaultValue: PropTypes.string,

    /**
     * Whether to automatically set focus to the seleted item when the component mounts.
     */
    autoFocus: PropTypes.bool,

    /**
     * Whether the sidenav is a child of a sidenav item
     */
    isNested: PropTypes.bool,

    /**
     * A select handler for the sidenav
     */
    onSelect: PropTypes.func
  };

  static defaultProps = {
    variant: 'default',
    manageTabIndex: false,
    typeToSelect: false,
    autoFocus: false,
    isNested: false,
    onSelect: () => {}
  }

  state = {
    value: this.props.defaultValue || this.props.value
  }

  constructor(props) {
    super(props);
    this.id = createId();
  }

  componentWillReceiveProps(nextProps) {
    const {value} = nextProps;
    if (value !== this.props.value) {
      this.setState({value});
    }
  }

  isSelected(child) {
    return child.props.value === this.state.value;
  }

  isDefaultSelected(child) {
    return child.props.value === this.props.defaultValue;
  }

  onSelect(value, e) {
    if (this.props.value === undefined) {
      this.setState({value});
    }
    this.props.onSelect(value, e);
  }

  isDefaultExpanded(child) {
    if (child.props.defaultExpanded !== undefined) {
      return child.props.defaultExpanded;
    }
    // Expand nested sidenav if any item is selected
    return Array.isArray(child.props.children) && isNestedSelected(child.props, this.state.value);
  }

  getListRole() {
    const {
      variant,
      isNested
    } = this.props;
    if (variant === 'multiLevel') {
      return isNested ? 'group' : 'tree';
    }
    return undefined;
  }

  render() {
    const {
      className,
      children,
      hidden,
      variant,
      id = this.id,
      role,
      manageTabIndex,
      typeToSelect,
      ariaLevel = 1,
      autoFocus,
      isNested,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      ...otherProps
    } = this.props;

    const isMultiLevel = variant === 'multiLevel';
    const Element = isNested ? 'div' : 'nav';

    delete otherProps.value;

    return (
      <Element
        id={id}
        hidden={hidden}
        aria-hidden={hidden}
        role={isNested ? 'presentation' : role}
        aria-label={!isNested ? ariaLabel : undefined}
        aria-labelledby={!isNested ? ariaLabelledby : undefined}
        className={classNames(className, 'react-spectrum-SideNav')}>
        <FocusManager
          itemSelector={SIDENAV_ITEM_SELECTOR}
          selectedItemSelector={SELECTED_SIDENAV_ITEM_SELECTOR}
          manageTabIndex={isMultiLevel || manageTabIndex}
          typeToSelect={isMultiLevel || typeToSelect}
          autoFocus={autoFocus}>
          <ul
            className={
              classNames(
                'spectrum-SideNav',
                {
                  'spectrum-SideNav--multiLevel': isMultiLevel
                }
              )
            }
            role={this.getListRole()}
            id={id + '-list'}
            {...filterDOMProps(otherProps)}>
            {Children.map(
              children,
              child => cloneElement(child,
                {
                  role: (isMultiLevel ? 'treeitem' : undefined),
                  hidden,
                  manageTabIndex,
                  ariaLevel: (isMultiLevel ? ariaLevel : undefined),
                  _nestedNavValue: this.state.value,
                  _isSelected: this.isSelected(child),
                  onSelect: chain(child.props.onSelect, this.onSelect),
                  defaultExpanded: this.isDefaultExpanded(child)
                }
               )
             )}
          </ul>
        </FocusManager>
      </Element>
    );
  }
}
