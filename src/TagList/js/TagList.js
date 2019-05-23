import {chain} from '../../utils/events';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import FocusManager from '../../utils/FocusManager';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React from 'react';
import Tag from './Tag';

importSpectrumCSS('tags');

/**
 * A TagList displays a list of Tags
 */
const TAGLIST_SELECTOR = '[role=row]:not([aria-disabled])';
const TAGLIST_SELECTED_SELECTOR = TAGLIST_SELECTOR + '[aria-selected=true]';

@focusRing
export default class TagList extends React.Component {
  
  static displayName = 'TagList';
  
  static propTypes = {
    /** Custom CSS class to add to the tag list */
    className: PropTypes.string,
  
    /** Whether to disable the tag list */
    disabled: PropTypes.bool,
  
    /** Name of tag list **/
    name: PropTypes.string,
  
    /** Function called when focus is taken away from the tag list */
    onBlur: PropTypes.func,
  
    /** Function called when a tag  in the tag list is closed */
    onClose: PropTypes.func,
  
    /** Function called when focus is put on the tag list */
    onFocus: PropTypes.func,
  
    /** Whether the tag list can only be read */
    readOnly: PropTypes.bool,
  
    /** Initial tags in the tag list */
    values: PropTypes.arrayOf(PropTypes.string)
  };

  static defaultProps = {
    readOnly: false,
    disabled: false,
    onClose: function () {},
    onFocus: function () {},
    onBlur: function () {},
    onChange: function () {}
  };

  state = {
    selectedIndex: null,
    focused: false
  }

  componentWillReceiveProps(nextProps) {
    if ('selectedIndex' in nextProps) {
      this.setState({
        selectedIndex: nextProps.selectedIndex
      });
    }
  }

  onClickItem(selectedIndex, e) {
    this.setSelectedIndex(selectedIndex, e);
  }

 
  setSelectedIndex(selectedIndex, e) {
    const lastSelectedIndex = this.state.selectedIndex;

    // If selectedIndex is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedIndex' in this.props)) {
      this.setState({
        selectedIndex
      });
    }

    if (lastSelectedIndex !== selectedIndex) {
      this.props.onChange(selectedIndex);
    }
  }

  handleFocus = e => {
    const {onFocus} = this.props;
    this.setState({focused: true});
    onFocus(e);
  }

  handleBlur = e => {
    const {onBlur} = this.props;
    this.setState({focused: false});
    onBlur(e);
  }


  baseChildProps(index, child = {props: {}}) {
    const {readOnly, onClose, disabled} = this.props;
    const {selectedIndex, focused} = this.state;
    return {
      key: index,
      selected: !disabled && focused && selectedIndex === index,
      tabIndex: !disabled && (selectedIndex === index || (!focused && selectedIndex === null)) ? 0 : -1,
      closable: !readOnly,
      disabled,
      onClick: chain(this.getChildOnClick(index), child.props.onClick),
      onFocus: chain(this.getChildOnFocus(index), child.props.onFocus),
      onClose,
      role: 'gridcell'
    };
  }

  getChildOnClick(index) {
    if (this.props.disabled) { return null; }
    const tagListOnClick = this.onClickItem.bind(this, index);
    return (e) => {
      tagListOnClick(e);
    };
  }

  getChildOnFocus(index) {
    if (this.props.disabled) {
      return null;
    }
    return (e) => {
      this.setSelectedIndex(index, e);
      this.handleFocus;
    };
  }

  renderChildren() {
    if (this.props.values) {
      return this.renderValues();
    }
    return React.Children.map(this.props.children, (child, index) =>
      React.cloneElement(child, this.baseChildProps(index, child))
    );
  }

  renderValues() {
    const {values} = this.props;
    return values.map((value, index) => (
      <Tag value={value} {...this.baseChildProps(index)}>
        {value}
      </Tag>
    ));
  }

  render() {
    const {
      className,
      name,
      readOnly,
      disabled,
      invalid,
      ...otherProps
    } = this.props;

    const {focused} = this.state;

    return (
      <FocusManager itemSelector={TAGLIST_SELECTOR} selectedItemSelector={TAGLIST_SELECTED_SELECTOR} orientation="horizontal">
        <div
          {...filterDOMProps(otherProps)}
          className={
            classNames(
              'spectrum-Tags',
              {
                'is-disabled': disabled
              },
              className
            )
          }
          name={name}
          readOnly={readOnly}
          disabled={disabled}
          role="grid"
          aria-atomic="false"
          aria-relevant="additions"
          aria-live={focused ? 'polite' : 'off'}
          aria-disabled={disabled}
          aria-invalid={invalid}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}>
          {this.renderChildren()}
        </div>
      </FocusManager>
    );
  }
}
