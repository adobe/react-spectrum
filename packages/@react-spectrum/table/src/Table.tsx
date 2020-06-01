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

import ArrowDownSmall from '@spectrum-icons/ui/ArrowDownSmall';
import {Checkbox} from '@react-spectrum/checkbox';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {CollectionItem, layoutInfoToStyle, ScrollView, setScrollLeft, useCollectionView} from '@react-aria/collections';
import {DOMRef} from '@react-types/shared';
import {FocusRing, useFocusRing} from '@react-aria/focus';
import {GridState, useGridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import {Node, Rect, ReusableView, useCollectionState} from '@react-stately/collections';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ReactElement, useCallback, useContext, useMemo, useRef} from 'react';
import {SpectrumColumnProps, SpectrumTableProps} from '@react-types/table';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import stylesOverrides from './table.css';
import {TableLayout} from './TableLayout';
import {useColumnHeader, useGrid, useGridCell, useRow, useRowGroup, useRowHeader, useSelectAllCheckbox, useSelectionCheckbox} from '@react-aria/grid';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

const MIN_ROW_HEIGHT = 48;
const MAX_ROW_HEIGHT = 72;
const DEFAULT_ROW_HEIGHT = {
  medium: 48,
  large: 64
};

const DEFAULT_HEADER_HEIGHT = {
  medium: 34,
  large: 40
};

const TableContext = React.createContext<GridState<unknown>>(null);
function useTableContext() {
  return useContext(TableContext);
}

function Table<T>(props: SpectrumTableProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {isQuiet} = props;
  let {styleProps} = useStyleProps(props);
  let state = useGridState({...props, showSelectionCheckboxes: true});
  let domRef = useDOMRef(ref);
  let formatMessage = useMessageFormatter(intlMessages);

  let {scale} = useProvider();
  let layout = useMemo(() => new TableLayout({
    // If props.rowHeight is auto, then use estimated heights based on scale, otherwise use fixed heights.
    rowHeight: props.rowHeight === 'auto' 
      ? null 
      : Math.max(MIN_ROW_HEIGHT, Math.min(MAX_ROW_HEIGHT, props.rowHeight)) || DEFAULT_ROW_HEIGHT[scale],
    estimatedRowHeight: props.rowHeight === 'auto' 
      ? DEFAULT_ROW_HEIGHT[scale] 
      : null,
    headingHeight: props.rowHeight === 'auto' 
      ? null 
      : DEFAULT_HEADER_HEIGHT[scale],
    estimatedHeadingHeight: props.rowHeight === 'auto' 
      ? DEFAULT_HEADER_HEIGHT[scale] 
      : null
  }), [props.rowHeight, scale]);
  let {direction} = useLocale();
  layout.collection = state.collection;

  let {gridProps} = useGrid({
    ...props,
    ref: domRef,
    isVirtualized: true,
    layout
  }, state);

  // This overrides collection view's renderWrapper to support DOM heirarchy.
  type View = ReusableView<Node<T>, unknown>;
  let renderWrapper = (parent: View, reusableView: View, children: View[], renderChildren: (views: View[]) => ReactElement[]) => {
    let style = layoutInfoToStyle(reusableView.layoutInfo, direction, parent && parent.layoutInfo);
    if (style.overflow === 'hidden') {
      style.overflow = 'visible'; // needed to support position: sticky
    }

    if (reusableView.viewType === 'rowgroup') {
      return (
        <TableRowGroup
          key={reusableView.key}
          style={style}>
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
          style={style}>
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
      <CollectionItem
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

  let renderView = (type, item) => {
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

        if (state.collection.rowHeaderColumnKeys.has(item.column.key)) {
          return <TableRowHeader cell={item} />;
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

        return <TableColumnHeader column={item} />;
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

  return (
    <TableContext.Provider value={state}>
      <TableCollectionView
        {...gridProps}
        {...styleProps}
        isQuiet={isQuiet}
        layout={layout}
        collection={state.collection}
        focusedKey={state.selectionManager.focusedKey}
        renderView={renderView}
        renderWrapper={renderWrapper}
        domRef={domRef} />
    </TableContext.Provider>
  );
}

// This is a custom CollectionView that also has a header that syncs its scroll position with the body.
function TableCollectionView({layout, collection, focusedKey, renderView, renderWrapper, domRef, isQuiet, ...otherProps}) {
  let {direction} = useLocale();
  let headerRef = useRef<HTMLDivElement>();
  let bodyRef = useRef<HTMLDivElement>();
  let collectionState = useCollectionState({
    layout,
    collection,
    renderView,
    renderWrapper,
    onVisibleRectChange(rect) {
      bodyRef.current.scrollTop = rect.y;
      setScrollLeft(bodyRef.current, direction, rect.x);
    },
    transitionDuration: collection.body.props.isLoading && collection.size > 0 ? 0 : 500
  });

  let {collectionViewProps} = useCollectionView({
    focusedKey,
    shouldScrollToItem(key) {
      // Prevent scrolling to the top when clicking on column headers.
      let item = collection.getItem(key);
      return item?.type !== 'column';
    }
  }, collectionState, domRef);

  let headerHeight = layout.getLayoutInfo('header')?.rect.height || 0;
  let visibleRect = collectionState.collectionManager.visibleRect;

  // Sync the scroll position from the table body to the header container.
  let onScroll = useCallback(() => {
    headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
  }, [bodyRef]);

  let onVisibleRectChange = useCallback((rect: Rect) => {
    collectionState.setVisibleRect(rect);

    if (!collection.body.props.isLoading && collection.body.props.onLoadMore && collectionState.collectionManager.contentSize.height > rect.height * 2) {
      let scrollOffset = collectionState.collectionManager.contentSize.height - rect.height * 2;
      if (rect.y > scrollOffset) {
        collection.body.props.onLoadMore();
      }
    }
  }, [collection.body.props, collectionState.setVisibleRect, collectionState.collectionManager]);

  return (
    <div
      {...mergeProps(otherProps, collectionViewProps)}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-Table',
          {
            'spectrum-Table--quiet': isQuiet
          },
          classNames(
            stylesOverrides,
            'react-spectrum-Table'
          )
        )
      }>
      <div
        role="presentation"
        style={{
          width: visibleRect.width,
          height: headerHeight,
          overflow: 'hidden',
          position: 'relative',
          willChange: collectionState.isScrolling ? 'scroll-position' : '',
          transition: collectionState.isAnimating ? `none ${collectionState.collectionManager.transitionDuration}ms` : undefined
        }}
        ref={headerRef}>
        {collectionState.visibleViews[0]}
      </div>
      <ScrollView
        role="presentation"
        className={classNames(styles, 'spectrum-Table-body')}
        style={{flex: 1}}
        innerStyle={{overflow: 'visible', transition: collectionState.isAnimating ? `none ${collectionState.collectionManager.transitionDuration}ms` : undefined}}
        ref={bodyRef}
        contentSize={collectionState.contentSize}
        onVisibleRectChange={onVisibleRectChange}
        onScrollStart={collectionState.startScrolling}
        onScrollEnd={collectionState.endScrolling}
        onScroll={onScroll}>
        {collectionState.visibleViews[1]}
      </ScrollView>
    </div>
  );
}

function TableHeader({children, ...otherProps}) {
  let {rowGroupProps} = useRowGroup();

  return (
    <div {...rowGroupProps} {...otherProps} className={classNames(styles, 'spectrum-Table-head')}>
      {children}
    </div>
  );
}

function TableColumnHeader({column}) {
  let ref = useRef();
  let state = useTableContext();
  let {columnHeaderProps} = useColumnHeader({
    node: column,
    ref,
    colspan: column.colspan,
    isVirtualized: true
  }, state);

  let columnProps = column.props as SpectrumColumnProps<unknown>;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div 
        {...columnHeaderProps}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-Table-headCell',
            {
              'is-sortable': columnProps.allowsSorting,
              'is-sorted-desc': state.sortDescriptor?.column === column.key && state.sortDescriptor?.direction === 'descending',
              'is-sorted-asc': state.sortDescriptor?.column === column.key && state.sortDescriptor?.direction === 'ascending'
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
        {column.rendered}
        {columnProps.allowsSorting &&
          <ArrowDownSmall UNSAFE_className={classNames(styles, 'spectrum-Table-sortedIcon')} />
        }
      </div>
    </FocusRing>
  );
}

function TableSelectAllCell({column}) {
  let ref = useRef();
  let state = useTableContext();
  let {columnHeaderProps} = useColumnHeader({
    node: column,
    ref,
    colspan: column.colspan,
    isVirtualized: true
  }, state);

  let {checkboxProps} = useSelectAllCheckbox(state);

  return (
    <div 
      {...columnHeaderProps}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-Table-headCell',
          'spectrum-Table-checkboxCell'
        )
      }>
      <Checkbox
        {...checkboxProps}
        UNSAFE_className={classNames(styles, 'spectrum-Table-checkbox')} />
    </div>
  );
}

function TableRowGroup({children, ...otherProps}) {
  let {rowGroupProps} = useRowGroup();

  return (
    <div {...rowGroupProps} {...otherProps}>
      {children}
    </div>
  );
}

function TableRow({item, children, ...otherProps}) {
  let ref = useRef();
  let state = useTableContext();
  let isSelected = state.selectionManager.isSelected(item.key);
  let {rowProps} = useRow({
    node: item,
    isSelected,
    ref,
    isVirtualized: true
  }, state);

  // The row should show the focus background style when any cell inside it is focused.
  // If the row itself is focused, then it should have a blue focus indicator on the left.
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let {isFocusVisible, focusProps} = useFocusRing();
  let props = mergeProps(
    mergeProps(
      rowProps,
      otherProps
    ),
    mergeProps(
      focusWithinProps,
      focusProps
    )
  );

  return (
    <div 
      {...props}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-Table-row',
          {
            'is-selected': isSelected,
            'is-focused': isFocusVisibleWithin,
            'focus-ring': isFocusVisible
          }
        )
      }>
      {children}
    </div>
  );
}

function TableHeaderRow({item, children, ...otherProps}) {
  // TODO: move to react-aria?
  return (
    <div role="row" aria-rowindex={item.index + 1} {...otherProps}>
      {children}
    </div>
  );
}

function TableCheckboxCell({cell}) {
  let ref = useRef();
  let state = useTableContext();
  let {gridCellProps} = useGridCell({
    node: cell,
    ref,
    isVirtualized: true
  }, state);

  let {checkboxProps} = useSelectionCheckbox(
    {key: cell.parentKey},
    state
  );

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
            classNames(
              stylesOverrides,
              'react-spectrum-Table-cell'
            )
          )}>
        {state.selectionManager.selectionMode !== 'none' &&
          <Checkbox
            {...checkboxProps}
            UNSAFE_className={classNames(styles, 'spectrum-Table-checkbox')} />
        }
      </div>
    </FocusRing>
  );
}

function TableCell({cell}) {
  let ref = useRef();
  let state = useTableContext();
  let {gridCellProps} = useGridCell({
    node: cell,
    ref,
    isVirtualized: true
  }, state);
  let columnProps = cell.column.props as SpectrumColumnProps<unknown>;

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
              'spectrum-Table-cell--divider': columnProps.showDivider
            },
            classNames(
              stylesOverrides,
              'react-spectrum-Table-cell',
              {
                'react-spectrum-Table-cell--alignCenter': columnProps.align === 'center',
                'react-spectrum-Table-cell--alignEnd': columnProps.align === 'end'  
              }
            )
          )
        }>
        {cell.rendered}
      </div>
    </FocusRing>
  );
}

function TableRowHeader({cell}) {
  let ref = useRef();
  let state = useTableContext();
  let {rowHeaderProps} = useRowHeader({
    node: cell,
    ref,
    isVirtualized: true
  }, state);
  let columnProps = cell.column.props as SpectrumColumnProps<unknown>;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div 
        {...rowHeaderProps}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-Table-cell',
            {
              'spectrum-Table-cell--divider': columnProps.showDivider
            },
            classNames(
              stylesOverrides,
              'react-spectrum-Table-cell',
              {
                'react-spectrum-Table-cell--alignCenter': columnProps.align === 'center',
                'react-spectrum-Table-cell--alignEnd': columnProps.align === 'end'  
              }
            )
          )
        }>
        {cell.rendered}
      </div>
    </FocusRing>
  );
}

function CenteredWrapper({children}) {
  let state = useTableContext();
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

const _Table = React.forwardRef(Table);
export {_Table as Table};
