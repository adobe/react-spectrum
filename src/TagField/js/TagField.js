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
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {TagList} from '../../TagList';
import Textfield from '../../Textfield';
import '../style/index.styl';

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
    quiet: PropTypes.bool
  };

  static defaultProps = {
    allowCreate: true,
    allowDuplicates: false
  };

  state = {
    value: '',
    tags: this.props.value || []
  };

  componentWillReceiveProps(props) {
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
    value = value.label || value;
    if (!value || (!this.props.allowDuplicates && this.state.tags.includes(value))) {
      return;
    }

    this.setState({value: ''});

    let tags = [...this.state.tags, value];
    this.onChange(tags);
  }

  onRemove(value) {
    let tags = this.state.tags.filter(t => t !== value);
    this.onChange(tags);
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
      this.props.onChange(tags);
    }
  }

  render() {
    let {getCompletions, allowCreate, disabled, invalid, quiet, className, placeholder, ...props} = this.props;
    let {value, tags} = this.state;

    delete props.onChange;

    return (
      <Autocomplete
        className={classNames('react-spectrum-TagField', 'spectrum-Textfield', {
          'spectrum-Textfield--quiet': quiet,
          'react-spectrum-TagField--quiet': quiet,
          'is-disabled': disabled,
          'is-invalid': invalid
        }, className)}
        getCompletions={getCompletions}
        allowCreate={allowCreate}
        onSelect={this.onSelect}
        value={value}
        onChange={this.onTextfieldChange}>
        <TagList
          ref={tl => this.taglist = tl}
          disabled={disabled}
          onClose={this.onRemove}
          values={tags.map(tag => tag.label || tag)}
          aria-labelledby={this.props['aria-labelledby']}
          aria-label={this.props['aria-label']} />
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
