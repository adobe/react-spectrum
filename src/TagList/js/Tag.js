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
import Avatar from '../../Avatar';
import Button from '../../Button';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import CrossSmall from '../../Icon/core/CrossSmall';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('tags');
const formatMessage = messageFormatter(intlMessages);

/**
 * A tag is used to categorize content and display filters.
 */
@autobind
export default class Tag extends React.Component {
  static propTypes = {
    /** Avatar to use in the tag */
    avatar: PropTypes.string,

    /** Whether the tag is removable from the tag list */
    closeable: PropTypes.bool,

    /** Function to be executed upon tag closure */
    onClose: PropTypes.func,

    /** Whether the tag is disabled from user interaction */
    disabled: PropTypes.bool,

    /** Icon to use in the tag */
    icon: PropTypes.string,

    /** Whether the tag is selected */
    selected: PropTypes.bool,

    /** Whether the tag ought to be colored red to reflect invalid status */
    invalid: PropTypes.bool
  };

  static defaultProps = {
    closeable: false,
    disabled: false,
    selected: false
  }

  constructor(props) {
    super(props);
    this.state = {
      tagFocused: false
    };
  }

  handleButtonFocus(e) {
    this.setState({tagFocused: true});
  }

  handleButtonBlur(e) {
    this.setState({tagFocused: false});
  }

  render() {
    let {
      value,
      children,
      avatar,
      icon,
      closable = false,
      disabled = false,
      selected = false,
      invalid = false,
      className,
      onClose = function () {},
      tabIndex,
      role,
      ...otherProps
      } = this.props;
    let tag = this.tag;
    const {tagFocused} = this.state;
    const removeString = formatMessage('Remove');
    const childContent = children || value;
    const ariaLabel = childContent ? `${removeString}: ${childContent}` : {removeString};

    function handleKeyDown(e) {
      switch (e.keyCode) {
        case 46: // delete
        case 8: // backspace
        case 32: // space
          onClose(value || children, e);
          e.preventDefault();
          break;
      }
    }
    function handleButtonClick(e) {
      onClose(value || children, e);
      // If the button is clicked and this is a gridcell it must be a mouse event
      // Set focus to the tag rather than the button as that is where focus manager
      // expects it to be
      if (role === 'gridcell') {
        if (tag) {
          tag.focus();
        }
      }

    }


    return (
      <div
        ref={(t) => {this.tag = t;}}
        className={
          classNames(
            'spectrum-Tags-item',
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'spectrum-Tags-item--deletable': closable,
              'is-invalid': invalid
            },
            {'focus-ring': tagFocused},
            className
          )
        }
        tabIndex={tabIndex}
        aria-selected={!disabled && selected}
        onKeyDown={!disabled && closable ? (e => {handleKeyDown(e);}) : null}
        {...filterDOMProps(otherProps)}
        role={(role === 'gridcell') ? 'row' : undefined}>
        {avatar &&
          <Avatar alt="" src={avatar} aria-hidden="true" />
        }
        {cloneIcon(icon, {
          size: 'S',
          className: 'spectrum-Tags-itemIcon'
        })}
        <span
          role={role}
          className="spectrum-Tags-itemLabel">
          {childContent}
        </span>
        {closable &&
          <span role={role}>
            <Button
              tabIndex={(role === 'gridcell' || disabled) ? '-1' : undefined}
              aria-label={ariaLabel}
              className="spectrum-ClearButton--small"
              variant="clear"
              icon={<CrossSmall />}
              title={removeString}
              onClick={!disabled ? (e => {handleButtonClick(e);}) : null}
              onBlur={this.handleButtonBlur}
              onFocus={this.handleButtonFocus} />
          </span>
        }
      </div>
    );
  }
}
