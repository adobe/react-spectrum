import React from 'react';
import classNames from 'classnames';
import Button from '../../Button';

const sizeMap = {
  L: 'large',
  M: 'medium',
  S: 'small'
};

export default function Tag({
  size = 'L', // L, M, S
  value,
  children,
  color,
  multiline = false,
  quiet = false,
  closable = false,
  disabled = false,
  selected = false,
  className,
  onClose = () => {},
  ...otherProps
}) {
  const childContent = children || value;
  const ariaLabel = childContent ? `Remove ${ childContent } label` : 'Remove label';

  return (
    <div
      className={
        classNames(
          'coral-Tag',
          `coral-Tag--${ sizeMap[size] }`,
          color ? `coral-Tag--${ color }` : null,
          {
            'coral-Tag--multiline': multiline,
            'coral-Tag--quiet': quiet,
            'is-closable': closable
          },
          className
        )
      }
      tabIndex={ !disabled && selected ? 0 : -1 }
      aria-selected={ !disabled && selected }
      aria-label={ ariaLabel }
      { ...otherProps }
    >
      {
        closable &&
        <Button
          className="coral-Tag-removeButton"
          role="button"
          tabIndex="-1"
          title="Remove"
          variant="minimal"
          size="M"
          iconSize="XS"
          icon="close"
          disabled={ disabled }
          square
          onClick={ !disabled && (e => { onClose(childContent, e); }) }
        />
      }
      <span className="coral-Tag-label">
        { childContent }
      </span>
    </div>
  );
}

Tag.displayName = 'Tag';
