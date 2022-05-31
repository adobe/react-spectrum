/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// @ts-nocheck

import ArrowDownSmall from '@spectrum-icons/ui/ArrowDownSmall';
import {chain, mergeProps, useLayoutEffect} from '@react-aria/utils';
import {Checkbox} from '@react-spectrum/checkbox';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {FocusRing, focusSafely, useFocusRing} from '@react-aria/focus';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import {layoutInfoToStyle, ScrollView, setScrollLeft, useVirtualizer, VirtualizerItem} from '@react-aria/virtualizer';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ReactElement, useCallback, useContext, useMemo, useRef, useState} from 'react';
import {Rect, ReusableView, useVirtualizerState} from '@react-stately/virtualizer';
import {Resizer} from './Resizer';
import {SpectrumColumnProps, SpectrumTableProps} from '@react-types/table';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import stylesOverrides from './table.css';
import {TableLayout} from '@react-stately/layout';
import {TableState, useTableState} from '@react-stately/table';
import {TableView_DEPRECATED} from './TableView_DEPRECATED';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import {useButton} from '@react-aria/button';
import {useHover} from '@react-aria/interactions';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';
import {usePress} from '@react-aria/interactions';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import {
  useTable,
  useTableCell,
  useTableColumnHeader,
  useTableHeaderRow,
  useTableRow,
  useTableRowGroup,
  useTableSelectAllCheckbox,
  useTableSelectionCheckbox
} from '@react-aria/table';
import {VisuallyHidden} from '@react-aria/visually-hidden';

const DEFAULT_HEADER_HEIGHT = {
  medium: 34,
  large: 40
};

const DEFAULT_HIDE_HEADER_CELL_WIDTH = {
  medium: 36,
  large: 44
};

const ROW_HEIGHTS = {
  compact: {
    medium: 32,
    large: 40
  },
  regular: {
    medium: 40,
    large: 50
  },
  spacious: {
    medium: 48,
    large: 60
  }
};

const SELECTION_CELL_DEFAULT_WIDTH = {
  medium: 38,
  large: 48
};

interface TableContextValue<T> {
  state: TableState<T>,
  layout: TableLayout<T>
}

const TableContext = React.createContext<TableContextValue<unknown>>(null);
export function useTableContext() {
  return useContext(TableContext);
}

function TableView<T extends object>(props: SpectrumTableProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {isQuiet, onAction} = props;
  let {styleProps} = useStyleProps(props);

  let [showSelectionCheckboxes, setShowSelectionCheckboxes] = useState(props.selectionStyle !== 'highlight');
  let {scale} = useProvider();

  const getDefaultWidth = useCallback(({hideHeader, isSelectionCell, showDivider}) => {
    if (hideHeader) {
      let width = DEFAULT_HIDE_HEADER_CELL_WIDTH[scale];
      return showDivider ? width + 1 : width;
    } else if (isSelectionCell) {
      return SELECTION_CELL_DEFAULT_WIDTH[scale];
    }
  }, [scale]);

  let state = useTableState({
    ...props,
    showSelectionCheckboxes,
    selectionBehavior: props.selectionStyle === 'highlight' ? 'replace' : 'toggle',
    getDefaultWidth
  });

  // If the selection behavior changes in state, we need to update showSelectionCheckboxes here due to the circular dependency...
  let shouldShowCheckboxes = state.selectionManager.selectionBehavior !== 'replace';
  if (shouldShowCheckboxes !== showSelectionCheckboxes) {
    setShowSelectionCheckboxes(shouldShowCheckboxes);
  }

  let domRef = useDOMRef(ref);
  let bodyRef = useRef<HTMLDivElement>();
  let formatMessage = useMessageFormatter(intlMessages);

  let density = props.density || 'regular';
  let layout = useMemo(() => new TableLayout({
    // If props.rowHeight is auto, then use estimated heights based on scale, otherwise use fixed heights.
    rowHeight: props.overflowMode === 'wrap'
      ? null
      : ROW_HEIGHTS[density][scale],
    estimatedRowHeight: props.overflowMode === 'wrap'
      ? ROW_HEIGHTS[density][scale]
      : null,
    headingHeight: props.overflowMode === 'wrap'
      ? null
      : DEFAULT_HEADER_HEIGHT[scale],
    estimatedHeadingHeight: props.overflowMode === 'wrap'
      ? DEFAULT_HEADER_HEIGHT[scale]
      : null
  }),
    [props.overflowMode, scale, density]
  );
  let {direction} = useLocale();
  layout.collection = state.collection;
  layout.getColumnWidth = state.getColumnWidth;

  let {gridProps} = useTable({
    ...props,
    isVirtualized: true,
    layout,
    onRowAction: onAction
  }, state, domRef);

  // This overrides collection view's renderWrapper to support DOM heirarchy.
  type View = ReusableView<GridNode<T>, unknown>;
  let renderWrapper = (parent: View, reusableView: View, children: View[], renderChildren: (views: View[]) => ReactElement[]) => {
    let style = layoutInfoToStyle(reusableView.layoutInfo, direction, parent && parent.layoutInfo);
    if (style.overflow === 'hidden') {
      style.overflow = 'visible'; // needed to support position: sticky
    }

    if (reusableView.viewType === 'rowgroup') {
      return (
        <TableRowGroup key={reusableView.key} style={style}>
          {renderChildren(children)}
        </TableRowGroup>
      );
    }

    if (reusableView.viewType === 'header') {
      return (
        <TableHeader
          key={reusableView.key}
          style={style}>
          {renderChildren(children)}
        </TableHeader>
      );
    }

    if (reusableView.viewType === 'row') {
      return (
        <TableRow
          key={reusableView.key}
          item={reusableView.content}
          style={style}
          hasActions={onAction}>
          {renderChildren(children)}
        </TableRow>
      );
    }

    if (reusableView.viewType === 'headerrow') {
      return (
        <TableHeaderRow
          key={reusableView.key}
          style={style}
          item={reusableView.content}>
          {renderChildren(children)}
        </TableHeaderRow>
      );
    }

    return (
      <VirtualizerItem
        key={reusableView.key}
        reusableView={reusableView}
        parent={parent}
        className={
          classNames(
            styles,
            'spectrum-Table-cellWrapper',
            classNames(
              stylesOverrides,
              {
                'react-spectrum-Table-cellWrapper': !reusableView.layoutInfo.estimatedSize
              }
            )
          )
        } />
    );
  };

  let renderView = (type: string, item: GridNode<T>) => {
    switch (type) {
      case 'header':
      case 'rowgroup':
      case 'section':
      case 'row':
      case 'headerrow':
        return null;
      case 'cell': {
        if (item.props.isSelectionCell) {
          return <TableCheckboxCell cell={item} />;
        }

        return <TableCell cell={item} />;
      }
      case 'placeholder':
        // TODO: move to react-aria?
        return (
          <div
            role="gridcell"
            aria-colindex={item.index + 1}
            aria-colspan={item.colspan > 1 ? item.colspan : null} />
        );
      case 'column':
        if (item.props.isSelectionCell) {
          return <TableSelectAllCell column={item} />;
        }

        if (item.props.hideHeader) {
          return (
            <TooltipTrigger placement="top" trigger="focus">
              <TableColumnHeader column={item} />
              <Tooltip placement="top">{item.rendered}</Tooltip>
            </TooltipTrigger>
          );
        }

        if (item.props.allowsResizing) {
          return <ResizableTableColumnHeader item={item} state={state} />;
        }

        return (
          <TableColumnHeader column={item} />
        );
      case 'loader':
        return (
          <CenteredWrapper>
            <ProgressCircle
              isIndeterminate
              aria-label={state.collection.size > 0 ? formatMessage('loadingMore') : formatMessage('loading')} />
          </CenteredWrapper>
        );
      case 'empty': {
        let emptyState = props.renderEmptyState ? props.renderEmptyState() : null;
        if (emptyState == null) {
          return null;
        }

        return (
          <CenteredWrapper>
            {emptyState}
          </CenteredWrapper>
        );
      }
    }
  };

  let [isVerticalScrollbarVisible, setVerticalScollbarVisible] = useState(false);
  let [isHorizontalScrollbarVisible, setHorizontalScollbarVisible] = useState(false);
  let viewport = useRef({x: 0, y: 0, width: 0, height: 0});
  let onVisibleRectChange = useCallback((e) => {
    if (viewport.current.width === e.width && viewport.current.height === e.height) {
      return;
    }
    viewport.current = e;
    if (bodyRef.current) {
      setVerticalScollbarVisible(bodyRef.current.clientWidth + 2 < bodyRef.current.offsetWidth);
      setHorizontalScollbarVisible(bodyRef.current.clientHeight + 2 < bodyRef.current.offsetHeight);
    }
  }, []);

  return (
    <TableContext.Provider value={{state, layout}}>
      <TableVirtualizer
        {...gridProps}
        {...styleProps}
        className={
          classNames(
            styles,
            'spectrum-Table',
            `spectrum-Table--${density}`,
            {
              'spectrum-Table--quiet': isQuiet,
              'spectrum-Table--wrap': props.overflowMode === 'wrap',
              'spectrum-Table--loadingMore': state.collection.body.props.loadingState === 'loadingMore',
              'spectrum-Table--resizingColumn': state.isResizingColumn,
              'spectrum-Table--isVerticalScrollbarVisible': isVerticalScrollbarVisible,
              'spectrum-Table--isHorizontalScrollbarVisible': isHorizontalScrollbarVisible
            },
            classNames(
              stylesOverrides,
              'react-spectrum-Table'
            )
          )
        }
        layout={layout}
        collection={state.collection}
        focusedKey={state.selectionManager.focusedKey}
        renderView={renderView}
        renderWrapper={renderWrapper}
        setTableWidth={state.setTableWidth}
        onVisibleRectChange={onVisibleRectChange}
        domRef={domRef}
        bodyRef={bodyRef}
        getColumnWidth={state.getColumnWidth} />
    </TableContext.Provider>
  );
}

// This is a custom Virtualizer that also has a header that syncs its scroll position with the body.
function TableVirtualizer({layout, collection, focusedKey, renderView, renderWrapper, domRef, bodyRef, setTableWidth, getColumnWidth, onVisibleRectChange: onVisibleRectChangeProp, ...otherProps}) {
  let {direction} = useLocale();
  let headerRef = useRef<HTMLDivElement>();
  let loadingState = collection.body.props.loadingState;
  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  let onLoadMore = collection.body.props.onLoadMore;
  let state = useVirtualizerState({
    layout,
    collection,
    renderView,
    renderWrapper,
    onVisibleRectChange(rect) {
      bodyRef.current.scrollTop = rect.y;
      setScrollLeft(bodyRef.current, direction, rect.x);
    },
    transitionDuration: isLoading ? 160 : 220
  });

  let {virtualizerProps} = useVirtualizer({
    focusedKey,
    scrollToItem(key) {
      let item = collection.getItem(key);
      let column = collection.columns[0];
      state.virtualizer.scrollToItem(key, {
        duration: 0,
        // Prevent scrolling to the top when clicking on column headers.
        shouldScrollY: item?.type !== 'column',
        // Offset scroll position by width of selection cell
        // (which is sticky and will overlap the cell we're scrolling to).
        offsetX: column.props.isSelectionCell
          ? layout.getColumnWidth(column.key)
          : 0
      });
    }
  }, state, domRef);

  // If columnwidths change, need to relayout.
  useLayoutEffect(() => {
    state.virtualizer.relayoutNow({sizeChanged: true});
  }, [getColumnWidth, state.virtualizer]);

  let headerHeight = layout.getLayoutInfo('header')?.rect.height || 0;
  let visibleRect = state.virtualizer.visibleRect;

  // Sync the scroll position from the table body to the header container.
  let onScroll = useCallback(() => {
    headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
  }, [bodyRef]);

  let onVisibleRectChange = useCallback((rect: Rect) => {
    // setting the table width will recalculate column widths which we only want to do once the virtualizer is done initializing
    if (state.virtualizer.contentSize.height > 0) {
      setTableWidth(rect.width);
    }

    state.setVisibleRect(rect);

    if (!isLoading && onLoadMore) {
      let scrollOffset = state.virtualizer.contentSize.height - rect.height * 2;
      if (rect.y > scrollOffset) {
        onLoadMore();
      }
    }
  }, [onLoadMore, isLoading, state.setVisibleRect, state.virtualizer]);

  useLayoutEffect(() => {
    if (!isLoading && onLoadMore && !state.isAnimating) {
      if (state.contentSize.height <= state.virtualizer.visibleRect.height) {
        onLoadMore();
      }
    }
  }, [state.contentSize, state.virtualizer, state.isAnimating, onLoadMore, isLoading]);

  return (
    <div
      {...mergeProps(otherProps, virtualizerProps)}
      ref={domRef}>
      <div
        role="presentation"
        className={classNames(styles, 'spectrum-Table-headWrapper')}
        style={{
          width: visibleRect.width,
          height: headerHeight,
          overflow: 'hidden',
          position: 'relative',
          willChange: state.isScrolling ? 'scroll-position' : '',
          transition: state.isAnimating ? `none ${state.virtualizer.transitionDuration}ms` : undefined
        }}
        ref={headerRef}>
        {state.visibleViews[0]}
      </div>
      <ScrollView
        role="presentation"
        className={classNames(styles, 'spectrum-Table-body')}
        style={{flex: 1}}
        innerStyle={{overflow: 'visible', transition: state.isAnimating ? `none ${state.virtualizer.transitionDuration}ms` : undefined}}
        ref={bodyRef}
        contentSize={state.contentSize}
        onVisibleRectChange={chain(onVisibleRectChange, onVisibleRectChangeProp)}
        onScrollStart={state.startScrolling}
        onScrollEnd={state.endScrolling}
        onScroll={onScroll}>
        {state.visibleViews[1]}
      </ScrollView>
    </div>
  );
}

function TableHeader({children, ...otherProps}) {
  let {rowGroupProps} = useTableRowGroup();

  return (
    <div {...rowGroupProps} {...otherProps} className={classNames(styles, 'spectrum-Table-head')}>
      {children}
    </div>
  );
}

function TableColumnHeader(props) {
  let {column} = props;
  let ref = useRef();
  let {state} = useTableContext();
  let {columnHeaderProps} = useTableColumnHeader({
    node: column,
    isVirtualized: true
  }, state, ref);

  let {buttonProps} = useButton({...props, elementType: 'div'}, ref);

  let columnProps = column.props;

  if (columnProps.width && columnProps.allowsResizing) {
    throw new Error('Controlled state is not yet supported with column resizing. Please use defaultWidth for uncontrolled column resizing or remove the allowsResizing prop.');
  }

  let {hoverProps, isHovered} = useHover({});

  const allProps = [columnHeaderProps, hoverProps];
  if (columnProps.allowsResizing) {
    allProps.push(buttonProps);
  }

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...mergeProps(...allProps)}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-Table-headCell',
            {
              'is-resizable': columnProps.allowsResizing,
              'is-sortable': columnProps.allowsSorting,
              'is-sorted-desc': state.sortDescriptor?.column === column.key && state.sortDescriptor?.direction === 'descending',
              'is-sorted-asc': state.sortDescriptor?.column === column.key && state.sortDescriptor?.direction === 'ascending',
              'is-hovered': isHovered,
              'spectrum-Table-cell--hideHeader': columnProps.hideHeader
            },
            classNames(
              stylesOverrides,
              'react-spectrum-Table-cell',
              {
                'react-spectrum-Table-cell--alignCenter': columnProps.align === 'center' || column.colspan > 1,
                'react-spectrum-Table-cell--alignEnd': columnProps.align === 'end'
              }
            )
          )
        }>
        {columnProps.hideHeader ?
          <VisuallyHidden>{column.rendered}</VisuallyHidden> :
          <div className={classNames(styles, 'spectrum-Table-headCellContents')}>{column.rendered}</div>
        }
        {columnProps.allowsSorting &&
          <ArrowDownSmall UNSAFE_className={classNames(styles, 'spectrum-Table-sortedIcon')} />
        }
      </div>
    </FocusRing>
  );
}

function ResizableTableColumnHeader({item, state}) {
  let ref = useRef();

  const onMenuSelect = (key) => {
    switch (key) {
      case `${item.key}-sort-asc`:
        state.sort(item.key, 'ascending');
        break;
      case `${item.key}-sort-desc`:
        state.sort(item.key, 'descending');
        break;
      case `${item.key}-resize`:
        // focusResizer, needs timeout so that it happens after the animation timeout for menu close
        setTimeout(() => {
          focusSafely(ref.current);
        }, 360);
        break;
    }
  };

  return (
    <>
      <MenuTrigger>
        <TableColumnHeader column={item} />
        <Menu onAction={onMenuSelect} minWidth="size-2000">
          {item.props?.allowsSorting &&
            <Item key={`${item.key}-sort-asc`}>
              Sort Ascending
            </Item>
          }
          {item.props?.allowsSorting &&
            <Item key={`${item.key}-sort-desc`}>
              Sort Descending
            </Item>
          }
          <Item key={`${item.key}-resize`}>
            Resize column
          </Item>
        </Menu>
      </MenuTrigger>
      <Resizer ref={ref} item={item} />
    </>
  );
}

function TableSelectAllCell({column}) {
  let ref = useRef();
  let {state} = useTableContext();
  let isSingleSelectionMode = state.selectionManager.selectionMode === 'single';
  let {columnHeaderProps} = useTableColumnHeader({
    node: column,
    isVirtualized: true
  }, state, ref);

  let {checkboxProps} = useTableSelectAllCheckbox(state);
  let {hoverProps, isHovered} = useHover({});

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...mergeProps(columnHeaderProps, hoverProps)}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-Table-headCell',
            'spectrum-Table-checkboxCell',
            {
              'is-hovered': isHovered
            }
          )
        }>
        {
          /*
            In single selection mode, the checkbox will be hidden.
            So to avoid leaving a column header with no accessible content,
            we use a VisuallyHidden component to include the aria-label from the checkbox,
            which for single selection will be "Select."
          */
          isSingleSelectionMode &&
          <VisuallyHidden>{checkboxProps['aria-label']}</VisuallyHidden>
        }
        <Checkbox
          {...checkboxProps}
          isDisabled={isSingleSelectionMode}
          isEmphasized
          UNSAFE_style={isSingleSelectionMode ? {visibility: 'hidden'} : undefined}
          UNSAFE_className={classNames(styles, 'spectrum-Table-checkbox')} />
      </div>
    </FocusRing>
  );
}

function TableRowGroup({children, ...otherProps}) {
  let {rowGroupProps} = useTableRowGroup();

  return (
    <div {...rowGroupProps} {...otherProps}>
      {children}
    </div>
  );
}

function TableRow({item, children, hasActions, ...otherProps}) {
  let ref = useRef();
  let {state, layout} = useTableContext();
  let allowsInteraction = state.selectionManager.selectionMode !== 'none' || hasActions;
  let isDisabled = !allowsInteraction || state.disabledKeys.has(item.key);
  let isSelected = state.selectionManager.isSelected(item.key);
  let {rowProps} = useTableRow({
    node: item,
    isVirtualized: true
  }, state, ref);

  let {pressProps, isPressed} = usePress({isDisabled});

  // The row should show the focus background style when any cell inside it is focused.
  // If the row itself is focused, then it should have a blue focus indicator on the left.
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let {isFocusVisible, focusProps} = useFocusRing();
  let {hoverProps, isHovered} = useHover({isDisabled});
  let props = mergeProps(
    rowProps,
    otherProps,
    focusWithinProps,
    focusProps,
    hoverProps,
    pressProps
  );
  let isFirstRow = state.collection.rows.find(row => row.level === 1)?.key === item.key;
  let isLastRow = item.nextKey == null;
  // Figure out if the TableView content is equal or greater in height to the container. If so, we'll need to round the bottom
  // border corners of the last row when selected.
  let isFlushWithContainerBottom = false;
  if (isLastRow) {
    if (layout.getContentSize()?.height >= layout.virtualizer?.getVisibleRect().height) {
      isFlushWithContainerBottom = true;
    }
  }

  return (
    <div
      {...props}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-Table-row',
          {
            'is-active': isPressed,
            'is-selected': isSelected,
            'spectrum-Table-row--highlightSelection': state.selectionManager.selectionBehavior === 'replace',
            'is-next-selected': state.selectionManager.isSelected(item.nextKey),
            'is-focused': isFocusVisibleWithin,
            'focus-ring': isFocusVisible,
            'is-hovered': isHovered,
            'is-disabled': isDisabled,
            'spectrum-Table-row--firstRow': isFirstRow,
            'spectrum-Table-row--lastRow': isLastRow,
            'spectrum-Table-row--isFlushBottom': isFlushWithContainerBottom
          }
        )
      }>
      {children}
    </div>
  );
}

function TableHeaderRow({item, children, style}) {
  let {state} = useTableContext();
  let ref = useRef();
  let {rowProps} = useTableHeaderRow({node: item, isVirtualized: true}, state, ref);

  return (
    <div {...rowProps} ref={ref} style={style}>
      {children}
    </div>
  );
}

function TableCheckboxCell({cell}) {
  let ref = useRef();
  let {state} = useTableContext();
  let isDisabled = state.disabledKeys.has(cell.parentKey);
  let {gridCellProps} = useTableCell({
    node: cell,
    isVirtualized: true
  }, state, ref);

  let {checkboxProps} = useTableSelectionCheckbox({key: cell.parentKey}, state);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...gridCellProps}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-Table-cell',
            'spectrum-Table-checkboxCell',
            {
              'is-disabled': isDisabled
            },
            classNames(
              stylesOverrides,
              'react-spectrum-Table-cell'
            )
          )}>
        {state.selectionManager.selectionMode !== 'none' &&
          <Checkbox
            {...checkboxProps}
            isEmphasized
            isDisabled={isDisabled}
            UNSAFE_className={classNames(styles, 'spectrum-Table-checkbox')} />
        }
      </div>
    </FocusRing>
  );
}

function TableCell({cell}) {
  let {state} = useTableContext();
  let ref = useRef();
  let columnProps = cell.column.props as SpectrumColumnProps<unknown>;
  let isDisabled = state.disabledKeys.has(cell.parentKey);
  let {gridCellProps} = useTableCell({
    node: cell,
    isVirtualized: true
  }, state, ref);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...gridCellProps}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-Table-cell',
            {
              'spectrum-Table-cell--divider': columnProps.showDivider && cell.column.nextKey !== null,
              'spectrum-Table-cell--hideHeader': columnProps.hideHeader,
              'is-disabled': isDisabled
            },
            classNames(
              stylesOverrides,
              'react-spectrum-Table-cell',
              {
                'react-spectrum-Table-cell--alignStart': columnProps.align === 'start',
                'react-spectrum-Table-cell--alignCenter': columnProps.align === 'center',
                'react-spectrum-Table-cell--alignEnd': columnProps.align === 'end'
              }
            )
          )
        }>
        <span
          className={
            classNames(
              styles,
              'spectrum-Table-cellContents'
            )
        }>
          {cell.rendered}
        </span>
      </div>
    </FocusRing>
  );
}

function CenteredWrapper({children}) {
  let {state} = useTableContext();
  return (
    <div
      role="row"
      aria-rowindex={state.collection.headerRows.length + state.collection.size + 1}
      className={classNames(stylesOverrides, 'react-spectrum-Table-centeredWrapper')}>
      <div role="rowheader" aria-colspan={state.collection.columns.length}>
        {children}
      </div>
    </div>
  );
}

/**
 * Tables are containers for displaying information. They allow users to quickly scan, sort, compare, and take action on large amounts of data.
 */
const _TableView = React.forwardRef(TableView) as <T>(props: SpectrumTableProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;

/*
  When ready to remove this feature flag, you can remove this whole section of code, delete the _DEPRECATED files, and just replace the export with the _TableView above.
*/
function FeatureFlaggedTableView<T extends object>(props: SpectrumTableProps<T>, ref: DOMRef<HTMLDivElement>) {
  let state = useTableState({
    ...props
  });

  const someColumnsAllowResizing = state.collection.columns.some(c => c.props?.allowsResizing);

  if (someColumnsAllowResizing) {
    return <_TableView {...props} ref={ref} />;
  } else {
    return <TableView_DEPRECATED {...props} ref={ref} />;
  }
}

/**
 * Tables are containers for displaying information. They allow users to quickly scan, sort, compare, and take action on large amounts of data.
 */
const _FeatureFlaggedTableView = React.forwardRef(FeatureFlaggedTableView) as <T>(props: SpectrumTableProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;


export {_FeatureFlaggedTableView as TableView};
