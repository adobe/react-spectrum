/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useTableColumnResize} from '@react-aria/table';
import {useTableContext} from './TableView';


function Resizer(props, ref) {
  const {column} = props;
  let {columnState} = useTableContext();
  let {resizerProps} = useTableColumnResize({column}, columnState, ref);
  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        ref={ref}
        {...resizerProps}
        className={classNames(styles, 'spectrum-Table-columnResizer')}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize column"
        aria-labelledby={column.key}
        aria-valuenow={columnState.getColumnWidth(column.key)}
        aria-valuemin={columnState.getColumnMinWidth(column.key)}
        aria-valuemax={columnState.getColumnMaxWidth(column.key)} />
    </FocusRing>
  );
}

const _Resizer = React.forwardRef(Resizer);
export {_Resizer as Resizer};
