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

export {useTable} from './useTable';
export {useTableColumnHeader} from './useTableColumnHeader';
export {useTableRow} from './useTableRow';
export {useTableHeaderRow} from './useTableHeaderRow';
export {useTableCell} from './useTableCell';
export {useTableSelectionCheckbox, useTableSelectAllCheckbox} from './useTableSelectionCheckbox';
export {useTableColumnResize} from './useTableColumnResize';

// Workaround for a Parcel bug where re-exports don't work in the CommonJS output format...
// export {useGridRowGroup as useTableRowGroup} from '@react-aria/grid';
import {GridRowGroupAria, useGridRowGroup} from '@react-aria/grid';
export function useTableRowGroup(): GridRowGroupAria {
  return useGridRowGroup();
}

export type {AriaTableProps} from './useTable';
export type {GridAria, GridRowAria, GridRowProps} from '@react-aria/grid';
export type {AriaTableColumnHeaderProps, TableColumnHeaderAria} from './useTableColumnHeader';
export type {AriaTableCellProps, TableCellAria} from './useTableCell';
export type {TableHeaderRowAria} from './useTableHeaderRow';
export type {AriaTableSelectionCheckboxProps, TableSelectionCheckboxAria, TableSelectAllCheckboxAria} from './useTableSelectionCheckbox';
export type {AriaTableColumnResizeProps, TableColumnResizeAria} from './useTableColumnResize';
