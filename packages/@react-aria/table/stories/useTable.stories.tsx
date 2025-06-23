/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {Table as BackwardCompatTable} from './example-backwards-compat';
import {Cell, Column, Row, TableBody, TableHeader} from '@react-stately/table';
import {ColumnSize} from '@react-types/table';
import {Table as DocsTable} from './example-docs';
import {Key} from '@react-types/shared';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX, useCallback, useMemo, useState} from 'react';
import {Table as ResizingTable} from './example-resizing';
import {SpectrumTableProps} from '@react-spectrum/table';
import {Table} from './example';

const meta: Meta<SpectrumTableProps<any>> = {
  title: 'useTable'
};

export default meta;

let columns = [
  {name: 'Name', uid: 'name'},
  {name: 'Type', uid: 'type'},
  {name: 'Level', uid: 'level'}
];

let defaultRows = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: '67', weight: '200lbs', height: '5\'7"'},
  {id: 2, name: 'Blastoise', type: 'Water', level: '56', weight: '188lbs', height: '5\'3"'},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: '83', weight: '220lbs', height: '6\'7"'},
  {id: 4, name: 'Pikachu', type: 'Electric', level: '100', weight: '13lbs', height: '1\'4"'},
  {id: 5, name: 'Charizard', type: 'Fire, Flying', level: '67', weight: '200lbs', height: '5\'7"'},
  {id: 6, name: 'Blastoise', type: 'Water', level: '56', weight: '188lbs', height: '5\'3"'},
  {id: 7, name: 'Venusaur', type: 'Grass, Poison', level: '83', weight: '220lbs', height: '6\'7"'},
  {id: 8, name: 'Pikachu', type: 'Electric', level: '100', weight: '13lbs', height: '1\'4"'},
  {id: 9, name: 'Charizard', type: 'Fire, Flying', level: '67', weight: '200lbs', height: '5\'7"'},
  {id: 10, name: 'Blastoise', type: 'Water', level: '56', weight: '188lbs', height: '5\'3"'},
  {id: 11, name: 'Venusaur', type: 'Grass, Poison', level: '83', weight: '220lbs', height: '6\'7"'},
  {id: 12, name: 'Pikachu', type: 'Electric', level: '100', weight: '13lbs', height: '1\'4"'}
] as const;

const Template = (args: SpectrumTableProps<any>): JSX.Element => (
  <>
    <label htmlFor="focusable-before">Focusable before</label>
    <input id="focusable-before" />
    <Table aria-label="Table with selection" selectionMode="multiple" {...args}>
      <TableHeader columns={columns}>
        {column => (
          <Column key={column.uid}>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={defaultRows}>
        {item => (
          <Row>
            {columnKey => <Cell>{item[columnKey]}</Cell>}
          </Row>
        )}
      </TableBody>
    </Table>
    <label htmlFor="focus-after">Focusable after</label>
    <input id="focus-after" />
  </>
);

const TemplateBackwardsCompat = (args: SpectrumTableProps<any>): JSX.Element => (
  <>
    <label htmlFor="focusable-before">Focusable before</label>
    <input id="focusable-before" />
    <BackwardCompatTable aria-label="Table with selection" selectionMode="multiple" {...args}>
      <TableHeader columns={columns}>
        {column => (
          <Column key={column.uid}>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={defaultRows}>
        {item => (
          <Row>
            {columnKey => <Cell>{item[columnKey]}</Cell>}
          </Row>
        )}
      </TableBody>
    </BackwardCompatTable>
    <label htmlFor="focusable-after">
      Focusable after
    </label>
    <input id="focusable-after" />
  </>
);

export const ScrollTesting: StoryObj<typeof Table> = {
  render: (args) => <Template {...args} />
};

export const ActionTesting: StoryObj<typeof Table> = {
  render: (args) => <Template {...args} />,
  args: {selectionBehavior: 'replace', selectionStyle: 'highlight', onAction: action('onAction')},
  parameters: {
    a11y: {
      config: {
        // False positive, tabbing into the table is handled by us and will focus the row
        rules: [{id: 'scrollable-region-focusable', enabled: false}]
      }
    }
  }
};

export const BackwardCompatActionTesting: StoryObj<typeof Table> = {
  render: (args) => <TemplateBackwardsCompat {...args} />,
  args: {selectionBehavior: 'replace', selectionStyle: 'highlight', onAction: action('onAction')},
  parameters: {
    a11y: {
      config: {
        // False positive, tabbing into the table is handled by us and will focus the row
        rules: [{id: 'scrollable-region-focusable', enabled: false}]
      }
    }
  }
};

export const TableWithResizingNoProps: StoryObj<typeof Table> = {
  args: {},
  render: (args) => (
    <ResizingTable {...args}>
      <TableHeader columns={columns}>
        {(column) => (
          <Column key={column.uid} allowsResizing>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={defaultRows}>
        {(item) => <Row>{(columnKey) => <Cell>{item[columnKey]}</Cell>}</Row>}
      </TableBody>
    </ResizingTable>
  )
};

interface ColumnData {
  name: string,
  uid: string,
  defaultWidth?: ColumnSize | null,
  width?: ColumnSize | null
}
let columnsDefaultFR: ColumnData[] = [
  {name: 'Name', uid: 'name', defaultWidth: '1fr'},
  {name: 'Type', uid: 'type', defaultWidth: '1fr'},
  {name: 'Level', uid: 'level', defaultWidth: '4fr'}
];

export const TableWithResizingFRs: StoryObj<typeof Table> = {
  args: {},
  render: () => (
    <ResizingTable>
      <TableHeader columns={columnsDefaultFR}>
        {column => (
          <Column key={column.uid} defaultWidth={column.defaultWidth} width={column.width} allowsResizing>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={defaultRows}>
        {item => (
          <Row>
            {columnKey => <Cell>{item[columnKey]}</Cell>}
          </Row>
        )}
      </TableBody>
    </ResizingTable>
  )
};

function ControlledTableResizing(props: {columns: Array<{name: string, uid: string, width?: ColumnSize | null}>, rows: typeof defaultRows[0][], onResize: any}): JSX.Element {
  let {columns, rows = defaultRows, onResize, ...otherProps} = props;
  let [widths, _setWidths] = useState<Map<Key, ColumnSize | null>>(() => new Map(columns.filter(col => col.width).map((col) => [col.uid as Key, col.width ?? null])));

  let setWidths = useCallback((vals: Map<Key, ColumnSize>) => {
    let controlledKeys = new Set(columns.filter(col => col.width).map((col) => col.uid as Key));
    let newVals = new Map(Array.from(vals).filter(([key]) => controlledKeys.has(key)));
    _setWidths(newVals);
    onResize?.(vals);
  }, [columns, onResize]);
  let [savedCols, setSavedCols] = useState(widths);
  let [renderKey, setRenderKey] = useState(Math.random());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let cols = useMemo(() => columns.map(col => ({...col})), [columns, widths]);

  return (
    <div>
      <button onClick={() => setSavedCols(widths)}>Save Cols</button>
      <button
        onClick={() => {
          _setWidths(savedCols);
          setRenderKey(Math.random());
        }}>Restore Cols</button>
      <div>Current saved column state: {'{'}{Array.from(savedCols).map(([key, entry]) => `${key} => ${entry}`).join(',')}{'}'}</div>
      <div key={renderKey}>
        <ResizingTable onResize={setWidths} {...otherProps}>
          <TableHeader columns={cols}>
            {column => (
              <Column {...column} key={column.uid} width={widths.get(column.uid)} allowsResizing>
                {column.name}
              </Column>
            )}
          </TableHeader>
          <TableBody items={rows}>
            {item => (
              <Row>
                {columnKey => <Cell>{item[columnKey]}</Cell>}
              </Row>
            )}
          </TableBody>
        </ResizingTable>
      </div>
    </div>
  );
}

let columnsFR: ColumnData[] = [
  {name: 'Name', uid: 'name', width: '1fr'},
  {name: 'Type', uid: 'type', width: '1fr'},
  {name: 'Level', uid: 'level', width: '5fr'}
];

export const TableWithResizingFRsControlled: StoryObj<typeof ControlledTableResizing> = {
  args: {columns: columnsFR},
  render: (args) => <ControlledTableResizing {...args} />,
  parameters: {description: {data: `
  You can use the buttons to save and restore the column widths. When restoring,
  you will see a quick flash because the entire table is re-rendered. This
  mimics what would happen if an app reloaded the whole page and restored a saved
  column width state.
  `}}
};

let columnsSomeFR: ColumnData[] = [
  {name: 'Name', uid: 'name', width: '1fr'},
  {name: 'Type', uid: 'type', width: '1fr'},
  {name: 'Height', uid: 'height'},
  {name: 'Weight', uid: 'weight'},
  {name: 'Level', uid: 'level', width: '5fr'}
];

export const TableWithSomeResizingFRsControlled: StoryObj<typeof ControlledTableResizing> = {
  args: {columns: columnsSomeFR},
  render: (args) => <ControlledTableResizing {...args} />,
  parameters: {description: {data: `
  You can use the buttons to save and restore the column widths. When restoring,
  you will see a quick flash because the entire table is re-rendered. This
  mimics what would happen if an app reloaded the whole page and restored a saved
  column width state.
  `}}
};

export const DocExample: StoryObj<typeof DocsTable> = {
  args: {},
  render: (args) => (
    <DocsTable
      aria-label="Table with always visible resizers"
      onResizeStart={action('onResizeStart')}
      onResize={action('onResize')}
      onResizeEnd={action('onResizeEnd')}
      {...args}>
      <TableHeader columns={columns}>
        {column => (
          <Column allowsResizing key={column.uid}>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={defaultRows}>
        {item => (
          <Row>
            {columnKey => <Cell>{item[columnKey]}</Cell>}
          </Row>
        )}
      </TableBody>
    </DocsTable>
  )
};

export const DocExampleControlled: StoryObj<typeof ControlledDocsTable> = {
  args: {columns: columnsFR},
  render: (args) => (
    <ControlledDocsTable {...args} />
  )
};

function ControlledDocsTable(props: {columns: Array<{name: string, uid: string, width?: ColumnSize | null}>, rows: any, onResize: any}): JSX.Element {
  let {columns, onResize, ...otherProps} = props;
  let [widths, _setWidths] = useState(() => new Map(columns.filter(col => col.width).map((col) => [col.uid as Key, col.width ?? null])));
  let setWidths = useCallback((newWidths: Map<Key, ColumnSize>) => {
    let controlledKeys = new Set(columns.filter(col => col.width).map((col) => col.uid as Key));
    let newVals = new Map(Array.from(newWidths).filter(([key]) => controlledKeys.has(key)));
    _setWidths(newVals);
  }, [columns]);

  // Needed to get past column caching so new sizes actually are rendered
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let cols = useMemo(() => columns.map(col => ({...col})), [widths, columns]);
  return (
    <DocsTable
      aria-label="Table with selection"
      selectionMode="multiple"
      onResize={onResize ?? setWidths}
      {...otherProps}>
      <TableHeader columns={cols}>
        {column => (
          <Column allowsResizing key={column.uid} width={widths.get(column.uid)}>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={defaultRows}>
        {item => (
          <Row>
            {columnKey => <Cell>{item[columnKey]}</Cell>}
          </Row>
        )}
      </TableBody>
    </DocsTable>
  );
}
