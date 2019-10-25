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
import Autocomplete from '../../Autocomplete';
import classNames from 'classnames';
import convertUnsafeMethod from '../../utils/convertUnsafeMethod';
import {FOCUS_RING_CLASSNAME} from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {TagList} from '../../TagList';
import Textfield from '../../Textfield';
import '../style/index.styl';

@convertUnsafeMethod
@autobind
export default class TagField extends React.Component {
  static propTypes = {
    /** Allow tag creation in tag field */
    allowCreate: PropTypes.bool,

    /** Allow duplicate tags in tag field */
    allowDuplicates: PropTypes.bool,

    /** Class to add to the tag field */
    className: PropTypes.string,

    /** Placeholder text to display if there are no tags nor text entered */
    placeholder: PropTypes.string,

    /** Whether the tag field is disabled */
    disabled: PropTypes.bool,

    /** Function to retrieve autocomplete options */
    getCompletions: PropTypes.func,

    /** Whether to disable the invalid icon and styling */
    invalid: PropTypes.bool,

    /** Whether to use the quiet styling for the tag field */
    quiet: PropTypes.bool,

    /** List of tags to display */
    value: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
      ])
    ),

    /**
     * A function called when a tag is added or removed.
     * It is passed an array of strings containing the new tag list.
     */
    onChange: PropTypes.func,

    /**
     * A function that returns a wrapper component to render a list item label.
     * Useful in providing custom html to the rendered label.
     * Passed to the underlying Autocomplete component.
     */
    renderItem: PropTypes.func,

    /**
     * A function that takes a tag object and returns a custom Tag component
     * If this prop is not specified, tags will render with default behavior
     */
    renderTag: PropTypes.func
  };

  static defaultProps = {
    allowCreate: true,
    allowDuplicates: false,
    getCompletions: () => []
  };

  state = {
    value: '',
    tags: this.props.value || [],
    showMenu: false,
    isFocusVisible: false
  };

  UNSAFE_componentWillReceiveProps(props) {
    if (props.value && props.value !== this.state.value) {
      const deleting = props.value.length < this.state.tags.length;
      const hadFocus = this.taglist && ReactDOM.findDOMNode(this).contains(document.activeElement);
      this.setState({tags: props.value}, () => hadFocus && this.focus(deleting));
    }
  }

  onTextfieldChange(value) {
    this.setState({value});
  }

  onSelect(value) {
    let coercedValue = value.label || value;
    let areDuplicates = (a, b) => a === b || (a.label && b.label && a.label === b.label);
    if (!coercedValue || (!this.props.allowDuplicates && this.state.tags.some(t => areDuplicates(t, value)))) {
      return;
    }

    // Menu should always hide when item is selected.
    this.setState({value: '', showMenu: false});

    let tags = [...this.state.tags, value];
    this.onChange(tags);
  }

  onRemove(value) {
    let tags = this.state.tags.filter(t => t.label !== value && t !== value);
    this.onChange(tags);
  }

  onFocus() {
    this.setState({isFocusVisible: this.textfield && ReactDOM.findDOMNode(this.textfield).classList.contains(FOCUS_RING_CLASSNAME)});
  }

  onBlur() {
    this.setState({isFocusVisible: false});
  }

  focus(deleting) {
    if (this.taglist) {
      const dom = ReactDOM.findDOMNode(this.taglist);
      if (!dom.contains(document.activeElement)) {
        const nodes = dom.querySelectorAll('[role=row]');
        if (nodes.length && deleting) {
          nodes[nodes.length - 1].focus();
        } else {
          this.textfield.focus();
        }
      }
    }
  }

  onChange(tags) {
    if (this.props.value == null) {
      let deleting = tags.length < this.state.tags.length;
      this.setState({tags}, () => this.focus(deleting));
    }
    if (this.props.onChange) {
      this.props.onChange(tags.map(tag => tag.label || tag));
    }
  }

  onMenuToggle(showMenu) {
    // menu should not be shown when there is no value
    if (showMenu && this.state.value === '') {
      showMenu = false;
    }
    this.setState({showMenu});
  }

  render() {
    let {getCompletions, allowCreate, disabled, invalid, quiet, className, placeholder, renderTag, renderItem, ...props} = this.props;
    let {value, tags, showMenu, isFocusVisible} = this.state;

    delete props.onChange;

    return (
      <Autocomplete
        className={classNames('react-spectrum-TagField', 'spectrum-Textfield', {
          'spectrum-Textfield--quiet': quiet,
          'react-spectrum-TagField--quiet': quiet,
          'is-disabled': disabled,
          'is-invalid': invalid,
          [FOCUS_RING_CLASSNAME]: isFocusVisible
        }, className)}
        getCompletions={getCompletions}
        allowCreate={allowCreate}
        onSelect={this.onSelect}
        value={value}
        showMenu={showMenu}
        onChange={this.onTextfieldChange}
        onMenuToggle={this.onMenuToggle}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        renderItem={renderItem}>
        <TagList
          manageTabIndex={false}
          ref={tl => this.taglist = tl}
          disabled={disabled}
          onClose={this.onRemove}
          values={(!renderTag && tags.map(tag => tag.label || tag)) || undefined}
          aria-labelledby={props['aria-labelledby']}
          aria-label={props['aria-label']}>
          { renderTag && tags.map((tag, index) => renderTag(tag, index)) }
        </TagList>
        <Textfield
          ref={tf => this.textfield = tf}
          className="react-spectrum-TagField-input"
          autocompleteInput
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ''}
          {...props} />
      </Autocomplete>
    );
  }
}
