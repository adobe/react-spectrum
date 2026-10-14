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
  {id: 'table.mount', fixture: 'table', label: 'Mount a virtualized 10,000-row table'},
  {
    id: 'table.scroll',
    fixture: 'table',
    label: 'Scroll through virtualized rows',
    metric: 'frameP95'
  },
  {id: 'table.update', fixture: 'table', label: 'Update one visible table record'},
  {id: 'form.mount', fixture: 'form', label: 'Mount 30 mixed form controls'},
  {id: 'form.type', fixture: 'form', label: 'Type into a controlled form field'},
  {id: 'form.dialog', fixture: 'form', label: 'Open a dialog and move focus'}
];

export const sizes = {listbox: 100, combobox: 500, table: 10000, form: 30};
