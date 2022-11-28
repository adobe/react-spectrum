/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {MoveMoveEvent} from '@react-types/shared';
import React, {Key, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {TableLayoutState, useTableColumnResize} from '@react-aria/table';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTableContext} from './TableView';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface ResizerProps<T> {
  layout: TableLayoutState<T>,
  column: GridNode<T>,
  showResizer: boolean,
  triggerRef: RefObject<HTMLDivElement>,
  onResizeStart: () => void,
  onResize: (widths: Map<Key, number | string>) => void,
  onResizeEnd: () => void,
  onMoveResizer: (e: MoveMoveEvent) => void
}

function Resizer<T>(props: ResizerProps<T>, ref: RefObject<HTMLInputElement>) {
  let {column, showResizer, layout} = props;
  let {state, isEmpty} = useTableContext();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {direction} = useLocale();
  const stateRef = useRef<TableLayoutState<T>>(null);
  stateRef.current = layout;

  let {inputProps, resizerProps} = useTableColumnResize<T>({
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
  }, state, layout, ref);

  let style = {
    cursor: undefined,
    height: '100%',
    display: showResizer ? undefined : 'none',
    touchAction: 'none'
  };
  let isEResizable = layout.getColumnMinWidth(column.key) >= layout.getColumnWidth(column.key);
  let isWResizable = layout.getColumnMaxWidth(column.key) <= layout.getColumnWidth(column.key);

  return (
    <>
      <FocusRing within focusRingClass={classNames(styles, 'focus-ring')}>
        <div
          role="presentation"
          style={style}
          className={classNames(
            styles,
            'spectrum-Table-columnResizer',
            {
              'spectrum-Table-columnResizer--ewresize': !(isEResizable && isWResizable),
              'spectrum-Table-columnResizer--eresize': direction === 'rtl' ? isWResizable : isEResizable,
              'spectrum-Table-columnResizer--wresize': direction === 'rtl' ? isEResizable : isWResizable
            }
          )}
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
