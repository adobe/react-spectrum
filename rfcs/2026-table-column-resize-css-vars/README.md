<!-- Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2026-07-23
- RFC PR: (leave this empty, to be filled in later)
- Authors: Dmitrii Kamenskikh, coolassassin

# Table column resize via CSS custom properties

## Summary

During column drag-resize, table column widths are applied imperatively as CSS custom properties on the table root (`--col-N-width`, `--col-N-start`, `--table-total-width`). Cells and columns read horizontal size from those variables instead of inline `width`/`left` from the virtualizer layout. React state and virtualizer relayout run once on `endResize`, not on every pointer move.

## Motivation

Today, each pointer move during column resize calls `updateResizedColumns`, which updates React state (`setUncontrolledWidths`). That triggers a virtualizer relayout and re-renders all visible cells on every frame. On large virtualized tables this causes visible jank.

The goal is smooth column resizing without React relayout on every pointer move. Column widths should be committed to React state (and the virtualizer) only when the drag ends. The public resize API (`onResize`, `onResizeEnd`, keyboard resize) should remain unchanged.

Proof-of-concept implementation: https://github.com/adobe/react-spectrum/pull/10267

## Detailed Design

### Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| **react-stately** | Pure state: `columnWidths`, `pendingSizesRef` during resize, `columnWidthsEqual`, pure helpers for CSS variable names and `CSSProperties` (`getColumnWidthVarName`, `getColumnHorizontalStyle`) |
| **react-aria** | DOM: `applyColumnWidthsToDOM`, sync in `useTableColumnResize`, `useSyncColumnWidthCSSVars` for commit-time synchronization |
| **Table packages** (Spectrum `TableViewBase`, RAC `Table`) | Table-specific cell positioning via wrappers, not generic Virtualizer |
| **Virtualizer / VirtualizerItem** | Unchanged generic API |

### Resize flow

1. **Resize start** (`startResize`): set `isResizingRef = true`, snapshot uncontrolled widths into a ref, set `resizingColumn`.
2. **During drag** (`updateResizedColumns`): compute new sizes in `pendingSizesRef`, update `TableColumnLayout.columnWidths` in memory, imperatively write CSS vars to the table root. No `setState` for uncontrolled widths.
3. **During drag** (`onResize`): throttled via `requestAnimationFrame` so consumers still receive width updates without blocking the main thread.
4. **Resize end** (`endResize`): commit `pendingUncontrolledWidthsRef` via `setUncontrolledWidths`, clear resize refs, trigger one virtualizer relayout with final `columnWidths`.
5. **CSS variables on root**:
   - `--col-{index}-width`: pixel width of column N
   - `--col-{index}-start`: cumulative inline-start offset of column N
   - `--table-total-width`: sum of all column widths
   - `--resize-indicator-position`: inline position of the resize indicator during drag
6. **Cell/column positioning**: for `layoutInfo.type === 'column' | 'cell'`, horizontal `width` and `insetInlineStart` come from CSS variables. Vertical positioning (`top`, `height`) still comes from the virtualizer layout.

### Table-specific virtualizer styling

Generic `Virtualizer` and `VirtualizerItem` must not contain table-specific logic. Instead:

- **Spectrum**: `TableCellWrapper` in `TableViewBase` computes styles via `getTableVirtualizerItemStyle` and passes them to `VirtualizerItem` through the `style` prop.
- **RAC**: `Virtualizer` accepts an optional generic `renderItem` callback. Virtualized table stories/tests pass a table-aware renderer that applies `getTableVirtualizerItemStyle`.

### Window resize during active column resize

When the table viewport width changes during an active resize, `useSyncColumnWidthCSSVars` rebuilds pixel widths from `pendingSizesRef` and re-applies CSS variables without committing React state.

## Documentation

No new public API is introduced. Internal CSS variable names are implementation details. No formal announcement is needed; this is a performance improvement invisible to most users.

## Drawbacks

- **Dual source of truth during drag**: pending ref + CSS variables. Requires careful synchronization on viewport resize and resize end.
- **More imperative code**: DOM writes in react-aria add complexity compared to the fully declarative current approach.
- **Table-specific wrappers**: virtualized RAC tables need a `renderItem` override or equivalent table-specific integration.
- **Testing**: tests must read widths from CSS variables rather than inline `style.width`.

## Backwards Compatibility Analysis

- Public resize callbacks (`onResizeStart`, `onResize`, `onResizeEnd`) and keyboard/mouse resize behavior are unchanged.
- Column width props (`width`, `defaultWidth`, `minWidth`, `maxWidth`) are unchanged.
- Internal cell positioning switches from inline `width`/`left` to CSS variables during resize. This is not observable to consumers who do not depend on inline styles.
- `onResize` continues to fire during drag (throttled to animation frames), preserving controlled-width use cases.

## Alternatives

1. **Current approach (state update on every move)** — simpler architecture, but poor performance on large virtualized tables.
2. **`flushSync` / forced synchronous relayout** — would reduce frame delay but increase main-thread blocking; worse overall performance.
3. **CSS Grid for column layout** — would require a fundamental change to table virtualizer positioning; large breaking change.
4. **CSS variables set via React inline `style` on root** — still triggers React re-renders on every move if state drives the style object.

## Open Questions

1. Should CSS variable name helpers (`getColumnWidthVarName`, etc.) be publicly exported, or kept internal?
2. For RAC virtualized tables, is a generic `renderItem` prop on `Virtualizer` acceptable, or should we ship a dedicated `TableVirtualizer` component?
3. Should `onResize` continue firing during drag, or only on `endResize`? Current design keeps `onResize` for controlled-width scenarios.

## Help Needed

The authors can implement this RFC. Feedback from the core team on layer boundaries (especially Virtualizer extension point) is appreciated before merge.

## Frequently Asked Questions

**Q: Does this change how consumers set column widths?**
A: No. `width`/`defaultWidth`/`minWidth`/`maxWidth` on columns and `ResizableTableContainer` callbacks work the same.

**Q: Will this work with RTL?**
A: Yes. Horizontal positioning uses `insetInlineStart`, which respects direction.

**Q: Does keyboard resize still work?**
A: Yes. Keyboard moves use the same code path; CSS vars update on each key step, state commits on end.

## Related Discussions

- Implementation PR: https://github.com/adobe/react-spectrum/pull/10267
