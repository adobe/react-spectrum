/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {MoveMoveEvent} from '@react-types/shared';
import React, {RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {TableColumnResizeState} from '@react-stately/table';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTableColumnResize} from '@react-aria/table';
import {useTableContext} from './TableView';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface ResizerProps<T> {
  column: GridNode<T>,
  showResizer: boolean,
  triggerRef: RefObject<HTMLDivElement>,
  onMoveResizer: (e: MoveMoveEvent) => void
}

function Resizer<T>(props: ResizerProps<T>, ref: RefObject<HTMLInputElement>) {
  let {column, showResizer} = props;
  let {state, columnState, isEmpty} = useTableContext();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {direction} = useLocale();
  const stateRef = useRef<TableColumnResizeState<T>>(null);
  stateRef.current = columnState;

  let {inputProps, resizerProps} = useTableColumnResize({
    ...props,
    label: stringFormatter.format('columnResizer'),
    isDisabled: isEmpty,
    onMove: (e) => {
      document.body.classList.remove(classNames(styles, 'resize-ew'));
      document.body.classList.remove(classNames(styles, 'resize-e'));
      document.body.classList.remove(classNames(styles, 'resize-w'));
      if (stateRef.current.getColumnMinWidth(column.key) >= stateRef.current.getColumnWidth(column.key)) {
        document.body.classList.add(direction === 'rtl' ? classNames(styles, 'resize-w') : classNames(styles, 'resize-e'));
      } else if (stateRef.current.getColumnMaxWidth(column.key) <= stateRef.current.getColumnWidth(column.key)) {
        document.body.classList.add(direction === 'rtl' ? classNames(styles, 'resize-e') : classNames(styles, 'resize-w'));
      } else {
        document.body.classList.add(classNames(styles, 'resize-ew'));
      }
      props.onMoveResizer(e);
    },
    onMoveEnd: () => {
      document.body.classList.remove(classNames(styles, 'resize-ew'));
      document.body.classList.remove(classNames(styles, 'resize-e'));
      document.body.classList.remove(classNames(styles, 'resize-w'));
    }
  }, state, columnState, ref);

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
    <>
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
      {/* Placeholder so that the title doesn't intersect with space reserved by the resizer when it appears. */}
      <div
        aria-hidden
        role="presentation"
        className={classNames(styles, 'spectrum-Table-columnResizerPlaceholder')} />
    </>
  );
}

const _Resizer = React.forwardRef(Resizer);
export {_Resizer as Resizer};
