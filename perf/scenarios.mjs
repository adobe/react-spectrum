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
  {id: 'combobox.filter', fixture: 'combobox', label: 'Type 99 and filter 500 options'},
  {
    id: 'combobox.keyboard',
    fixture: 'combobox',
    label: 'Move ComboBox option focus with ArrowDown'
  },
  {id: 'combobox.hover', fixture: 'combobox', label: 'Move ComboBox option focus with the pointer'},
  {id: 'select.keyboard', fixture: 'select', label: 'Move Select option focus with ArrowDown'},
  {id: 'select.hover', fixture: 'select', label: 'Move Select option focus with the pointer'},
  {id: 'table-data.sort', fixture: 'table-data', label: 'Reverse the sort of 100 table rows'},
  {id: 'table-data.filter', fixture: 'table-data', label: 'Filter 100 table rows by typing 9'},
  {id: 'table-data.clear', fixture: 'table-data', label: 'Restore 100 table rows with Backspace'},
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
  {id: 'variable.mount', fixture: 'variable', label: 'Mount a variable-height virtualized list'},
  {
    id: 'variable.scroll',
    fixture: 'variable',
    label: 'Scroll through measured, wrapping rows',
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
  {id: 'form.dialog', fixture: 'form', label: 'Open a dialog and move focus'}
];

export const sizes = {
  listbox: 100,
  combobox: 500,
  select: 500,
  'table-data': 100,
  'table-cells': 100,
  table: 10000,
  variable: 10000,
  collection: 100,
  tree: 1000,
  resize: 500,
  form: 30
};
