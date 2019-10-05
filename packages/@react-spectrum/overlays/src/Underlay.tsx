import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React from 'react';
// eslint-disable-next-line monorepo/no-internal-import
import underlayStyles from '@spectrum-css/underlay/dist/index-vars.css';

interface UnderlayProps {
  isOpen?: boolean
}

export function Underlay({isOpen, ...props}: UnderlayProps) {
  return (
    <div
      {...filterDOMProps(props)}
      className={classNames(underlayStyles, 'spectrum-Underlay', {'is-open': isOpen})} />
  );
}
