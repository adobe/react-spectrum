import Avatar from '../../Avatar';
import Button from '../../Button';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';
import TagClose from '../../Icon/core/TagClose';

importSpectrumCSS('tags');

export default function Tag({
  value,
  children,
  avatar,
  icon,
  closable = false,
  disabled = false,
  selected = false,
  className,
  onClose = function () {},
  ...otherProps
}) {
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
            'spectrum-Tags-item--deletable': closable
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
        className: 'spectrum-Tags-item-icon'
      })}
      <span className="spectrum-Tags-item-label">
        {childContent}
      </span>
      {closable &&
        <Button
          className="spectrum-ClearButton--small"
          variant="clear"
          icon={<TagClose />}
          title="Remove"
          onClick={!disabled ? (e => {onClose(value || children, e); }) : null} />
      }
    </div>
  );
}

Tag.displayName = 'Tag';
