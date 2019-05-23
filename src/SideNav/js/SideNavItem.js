import autobind from 'autobind-decorator';
import {chain, interpretKeyboardEvent} from '../../utils/events';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import SideNav from './SideNav';

const NOOP = () => {};
const FOCUSABLE_SIDENAV_ITEMLINK_SELECTOR = '.spectrum-SideNav-itemLink[tabIndex]';

/**
 * An item in a sidenav
 */
@autobind
@focusRing
export default class SideNavItem extends Component {
  static propTypes = {
    /**
     * Custom className of sidenav to apply
     */
    className: PropTypes.string,

    /**
     * Whether the item is disabled
     */
    disabled: PropTypes.bool,

    /**
     * The label to display in the item
     */
    label: PropTypes.string,

    /**
     * The value of item
     */
    value: PropTypes.string,

    /**
     * The href of item
     */
    href: PropTypes.string,

    /**
     * The target type for item link
     */
    target: PropTypes.string,

    /**
     * Icon for item
     */
    icon: PropTypes.node,

    /**
     * Whether item should represent the current page within a set of pages or current location within an environment or context when selected.
     * See <a href="https://www.w3.org/TR/wai-aria-1.1/#aria-current" class="spectrum-Link">WAI-ARIA 1.1 definition of `aria-current (state)`</a>
     * attribute.
     */
    'aria-current': PropTypes.oneOf(['page', 'location']),

    /**
     * Whether the item is expanded in case of multi-level sidenav item
     */
    expanded: PropTypes.bool,

    /**
     * Whether the item is expanded at initialization in case of multi-level sidenav item
     */
    defaultExpanded: PropTypes.bool,

    /**
     * A function that returns a href wrapper component.
     * Useful in providing custom href component(eg. Link from react-router-dom).
     *
     * ```js
     *  <SideNavItem renderLink={(props) => <Link {...props} to="/">Foo</Link>}>
     *  </SideNavItem>
     * ```
     */
    renderLink: PropTypes.func,

    /**
     * A click handler for the item
     */
    onClick: PropTypes.func,

    /**
     * A select handler for the item
     */
    onSelect: PropTypes.func
  };

  static defaultProps = {
    'aria-current': 'page',
    disabled: false,
    target: '_self',
    onSelect: NOOP,
    onClick: NOOP
  }

  state = {
    expanded: this.props.defaultExpanded || this.props.expanded,
    focused: false
  }

  constructor(props) {
    super(props);
    this.id = createId();
  }

  get hasNestedNav() {
    const {children} = this.props;
    return children && typeof children !== 'string';
  }

  componentWillReceiveProps(nextProps) {
    const {expanded} = nextProps;
    if (expanded !== this.props.expanded) {
      this.setState(prevState => ({...prevState, expanded}));
    }
  }

  handleClick(e) {
    this.props.onClick(e);
    this.onSelectFocused(e);
  }

  onSelectFocused(e) {
    const {onSelect, value, expanded, href = e.target ? e.target.href : undefined} = this.props;
    let isKeyDown = e.type === 'keydown';
    if (!href || isKeyDown) {
      // When there is no href or if triggered from a keyboard event,
      // preventDefault and stopPropagation.
      e.preventDefault();
      e.stopPropagation();
      // If Enter of Space key pressed, trigger click event on event target
      if (isKeyDown && (e.key === 'Enter' || e.key === ' ')) {
        e.target.click();
        return;
      }
    }
    if (expanded === undefined) {
      this.setState((prevState) => ({...prevState, expanded: !prevState.expanded}));
    }
    onSelect(value, e);
  }

  /**
   * Keyboard event handler to interperet ArrowLeft/ArrowRight to collapse/expand section in multiLevel variant.
   * @param {KeyboardEvent} e Keyboard event
   */
  onKeyDown(e) {
    const {expanded} = this.state;
    const isExpandableTreeItem = this.props.role === 'treeitem' && this.hasNestedNav;
    switch (e.key) {
      case 'ArrowLeft':
      case 'Left':
        if (isExpandableTreeItem) {
          if (expanded) {
            this.onSelectFocused(e);
            this.focus();
          }
        }
        break;
      case 'ArrowRight':
      case 'Right':
        if (isExpandableTreeItem) {
          if (!expanded) {
            this.onSelectFocused(e);
          } else if (this.sideNavItemRef) {
            const links = Array.from(ReactDOM.findDOMNode(this).querySelectorAll(FOCUSABLE_SIDENAV_ITEMLINK_SELECTOR));
            if (links.indexOf(e.target) === 0) {
              links[1].focus();
            }

          }
        }
        break;
    }
  }

  onFocus() {
    this.setState({focused: true});
  }

  onBlur() {
    this.setState({focused: false});
  }

  setSideNavItemRef = s => this.sideNavItemRef = s;

  focus() {
    if (this.sideNavItemRef) {
      const link = ReactDOM.findDOMNode(this.sideNavItemRef).querySelector(FOCUSABLE_SIDENAV_ITEMLINK_SELECTOR);
      link.focus();
    }
  }

  getDescendantId(postfix) {
    const {
      id = this.id
    } = this.props;
    return postfix ? `${id}-${postfix}` : id;
  }

  renderLink(label, tabIndex, isTreeItem) {
    const {
      ariaLevel,
      hidden,
      id = this.id,
      icon,
      disabled,
      href,
      renderLink,
      role,
      target,
      _isSelected
    } = this.props;

    const ariaCurrent = this.props['aria-current'];

    const {
      expanded,
      focused
    } = this.state;

    const props = {
      href: disabled ? undefined : href,
      onClick: disabled ? undefined : this.handleClick,
      onFocus: disabled ? undefined : this.onFocus,
      onBlur: disabled ? undefined : this.onBlur,
      tabIndex: disabled ? undefined : tabIndex,
      className: classNames(
        'spectrum-SideNav-itemLink',
        {
          'is-selected': _isSelected,
          'is-disabled': disabled,
          'is-focused': focused,
          'is-hidden': hidden
        }
      ),
      id,
      role: (disabled || !href) && !isTreeItem ? 'link' : role,
      'aria-disabled': disabled || undefined,
      'aria-expanded': this.hasNestedNav && isTreeItem ? expanded : undefined,
      'aria-owns': this.hasNestedNav && isTreeItem && expanded ? this.getDescendantId('child-list') : undefined,
      'aria-selected': isTreeItem ? focused : undefined,
      'aria-current': _isSelected ? ariaCurrent : undefined,
      'aria-level': ariaLevel,
      target
    };

    if (renderLink) {
      return renderLink(props);
    }

    return (
      <a {...props}>
        {cloneIcon(icon, {className: 'spectrum-SideNav-itemIcon', size: 'S'})}
        {label}
      </a>);
  }

  render() {
    let {
      header,
      className,
      children,
      disabled,
      role,
      renderLink,
      id = this.id,
      value,
      _isSelected,
      _nestedNavValue,
      manageTabIndex,
      onSelect,
      ariaLevel,
      ...otherProps
    } = this.props;

    const {expanded, focused} = this.state;

    let {
      label,
      tabIndex = 0
    } = this.props;

    if (!label && !header) {
      label = children;
    }

    let isTreeItem = role === 'treeitem';
    let isCurrent = !!_nestedNavValue && value === _nestedNavValue;

    if (isTreeItem || manageTabIndex) {
      tabIndex = isCurrent ? tabIndex : -1;
    }

    delete otherProps.label;

    delete otherProps['aria-current'];

    return (
      <li
        className={
          classNames(
            'spectrum-SideNav-item',
            {
              'is-selected': _isSelected,
              'is-disabled': disabled,
              'is-focused': focused
            },
            className
          )
        }
        onKeyDown={disabled ? undefined : chain(this.onKeyDown, interpretKeyboardEvent.bind(this))}
        role={isTreeItem ? 'none' : undefined}
        ref={this.setSideNavItemRef}
        {...filterDOMProps(otherProps)}>
        { (label || renderLink) && this.renderLink(label, tabIndex, isTreeItem)
        }
        { header &&
          <h2 className="spectrum-SideNav-heading" id={this.getDescendantId('header')}>{header}</h2>
        }
        { this.hasNestedNav &&
          <SideNav
            role="none"
            variant={isTreeItem ? 'multiLevel' : undefined}
            id={this.getDescendantId('child')}
            aria-labelledby={header ? this.getDescendantId('header') : id}
            ariaLevel={ariaLevel + 1}
            hidden={isTreeItem ? !expanded : undefined}
            value={_nestedNavValue}
            onSelect={onSelect}>
            {children}
          </SideNav>
        }
      </li>
    );
  }
}
