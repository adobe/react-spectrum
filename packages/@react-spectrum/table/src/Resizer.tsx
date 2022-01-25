import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useTableColumnResize} from '@react-aria/table/src/useTableColumnResize';


export default function Resizer(props) {
  const {state, item} = props;
  let {resizerProps} = useTableColumnResize(state, item);
  return (
    <div {...resizerProps} className={classNames(styles, 'spectrum-Table-columnResizer')} />
  );
}
