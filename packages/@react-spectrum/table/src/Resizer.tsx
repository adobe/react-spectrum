/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useMessageFormatter} from '@react-aria/i18n';
import {useTableColumnResize} from '@react-aria/table';
import {useTableContext} from './TableView';

interface ResizerProps<T> {
  column: GridNode<T>,
  tableRef: RefObject<HTMLElement>,
  showResizer: boolean,
  onResizeDone: () => void
}

function Resizer<T>(props: ResizerProps<T>, ref: RefObject<HTMLDivElement>) {
  let {column, tableRef, showResizer} = props;
  let {columnState} = useTableContext();
  let formatMessage = useMessageFormatter(intlMessages);

  let {resizerProps} = useTableColumnResize({...props, label: formatMessage('columnResizer')}, columnState, ref);

  let style = {
    cursor: undefined,
    height: '100%',
    display: showResizer ? 'block' : 'none'
  };
  // always be 100% height? never? only while dragging? only while focused?
  if (showResizer && tableRef.current) {
    style.height = `${tableRef.current.offsetHeight}px`;
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
