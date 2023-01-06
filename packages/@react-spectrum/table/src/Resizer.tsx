/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
import {ColumnSize} from '@react-types/table';
import {FocusRing} from '@react-aria/focus';
import {getInteractionModality} from '@react-aria/interactions';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import React, {Key, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTableColumnResize} from '@react-aria/table';
import {useTableContext, useVirtualizerContext} from './TableView';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface ResizerProps<T> {
  column: GridNode<T>,
  showResizer: boolean,
  triggerRef: RefObject<HTMLDivElement>,
  onResizeStart: (widths: Map<Key, ColumnSize>) => void,
  onResize: (widths: Map<Key, ColumnSize>) => void,
  onResizeEnd: (widths: Map<Key, ColumnSize>) => void
}

let CURSOR_CLASSES = {
  w: classNames(styles, 'resize-w'),
  e: classNames(styles, 'resize-e'),
  ew: classNames(styles, 'resize-ew')
};

function Resizer<T>(props: ResizerProps<T>, ref: RefObject<HTMLInputElement>) {
  let {column, showResizer} = props;
  let {state, isEmpty, layout} = useTableContext();
  // Virtualizer re-renders, but these components are all cached
  // in order to get around that and cause a rerender here, we use context
  // but we don't actually need any value, they are available on the layout object
  useVirtualizerContext();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {direction} = useLocale();
  let prevCursorDirection = useRef(null);

  let {inputProps, resizerProps} = useTableColumnResize<unknown>(
    mergeProps(props, {
      label: stringFormatter.format('columnResizer'),
      isDisabled: isEmpty,
      onResize: () => {
        let nextCursorDirection = null;
        if (getInteractionModality() === 'pointer') {
          if (layout.getColumnMinWidth(column.key) >= layout.getColumnWidth(column.key)) {
            document.body.classList.add(direction === 'rtl' ? CURSOR_CLASSES.w : CURSOR_CLASSES.e);
            nextCursorDirection = direction === 'rtl' ? 'w' : 'e';
          } else if (layout.getColumnMaxWidth(column.key) <= layout.getColumnWidth(column.key)) {
            document.body.classList.add(direction === 'rtl' ? CURSOR_CLASSES.e : CURSOR_CLASSES.w);
            nextCursorDirection = direction === 'rtl' ? 'e' : 'w';
          } else {
            document.body.classList.add(CURSOR_CLASSES.ew);
            nextCursorDirection = 'ew';
          }
        }

        if (nextCursorDirection == null && prevCursorDirection.current != null) {
          document.body.classList.remove(CURSOR_CLASSES.ew, CURSOR_CLASSES.e, CURSOR_CLASSES.w);
        } else if (nextCursorDirection === 'e' && (prevCursorDirection.current !== 'e' && prevCursorDirection.current != null)) {
          document.body.classList.remove(CURSOR_CLASSES.ew, CURSOR_CLASSES.w);
        } else if (nextCursorDirection === 'w' && (prevCursorDirection.current !== 'w' && prevCursorDirection.current != null)) {
          document.body.classList.remove(CURSOR_CLASSES.ew, CURSOR_CLASSES.e);
        } else if (nextCursorDirection === 'ew' && (prevCursorDirection.current !== 'ew' && prevCursorDirection.current != null)) {
          document.body.classList.remove(CURSOR_CLASSES.e, CURSOR_CLASSES.w);
        }
        prevCursorDirection.current = nextCursorDirection;
      },
      onResizeEnd: () => {
        document.body.classList.remove(CURSOR_CLASSES.ew, CURSOR_CLASSES.e, CURSOR_CLASSES.w);
      }
    }), state, layout, ref);

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
