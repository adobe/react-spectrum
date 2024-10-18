/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {addWindowFocusTracking} from '../src';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/table';
import Frame from 'react-frame-component';
import {Key} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import React, {useEffect, useRef, useState} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {useButton} from '@react-aria/button';
import {useFocusRing} from '@react-aria/focus';

interface IColumn {
  name: string,
  key: string
}
interface RowValue {
  key: string
}

let manyColumns: IColumn[] = [];
for (let i = 0; i < 100; i++) {
  manyColumns.push(
    i === 0
      ? {name: 'Column name', key: 'C0'}
      : {name: 'Column ' + i, key: 'C' + i}
  );
}

let manyRows: RowValue[] = [];
for (let i = 0; i < 1000; i++) {
  let row = {key: 'R' + i};
  for (let j = 0; j < 100; j++) {
    row['C' + j] = j === 0 ? `Row ${i}` : `${i}, ${j}`;
  }

  manyRows.push(row);
}

export default {
  title: 'useFocusRing'
};

export const SearchTableview = {
  render: () => <SearchExample />,
  name: 'search + tableview',
  parameters: {
    a11y: {
      config: {
        // Fails due to TableView's known issue, ignoring here since it isn't pertinent to the story
        rules: [{id: 'aria-required-children', selector: '*:not([role="grid"])'}]
      }
    }
  }
};

export const IFrame = {
  render: () => <IFrameExample />,
  name: 'focus state in dynamic iframe'
};

function SearchExample() {
  const [items, setItems] = useState(manyRows);

  return (
    <div>
      <SearchField
        aria-label="table searchfield"
        onChange={(value) => {
          const newItems = manyRows.filter((item) =>
            item['C0'].toLowerCase().includes(value.toLowerCase())
          );
          setItems(newItems);
        }} />
      <TableView aria-label="Searchable table with many columns and rows" selectionMode="multiple" width={700} height={500}>
        <TableHeader columns={manyColumns}>
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.key}>
              {(key: Key) => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </TableView>
    </div>
  );
}

function MyButton(props) {
  const buttonRef = props.btnRef;

  const {focusProps, isFocusVisible, isFocused} = useFocusRing();
  let {buttonProps} = useButton(props, buttonRef);

  return (
    <button ref={buttonRef} {...mergeProps(focusProps, buttonProps)}>
      Focus Visible: {isFocusVisible ? 'true' : 'false'} <br />
      Focused: {isFocused ? 'true' : 'false'}
    </button>
  );
}

const IFrameExample = (props) => {
  let btnRef = useRef(null);
  useEffect(() => {
    return addWindowFocusTracking(btnRef.current);
  }, []);

  return (
    <>
      <MyButton />
      <Frame {...props}>
        <MyButton btnRef={btnRef} />
        <MyButton />
        <MyButton />
      </Frame>
    </>
  );
};
