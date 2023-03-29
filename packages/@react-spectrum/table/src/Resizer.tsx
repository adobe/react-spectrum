/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
import {ColumnSize} from '@react-types/table';
import {FocusRing} from '@react-aria/focus';
import {getInteractionModality} from '@react-aria/interactions';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import React, {Key, RefObject, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import rspStyles from './table.css';
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
  w: classNames(rspStyles, 'resize-w'),
  e: classNames(rspStyles, 'resize-e'),
  ew: classNames(rspStyles, 'resize-ew')
};

function Resizer<T>(props: ResizerProps<T>, ref: RefObject<HTMLInputElement>) {
  let {column, showResizer} = props;
  let {isEmpty, layout} = useTableContext();
  // Virtualizer re-renders, but these components are all cached
  // in order to get around that and cause a rerender here, we use context
  // but we don't actually need any value, they are available on the layout object
  useVirtualizerContext();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {direction} = useLocale();
  let [directionClass, setDirectionClass] = React.useState(null);

  let [isPointerDown, setIsPointerDown] = useState(false);
  useEffect(() => {
    let setDown = (e) => {
      if (e.pointerType === 'mouse') {
        setIsPointerDown(true);
      }
    };
    let setUp = (e) => {
      if (e.pointerType === 'mouse') {
        setIsPointerDown(false);
      }
    };
    document.addEventListener('pointerdown', setDown, {capture: true});
    document.addEventListener('pointerup', setUp, {capture: true});
    return () => {
      document.removeEventListener('pointerdown', setDown, {capture: true});
      document.removeEventListener('pointerup', setUp, {capture: true});
    };
  }, []);

  let {inputProps, resizerProps} = useTableColumnResize<unknown>(
    mergeProps(props, {
      'aria-label': stringFormatter.format('columnResizer'),
      isDisabled: isEmpty,
      shouldResizeOnFocus: true,
      onResizeStart: () => {
        if (getInteractionModality() === 'pointer') {
          if (layout.getColumnMinWidth(column.key) >= layout.getColumnWidth(column.key)) {
            setDirectionClass(direction === 'rtl' ? CURSOR_CLASSES.w : CURSOR_CLASSES.e);
          } else if (layout.getColumnMaxWidth(column.key) <= layout.getColumnWidth(column.key)) {
            setDirectionClass(direction === 'rtl' ? CURSOR_CLASSES.e : CURSOR_CLASSES.w);
          } else {
            setDirectionClass(CURSOR_CLASSES.ew);
          }
        } else {
          setDirectionClass(null);
        }
      },
      onResize: () => {
        if (getInteractionModality() === 'pointer') {
          if (layout.getColumnMinWidth(column.key) >= layout.getColumnWidth(column.key)) {
            setDirectionClass(direction === 'rtl' ? CURSOR_CLASSES.w : CURSOR_CLASSES.e);
          } else if (layout.getColumnMaxWidth(column.key) <= layout.getColumnWidth(column.key)) {
            setDirectionClass(direction === 'rtl' ? CURSOR_CLASSES.e : CURSOR_CLASSES.w);
          } else {
            setDirectionClass(CURSOR_CLASSES.ew);
          }
        } else {
          setDirectionClass(null);
        }
      },
      onResizeEnd: () => {
        setDirectionClass(null);
      }
    }), layout, ref);

  let style = {
    cursor: undefined,
    height: '100%',
    display: showResizer ? undefined : 'none',
    touchAction: 'none'
  };
  let isEResizable = layout.getColumnMinWidth(column.key) >= layout.getColumnWidth(column.key);
  let isWResizable = layout.getColumnMaxWidth(column.key) <= layout.getColumnWidth(column.key);
  let isResizing = layout.resizingColumn === column.key;

  return (
    <>
      <FocusRing within focusRingClass={classNames(styles, 'focus-ring')}>
        <div
          role="presentation"
          style={style}
          className={classNames(
            styles,
            'spectrum-Table-columnResizer',
            classNames(rspStyles, {
              'react-spectrum-Table-columnResizer--ewresize': !(isEResizable && isWResizable),
              'react-spectrum-Table-columnResizer--eresize': direction === 'rtl' ? isWResizable : isEResizable,
              'react-spectrum-Table-columnResizer--wresize': direction === 'rtl' ? isEResizable : isWResizable
            })
          )}
          {...resizerProps}>
          <VisuallyHidden>
            <input
              ref={ref}
              {...inputProps} />
          </VisuallyHidden>
        </div>
      </FocusRing>
      {/* Placeholder so that the title doesn't intersect with space reserved by the resizer when it appears. */}
      <div
        aria-hidden
        role="presentation"
        className={classNames(styles, 'spectrum-Table-columnResizerPlaceholder')} />
      <CursorOverlay show={isResizing && isPointerDown}>
        <div className={directionClass} style={{position: 'fixed', top: 0, left: 0, bottom: 0, right: 0}} />
      </CursorOverlay>
    </>
  );
}

function CursorOverlay(props) {
  let {show, children} = props;
  return show ? ReactDOM.createPortal(children, document.body) : null;
}

const _Resizer = React.forwardRef(Resizer);
export {_Resizer as Resizer};
