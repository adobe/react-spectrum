/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTableColumnResize} from '@react-aria/table';
import {useTableContext} from './TableView';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface ResizerProps<T> {
  column: GridNode<T>,
  showResizer: boolean,
  triggerRef: RefObject<HTMLDivElement>
}

function Resizer<T>(props: ResizerProps<T>, ref: RefObject<HTMLInputElement>) {
  let {column, showResizer} = props;
  let {state, columnState, isEmpty} = useTableContext();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {direction} = useLocale();

  let {inputProps, resizerProps} = useTableColumnResize({...props, label: stringFormatter.format('columnResizer'), isDisabled: isEmpty}, state, columnState, ref);

  let style = {
    cursor: undefined,
    height: '100%',
    display: showResizer ? undefined : 'none',
    touchAction: 'none'
  };
  if (columnState.getColumnMinWidth(column.key) >= columnState.getColumnWidth(column.key)) {
    style.cursor = direction === 'rtl' ? 'w-resize' : 'e-resize';
  } else if (columnState.getColumnMaxWidth(column.key) <= columnState.getColumnWidth(column.key)) {
    style.cursor = direction === 'rtl' ? 'e-resize' : 'w-resize';
  } else {
    style.cursor = 'col-resize';
  }

  return (
    <FocusRing within focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        role="presentation"
        style={style}
        className={classNames(styles, 'spectrum-Table-columnResizer')}
        {...resizerProps}>
        <VisuallyHidden>
          <input
            ref={ref}
            type="range"
            {...inputProps} />
        </VisuallyHidden>
      </div>
    </FocusRing>
  );
}

const _Resizer = React.forwardRef(Resizer);
export {_Resizer as Resizer};
