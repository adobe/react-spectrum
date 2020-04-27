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

import {Checkbox} from '@react-spectrum/checkbox';
import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {CollectionItem, layoutInfoToStyle, ScrollView, setScrollLeft, useCollectionView} from '@react-aria/collections';
import {DOMRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {GridState, useGridState} from '@react-stately/grid';
import {Node, ReusableView, useCollectionState} from '@react-stately/collections';
import React, {ReactElement, useCallback, useContext, useMemo, useRef} from 'react';
import {SpectrumColumnProps, SpectrumTableProps} from '@react-types/table';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import stylesOverrides from './table.css';
import {TableLayout} from './TableLayout';
import {useColumnHeader, useGrid, useGridCell, useRow, useRowGroup, useRowHeader, useSelectAllCheckbox, useSelectionCheckbox} from '@react-aria/grid';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

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
  let {gridProps} = useGrid({
    ...props,
    ref: domRef,
    isVirtualized: true
  }, state);

  let layout = useMemo(() => new TableLayout({}), []);
  let {direction} = useLocale();
  layout.collection = state.collection;

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
          style={style}>
          {renderChildren(children)}
        </TableHeaderRow>
      );
    }

    return (
      <CollectionItem
        key={reusableView.key}
        reusableView={reusableView}
        parent={parent}
        className={classNames(styles, 'spectrum-Table-cellWrapper')} />
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
      case 'rowheader':
        return <TableRowHeader rowHeader={item} />;
      case 'cell':
        return <TableCell cell={item} />;
      case 'placeholder':
        return <div role="gridcell" aria-colspan={item.colspan > 1 ? item.colspan : null} />;
      case 'column':
        return <TableColumnHeader column={item} />;
    }
  };

  return (
    <TableContext.Provider value={state}>
      <TableCollectionView
        {...filterDOMProps(props)}
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
  let collectionState = useCollectionState({
    layout,
    collection,
    renderView,
    renderWrapper,
    onVisibleRectChange(rect) {
      domRef.current.scrollTop = rect.y;
      setScrollLeft(domRef.current, direction, rect.x);
    }
  });

  let {collectionViewProps} = useCollectionView({focusedKey}, collectionState, domRef);

  let headerHeight = layout.getLayoutInfo('header')?.rect.height || 0;
  let visibleRect = collectionState.collectionManager.visibleRect;

  // Sync the scroll position from the table body to the header container.
  let headerRef = useRef<HTMLDivElement>();
  let onScroll = useCallback(() => {
    headerRef.current.scrollLeft = domRef.current.scrollLeft;
  }, [domRef]);

  return (
    <div
      {...otherProps}
      {...collectionViewProps}
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
          willChange: collectionState.isScrolling ? 'scroll-position' : ''
        }}
        ref={headerRef}>
        {collectionState.visibleViews[0]}
      </div>
      <ScrollView
        role="presentation"
        className={classNames(styles, 'spectrum-Table-body')}
        style={{flex: 1}}
        innerStyle={{overflow: 'visible'}}
        ref={domRef}
        contentSize={collectionState.contentSize}
        onVisibleRectChange={collectionState.setVisibleRect}
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
    key: column.key,
    ref,
    colspan: column.colspan
  }, state);

  let isCheckboxCell = state.selectionManager.selectionMode !== 'none' && column.index === 0;
  let {checkboxProps} = useSelectAllCheckbox(state);

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
              'spectrum-Table-checkboxCell': isCheckboxCell,
              'spectrum-Table-cell--alignCenter': columnProps.align === 'center' || column.colspan > 1,
              'spectrum-Table-cell--alignEnd': columnProps.align === 'end'
            }
          )
        }>
        {column.rendered}
        {isCheckboxCell &&
          <Checkbox
            {...checkboxProps}
            UNSAFE_className={classNames(styles, 'spectrum-Table-checkbox')} />
        }
      </div>
    </FocusRing>
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
    key: item.key,
    isSelected,
    ref,
    isVirtualized: true
  }, state);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div {...rowProps} {...otherProps} ref={ref} className={classNames(styles, 'spectrum-Table-row', {'is-selected': isSelected})}>
        {children}
      </div>
    </FocusRing>
  );
}

function TableHeaderRow({children, ...otherProps}) {
  return (
    <div role="row" {...otherProps}>
      {children}
    </div>
  );
}

function TableRowHeader({rowHeader}) {
  let ref = useRef();
  let state = useTableContext();
  let {rowHeaderProps} = useRowHeader({
    ref,
    key: rowHeader.key
  }, state);

  let {checkboxProps} = useSelectionCheckbox(
    {key: rowHeader.parentKey},
    state
  );

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div 
        {...rowHeaderProps}
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
        {rowHeader.rendered}
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
    ref,
    key: cell.key,
    isVirtualized: true
  }, state);
  let column = state.collection.columns[cell.index];
  let columnProps = column.props as SpectrumColumnProps<unknown>;

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

const _Table = React.forwardRef(Table);
export {_Table as Table};
