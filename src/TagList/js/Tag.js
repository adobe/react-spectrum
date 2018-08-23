import Avatar from '../../Avatar';
import Button from '../../Button';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import CrossSmall from '../../Icon/core/CrossSmall';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('tags');

/**
 * A tag is used to categorize content and display filters.
 */
export default class Tag extends React.Component {
  static propTypes = {
    /** Avatar to use in the tag */
    avatar: PropTypes.string,
    
    /** Whether the tag is removable from the tag list */
    closeable: PropTypes.bool,
    
    /** Whether the tag is disabled from user interaction */
    disabled: PropTypes.bool,
    
    /** Icon to use in the tag */
    icon: PropTypes.string,
    
    /** Whether the tag is selected */
    selected: PropTypes.bool
  };
  
  static defaultProps = {
    closeable: false,
    disabled: false,
    selected: false
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
      ...otherProps
    } = this.props;
    const childContent = children || value;
    const ariaLabel = childContent ? `Remove ${childContent} label` : 'Remove label';

    return (
      <div
        className={
          classNames(
            'spectrum-Tags-item',
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'spectrum-Tags-item--deletable': closable,
              'is-invalid': invalid
            },
            className
          )
        }
        tabIndex={!disabled && selected ? 0 : -1}
        aria-selected={!disabled && selected}
        aria-label={ariaLabel}
        {...filterDOMProps(otherProps)}>
        {avatar &&
          <Avatar alt="" src={avatar} aria-hidden="true" />
        }
        {cloneIcon(icon, {
          size: 'S',
          className: 'spectrum-Tags-itemIcon'
        })}
        <span className="spectrum-Tags-itemLabel">
          {childContent}
        </span>
        {closable &&
          <Button
            className="spectrum-ClearButton--small"
            variant="clear"
            icon={<CrossSmall />}
            title="Remove"
            onClick={!disabled ? (e => {onClose(value || children, e); }) : null} />
        }
      </div>
    );
  }
}
