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

import {Button} from '@react-spectrum/button';
import {Cell, Column, Row, SpectrumColumnProps, TableBody, TableHeader, TableView} from '../';
import {ColumnSize} from '@react-types/table';
import {Key} from '@react-types/shared';
import React, {useCallback, useMemo, useState} from 'react';

export interface PokemonColumn extends Omit<SpectrumColumnProps<any>, 'children'> {
  name: string,
  uid: string,
  width?: ColumnSize | null
}
export interface PokemonData {
  id: number,
  name: string,
  type: string,
  level: string,
  weight: string,
  height: string
}
let defaultColumns: PokemonColumn[] = [
  {name: 'Name', uid: 'name', width: '1fr'},
  {name: 'Type', uid: 'type', width: '1fr'},
  {name: 'Height', uid: 'height'},
  {name: 'Weight', uid: 'weight'},
  {name: 'Level', uid: 'level', width: '5fr'}
];

let defaultRows: PokemonData[] = [
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
];

export function ControllingResize(props: {columns?: PokemonColumn[], rows?: PokemonData[], onResize?: (sizes: Map<Key, ColumnSize>) => void, [name: string]: any}) {
  let {columns = defaultColumns, rows = defaultRows, onResize, ...otherProps} = props;
  let [widths, _setWidths] = useState<Map<Key, ColumnSize | null>>(() => new Map(columns.filter(col => col.width).map((col) => [col.uid as Key, col.width ?? null])));

  let setWidths = useCallback((vals: Map<Key, ColumnSize>) => {
    let controlledKeys = new Set(columns.filter(col => col.width).map((col) => col.uid as Key));
    let newVals = new Map(Array.from(vals).filter(([key]) => controlledKeys.has(key)));
    _setWidths(newVals);
    onResize?.(vals);
  }, [onResize, columns, _setWidths]);
  let [savedCols, setSavedCols] = useState(widths);
  let [renderKey, setRenderKey] = useState(() => Math.random());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let cols = useMemo(() => columns.map(col => ({...col})), [columns, widths]);

  return (
    <div>
      <Button variant="accent" onPress={() => setSavedCols(widths)}>Save Cols</Button>
      <Button
        variant="accent"
        onPress={() => {
          _setWidths(savedCols);
          setRenderKey(Math.random());
        }}>Restore Cols</Button>
      <div>Current saved column state: {'{'}{Array.from(savedCols).map(([key, entry]) => `${key} => ${entry}`).join(',')}{'}'}</div>
      <div key={renderKey}>
        <TableView aria-label="Table with resizable columns" onResize={setWidths} {...otherProps}>
          <TableHeader columns={cols}>
            {column => <Column {...column} key={column.uid} width={widths.get(column.uid)} allowsResizing>{column.name}</Column>}
          </TableHeader>
          <TableBody items={rows}>
            {item => (
              <Row>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </div>
    </div>
  );
}
