/* eslint-disable jsx-a11y/role-supports-aria-props */
import {classNames} from '@react-spectrum/utils';
import {ColumnSize} from '@react-types/table';
// @ts-ignore
import eCursor from 'bundle-text:./cursors/Cur_MoveToRight_9_9.svg';
// @ts-ignore
import ewCursor from 'bundle-text:./cursors/Cur_MoveHorizontal_9_9.svg';
import {FocusRing} from '@react-aria/focus';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isWebKit} from '@react-aria/utils';
import {mergeProps} from '@react-aria/utils';
import React, {Key, RefObject, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTableColumnResize} from '@react-aria/table';
import {useTableContext, useVirtualizerContext} from './TableView';
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
  triggerRef: RefObject<HTMLDivElement>,
  onResizeStart: (widths: Map<Key, ColumnSize>) => void,
  onResize: (widths: Map<Key, ColumnSize>) => void,
  onResizeEnd: (widths: Map<Key, ColumnSize>) => void
}

const CURSORS = {
  ew: getCursor(ewCursor, 'ew-resize'),
  w: getCursor(wCursor, 'w-resize'),
  e: getCursor(eCursor, 'e-resize')
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
      shouldResizeOnFocus: true
    }), layout, ref);

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
    height: '100%',
    display: showResizer ? undefined : 'none',
    touchAction: 'none',
    cursor
  };

  return (
    <>
      <FocusRing within focusRingClass={classNames(styles, 'focus-ring')}>
        <div
          role="presentation"
          style={style}
          className={classNames(styles, 'spectrum-Table-columnResizer')}
          {...resizerProps}>
          <input
            ref={ref}
            {...inputProps} />
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
}

function CursorOverlay(props) {
  let {show, children} = props;
  return show ? ReactDOM.createPortal(children, document.body) : null;
}

const _Resizer = React.forwardRef(Resizer);
export {_Resizer as Resizer};
