import React from 'react';
import classNames from 'classnames';
import Portal from 'react-portal';

import { BACKDROP_MODAL, BACKDROP_STATIC, BACKDROP_NONE } from '../constants/backdrop-constants';

export default function DialogBackdrop({
  open = false,
  backdrop = BACKDROP_MODAL,
  onClose = () => {},
  className,
  ...otherProps
}) {
  if (backdrop === BACKDROP_NONE) {
    return null;
  }

  return (
    <Portal
      isOpened={ open }
    >
      <div
        className={
          classNames(
            'coral-Backdrop',
            {
              'is-open': open
            },
            className
          )
        }
        { ...otherProps }
        onClick={ backdrop !== BACKDROP_STATIC ? onClose : null }
        style={ { zIndex: 10009 } }
      />
    </Portal>
  );
}

DialogBackdrop.displayName = 'DialogBackdrop';
