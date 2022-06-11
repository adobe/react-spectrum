/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useMessageFormatter} from '@react-aria/i18n';
import {useTableColumnResize} from '@react-aria/table';
import {useTableContext} from './TableView';


function Resizer(props, ref) {
  let {column, tableRef} = props;
  let {columnState} = useTableContext();
  let formatMessage = useMessageFormatter(intlMessages);

  let {resizerProps} = useTableColumnResize({...props, label: formatMessage('columnResizer')}, columnState, ref);

  let style = {
    cursor: undefined,
    height: '100%'
  };
  if (columnState.isResizingColumn && columnState.getResizingColumn() === column.key && tableRef.current) {
    style.height = tableRef.current.offsetHeight;
  }
  if (columnState.getColumnMinWidth(column.key) >= columnState.getColumnWidth(column.key)) {
    style.cursor = 'e-resize';
  } else if (columnState.getColumnMaxWidth(column.key) <= columnState.getColumnWidth(column.key)) {
    style.cursor = 'w-resize';
  } else {
    style.cursor = 'col-resize';
  }
  return (
    <div
      ref={ref}
      {...resizerProps}
      style={style}
      className={classNames(styles, 'spectrum-Table-columnResizer')} />
  );
}

const _Resizer = React.forwardRef(Resizer);
export {_Resizer as Resizer};
