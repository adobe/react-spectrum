import classNames from 'classnames';
import React from 'react';

import '../style/index.styl';

export default function InputGroup({quiet, className, children}) {
  return (
    <div
      className={
        classNames(
          'coral-InputGroup',
          {
            'coral-InputGroup--quiet': quiet
          },
          className
        )
      }
    >
      {children}
    </div>
  );
}
