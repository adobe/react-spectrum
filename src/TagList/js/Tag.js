import Button from '../../Button';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';
import TagClose from '../../Icon/core/TagClose';
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
          'spectrum-TagList-item',
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
      {...filterDOMProps(otherProps)}>
      {avatar &&
        <img className="spectrum-TagList-item-avatar" alt="" src={avatar} aria-hidden="true" />
      }
      {cloneIcon(icon, {
        size: 'S',
        className: 'spectrum-TagList-item-icon'
      })}
      <span className="spectrum-TagList-item-label">
        {childContent}
      </span>
      {closable &&
        <Button
          className="spectrum-TagList-item-removeButton"
          type="button"
          variant="icon"
          icon={<TagClose />}
          title="Remove"
          onClick={!disabled && (e => {onClose(value || children, e); })} />
      }
    </div>
  );
}

Tag.displayName = 'Tag';
