 
import {classNames} from '@react-spectrum/utils';
import {ColumnSize} from '@react-types/table';
import eCursor from 'bundle-text:./cursors/Cur_MoveToRight_9_9.svg';
import ewCursor from 'bundle-text:./cursors/Cur_MoveHorizontal_9_9.svg';
import {FocusRing} from '@react-aria/focus';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isWebKit, mergeProps, useObjectRef} from '@react-aria/utils';
import {Key, RefObject} from '@react-types/shared';
import React, {createContext, ForwardedRef, useContext, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {TableColumnResizeState} from '@react-stately/table';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTableColumnResize} from '@react-aria/table';
import {useTableContext, useVirtualizerContext} from './TableViewBase';
import {useUNSTABLE_PortalContext} from '@react-aria/overlays';
// @ts-ignore
import wCursor from 'bundle-text:./cursors/Cur_MoveToLeft_9_9.svg';

function getCursor(svg: string, fallback: string) {
  // WebKit renders SVG cursors blurry on 2x screens: https://bugs.webkit.org/show_bug.cgi?id=160657
  // To work around this, we generate two SVGs at different sizes and use image-set to pick between them.
  // Only do this in WebKit to avoid Firefox rendering the cursor at twice the size.
  if (isWebKit()) {
    return `image-set(url("data:image/svg+xml,${encodeURIComponent(svg)}") 1x, url("data:image/svg+xml,${encodeURIComponent(svg.replace('width="32" height="32"', 'width="64" height="64"'))}") 2x) 8 8, ${fallback}`;
  } else {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 8 8, ${fallback}`;
  }
}

interface ResizerProps<T> {
  column: GridNode<T>,
  showResizer: boolean,
  triggerRef: RefObject<HTMLDivElement | null>,
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void,
  onResize?: (widths: Map<Key, ColumnSize>) => void,
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void
}

const CURSORS = {
  ew: getCursor(ewCursor, 'ew-resize'),
  w: getCursor(wCursor, 'w-resize'),
  e: getCursor(eCursor, 'e-resize')
};

export const ResizeStateContext = createContext<TableColumnResizeState<unknown> | null>(null);

export const Resizer = React.forwardRef(function Resizer<T>(props: ResizerProps<T>, ref: ForwardedRef<HTMLInputElement | null>) {
  let {column, showResizer} = props;
  let objectRef = useObjectRef(ref);
  let {isEmpty, onFocusedResizer} = useTableContext();
  let layout = useContext(ResizeStateContext)!;
  // Virtualizer re-renders, but these components are all cached
  // in order to get around that and cause a rerender here, we use context
  // but we don't actually need any value, they are available on the layout object
  useVirtualizerContext();
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/table');
  let {direction} = useLocale();

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
      isDisabled: isEmpty
    }), layout, objectRef);

  let isEResizable = layout.getColumnMinWidth(column.key) >= layout.getColumnWidth(column.key);
  let isWResizable = layout.getColumnMaxWidth(column.key) <= layout.getColumnWidth(column.key);
  let isResizing = layout.resizingColumn === column.key;
  let cursor = '';
  if (isEResizable) {
    cursor = direction === 'rtl' ? CURSORS.w : CURSORS.e;
  } else if (isWResizable) {
    cursor = direction === 'rtl' ? CURSORS.e : CURSORS.w;
  } else {
    cursor = CURSORS.ew;
  }

  let style = {
    ...resizerProps.style,
    height: '100%',
    display: showResizer ? undefined : 'none',
    cursor
  };

  return (
    <>
      <FocusRing within focusRingClass={classNames(styles, 'focus-ring')}>
        <div
          {...resizerProps}
          role="presentation"
          style={style}
          className={classNames(styles, 'spectrum-Table-columnResizer')}>
          <input
            ref={objectRef}
            {...mergeProps(inputProps, {onFocus: onFocusedResizer})} />
        </div>
      </FocusRing>
      {/* Placeholder so that the title doesn't intersect with space reserved by the resizer when it appears. */}
      <div
        aria-hidden
        role="presentation"
        className={classNames(styles, 'spectrum-Table-columnResizerPlaceholder')} />
      <CursorOverlay show={isResizing && isPointerDown}>
        <div style={{position: 'fixed', top: 0, left: 0, bottom: 0, right: 0, cursor}} />
      </CursorOverlay>
    </>
  );
});

function CursorOverlay(props) {
  let {show, children} = props;
  let {getContainer} = useUNSTABLE_PortalContext();
  return show ? ReactDOM.createPortal(children, getContainer?.() ?? document.body) : null;
}
