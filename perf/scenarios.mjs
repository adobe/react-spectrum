/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

// Shared by the fixture, driver, and report. Each action has a semantic endpoint.
export const scenarios = [
  {id: 'listbox.mount', fixture: 'listbox', label: 'Mount 100 ListBox items'},
  {id: 'listbox.focus', fixture: 'listbox', label: 'Move ListBox keyboard focus'},
  {id: 'listbox.select', fixture: 'listbox', label: 'Select a ListBox item'},
  {id: 'listbox.parent', fixture: 'listbox', label: 'Update unrelated parent state'},
  {id: 'combobox.open', fixture: 'combobox', label: 'Open a 500-option ComboBox'},
  {id: 'combobox.filter', fixture: 'combobox', label: 'Type 9 and filter 500 options'},
  {id: 'combobox.narrow', fixture: 'combobox', label: 'Type a second 9 to narrow the filter'},
  {
    id: 'combobox.keyboard',
    fixture: 'combobox',
    label: 'Move ComboBox option focus with ArrowDown'
  },
  {id: 'combobox.hover', fixture: 'combobox', label: 'Move ComboBox option focus with the pointer'},
  {id: 'select.hover', fixture: 'select', label: 'Move Select option focus with the pointer'},
  {id: 'select.choose', fixture: 'select', label: 'Choose a Select option and close its popup'},
  {id: 'table-data.sort', fixture: 'table-data', label: 'Reverse the sort of 100 table rows'},
  {id: 'table-data.filter', fixture: 'table-data', label: 'Filter 100 table rows by typing 9'},
  {id: 'table-data.clear', fixture: 'table-data', label: 'Restore 100 table rows with Backspace'},
  {id: 'table-data.focus', fixture: 'table-data', label: 'Move table cell focus without selection'},
  {id: 'table-cells.select', fixture: 'table-cells', label: 'Select a row with its checkbox'},
  {id: 'table-cells.select-all', fixture: 'table-cells', label: 'Select all 100 table rows'},
  {
    id: 'table-cells.menu',
    fixture: 'table-cells',
    label: 'Open a table cell menu and focus its first item'
  },
  {
    id: 'table-cells.menu-close',
    fixture: 'table-cells',
    label: 'Dismiss a cell menu and restore focus'
  },
  {
    id: 'table-cells.dialog',
    fixture: 'table-cells',
    label: 'Open a table cell dialog and autofocus'
  },
  {
    id: 'table-cells.dialog-close',
    fixture: 'table-cells',
    label: 'Close a cell dialog and restore focus'
  },
  {id: 'table.mount', fixture: 'table', label: 'Mount a virtualized 10,000-row table'},
  {
    id: 'table.scroll',
    fixture: 'table',
    label: 'Scroll through virtualized rows',
    metric: 'frameMean'
  },
  {id: 'table.update', fixture: 'table', label: 'Update one visible table record'},
  {
    id: 'table.scroll-deep',
    fixture: 'table',
    label: 'Scroll after traversing 4,000 table rows',
    metric: 'frameMean'
  },
  {
    id: 'table-measured.mount',
    fixture: 'table-measured',
    label: 'Mount a measured-height 1,000-row table'
  },
  {
    id: 'table-measured.narrow',
    fixture: 'table-measured',
    label: 'Narrow the wrapping labels column'
  },
  {
    id: 'table-measured.widen',
    fixture: 'table-measured',
    label: 'Widen labels and shrink measured rows'
  },
  {
    id: 'table-measured.other-column',
    fixture: 'table-measured',
    label: 'Resize another column with tall measured rows'
  },
  {
    id: 'table-measured.container',
    fixture: 'table-measured',
    label: 'Resize a measured-height table container'
  },
  {
    id: 'table-measured.resize-animation',
    fixture: 'table-measured',
    label: 'Continuously resize a measured-height table',
    metric: 'frameMean'
  },
  {id: 'variable.mount', fixture: 'variable', label: 'Mount a variable-height virtualized list'},
  {
    id: 'variable.scroll',
    fixture: 'variable',
    label: 'Scroll through measured, wrapping rows',
    metric: 'frameMean'
  },
  {
    id: 'variable.scroll-deep',
    fixture: 'variable',
    label: 'Scroll measured rows after traversing 160,000 px',
    metric: 'frameMean'
  },
  {
    id: 'variable.resize',
    fixture: 'variable',
    label: 'Narrow the list and remeasure wrapping rows'
  },
  {id: 'collection.append', fixture: 'collection', label: 'Append a page of 50 records'},
  {
    id: 'collection.remove',
    fixture: 'collection',
    label: 'Delete five selected records and retain focus'
  },
  {
    id: 'collection.replace',
    fixture: 'collection',
    label: 'Switch to a different 100-record dataset'
  },
  {id: 'tree.expand', fixture: 'tree', label: 'Expand a project containing 50 files'},
  {id: 'tree.navigate', fixture: 'tree', label: 'Move keyboard focus into an expanded project'},
  {id: 'tree.collapse', fixture: 'tree', label: 'Collapse a project containing 50 files'},
  {id: 'resize.mount', fixture: 'resize', label: 'Mount a nonvirtualized 500-row table'},
  {id: 'resize.container', fixture: 'resize', label: 'Narrow a 500-row table for a side panel'},
  {id: 'form.mount', fixture: 'form', label: 'Mount 30 mixed form controls'},
  {id: 'form.type', fixture: 'form', label: 'Type into a controlled form field'},
  {
    id: 'dnd.modality-type',
    fixture: 'dnd',
    label: 'Type after pointer input beside 200 draggables'
  },
  // A control for dnd.modality-type: the same keystroke without a modality change.
  {
    id: 'dnd.type',
    fixture: 'dnd',
    label: 'Baseline: type in keyboard mode beside 200 draggables'
  }
];

export const sizes = {
  listbox: 100,
  combobox: 500,
  select: 500,
  'table-data': 100,
  'table-cells': 100,
  table: 10000,
  'table-measured': 1000,
  variable: 10000,
  collection: 100,
  tree: 1000,
  resize: 500,
  form: 30,
  dnd: 200
};
