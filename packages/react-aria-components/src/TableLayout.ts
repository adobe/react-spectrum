/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {TableLayout as BaseTableLayout, TableLayoutProps} from 'react-stately/useVirtualizerState';
import {LayoutOptionsDelegate} from './Virtualizer';
import {renderTableVirtualizerItem} from './TableVirtualizerItem';
import {TableColumnResizeStateContext} from './Table';
import {useContext, useMemo} from 'react';

export class TableLayout<T, O extends TableLayoutProps = TableLayoutProps>
  extends BaseTableLayout<T, O>
  implements LayoutOptionsDelegate<TableLayoutProps>
{
  // Tables position columns/cells via CSS variables, so the Virtualizer must wrap items
  // with the table-aware renderer. Carrying it on the layout means callers can't forget it
  // (a plain VirtualizerItem would use pixel widths and break live column resizing).
  renderItem = renderTableVirtualizerItem;

  // Invalidate the layout whenever the column widths change.
  useLayoutOptions(): TableLayoutProps {
    // This is not a React class component, just a regular class.
    // oxlint-disable react/react-compiler, react-hooks/rules-of-hooks
    let colResizeState = useContext(TableColumnResizeStateContext);
    return useMemo(
      () => ({
        columnWidths: colResizeState?.columnWidths
      }),
      [colResizeState?.columnWidths]
    );
    // oxlint-enable react/react-compiler, react-hooks/rules-of-hooks
  }
}
