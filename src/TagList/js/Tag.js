import Button from '../../Button';
import classNames from 'classnames';
import Icon from '../../Icon';
import React from 'react';
import '../style/index.styl';

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
          'spectrum-Tag',
          {
            'is-selected': selected,
            'is-disabled': disabled
          },
          className
        )
      }
      tabIndex={!disabled && selected ? 0 : -1}
      aria-selected={!disabled && selected}
      aria-label={ariaLabel}
      {...otherProps}>
      {avatar &&
        <img className="spectrum-Tag-avatar" src={avatar} />
      }
      {icon &&
        <Icon className="spectrum-Tag-icon" size="S" icon={icon} />
      }
      <span className="spectrum-Tag-label">
        {childContent}
      </span>
      {closable &&
        <Button
          className="spectrum-Tag-removeButton"
          type="button"
          variant="icon"
          title="Remove"
          onClick={!disabled && (e => {onClose(value || children, e); })} />
      }
    </div>
  );
}

Tag.displayName = 'Tag';
