import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useTableColumnResize} from '@react-aria/table/src/useTableColumnResize';


export default function Resizer(props) {
  const {state, layout, item} = props;
  let {resizerProps} = useTableColumnResize(state, layout, item);
  // console.log('from react-spectrum', state.isResizingColumn());
  return (
    <div {...resizerProps} className={classNames(styles, 'spectrum-Table-columnResizer')} />
  );
}
