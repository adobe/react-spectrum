/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {Button, Cell, Checkbox, CheckboxProps, Collection, Column, ColumnProps, ColumnResizer, Dialog, DialogTrigger, DropIndicator, Heading, Menu, MenuTrigger, Modal, ModalOverlay, Popover, ResizableTableContainer, Row, Table, TableBody, TableHeader, TableLayout, useDragAndDrop, Virtualizer} from 'react-aria-components';
import {isTextDropItem} from 'react-aria';
import {LoadingSpinner, MyMenuItem} from './utils';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import React, {JSX, startTransition, Suspense, useState} from 'react';
import {Selection, useAsyncList, useListData} from 'react-stately';
import styles from '../example/index.css';
import {TableLoadMoreItem} from '../src/Table';
import './styles.css';

export default {
  title: 'React Aria Components/Table',
  component: Table,
  excludeStories: ['DndTable', 'makePromise', 'MyCheckbox']
} as Meta<typeof Table>;

export type TableStory = StoryFn<typeof Table>;
export type TableStoryObj = StoryObj<typeof Table>;

const ReorderableTable = ({initialItems}: {initialItems: {id: string, name: string}[]}) => {
  let list = useListData({initialItems});

  const {dragAndDropHooks} = useDragAndDrop({
    getItems: keys => {
      return [...keys].filter(k => !!list.getItem(k)).map(k => {
        const item = list.getItem(k);
        return {
          'text/plain': item!.id,
          item: JSON.stringify(item)
        };
      });
    },
    getDropOperation: () => 'move',
    onReorder: e => {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    },
    onInsert: async e => {
      const processedItems = await Promise.all(
        e.items.filter(isTextDropItem).map(async item => JSON.parse(await item.getText('item')))
      );
      if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...processedItems);
      } else if (e.target.dropPosition === 'after') {
        list.insertAfter(e.target.key, ...processedItems);
      }
    },

    onDragEnd: e => {
      if (e.dropOperation === 'move' && !e.isInternal) {
        list.remove(...e.keys);
      }
    },

    onRootDrop: async e => {
      const processedItems = await Promise.all(
        e.items.filter(isTextDropItem).map(async item => JSON.parse(await item.getText('item')))
      );

      list.append(...processedItems);
    }
  });

  return (
    <Table aria-label="Reorderable table" dragAndDropHooks={dragAndDropHooks}>
      <TableHeader>
        <MyColumn isRowHeader defaultWidth="50%">Id</MyColumn>
        <MyColumn>Name</MyColumn>
      </TableHeader>
      <TableBody items={list.items} renderEmptyState={({isDropTarget}) => <span style={{color: isDropTarget ? 'red' : 'black'}}>Drop items here</span>}>
        {item => (
          <Row>
            <Cell>{item.id}</Cell>
            <Cell>{item.name}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

export const ReorderableTableExample: TableStory = () => (
  <>
    <ResizableTableContainer style={{width: 300, overflow: 'auto'}}>
      <ReorderableTable initialItems={[{id: '1', name: 'Bob'}]} />
    </ResizableTableContainer>
    <ResizableTableContainer style={{width: 300, overflow: 'auto'}}>
      <ReorderableTable initialItems={[{id: '2', name: 'Alex'}]} />
    </ResizableTableContainer>
  </>
);

const TableExample: TableStory = (args) => {
  let list = useListData({
    initialItems: [
      {id: 1, name: 'Games', date: '6/7/2020', type: 'File folder'},
      {id: 2, name: 'Program Files', date: '4/7/2021', type: 'File folder'},
      {id: 3, name: 'bootmgr', date: '11/20/2010', type: 'System file'},
      {id: 4, name: 'log.txt', date: '1/18/2016', type: 'Text Document'}
    ]
  });

  return (
    <ResizableTableContainer style={{width: 400, overflow: 'auto'}}>
      <Table aria-label="Example table" {...args}>
        <TableHeader>
          <Column width={30} minWidth={0}><MyCheckbox slot="selection" /></Column>
          <MyColumn isRowHeader defaultWidth="30%">Name</MyColumn>
          <MyColumn>Type</MyColumn>
          <MyColumn>Date Modified</MyColumn>
          <MyColumn>Actions</MyColumn>
        </TableHeader>
        <TableBody items={list.items}>
          {item => (
            <Row>
              <Cell><MyCheckbox slot="selection" /></Cell>
              <Cell>{item.name}</Cell>
              <Cell>{item.type}</Cell>
              <Cell>{item.date}</Cell>
              <Cell>
                <DialogTrigger>
                  <Button>Delete</Button>
                  <ModalOverlay
                    style={{
                      position: 'fixed',
                      zIndex: 100,
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      background: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    <Modal
                      style={{
                        background: 'Canvas',
                        color: 'CanvasText',
                        border: '1px solid gray',
                        padding: 30
                      }}>
                      <Dialog>
                        {({close}) => (<>
                          <Heading slot="title">Delete item</Heading>
                          <p>Are you sure?</p>
                          <Button onPress={close}>Cancel</Button>
                          <Button
                            onPress={() => {
                              close();
                              list.remove(item.id);
                            }}>
                            Delete
                          </Button>
                        </>)}
                      </Dialog>
                    </Modal>
                  </ModalOverlay>
                </DialogTrigger>
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </ResizableTableContainer>
  );
};

export const TableExampleStory: TableStoryObj = {
  render: TableExample,
  args: {
    selectionMode: 'none',
    selectionBehavior: 'toggle',
    escapeKeyBehavior: 'clearSelection'
  },
  argTypes: {
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multiple']
    },
    selectionBehavior: {
      control: 'radio',
      options: ['toggle', 'replace']
    },
    escapeKeyBehavior: {
      control: 'radio',
      options: ['clearSelection', 'none']
    }
  }
};

let columns = [
  {name: 'Name', id: 'name', isRowHeader: true},
  {name: 'Type', id: 'type'},
  {name: 'Date Modified', id: 'date'}
];

let rows = [
  {id: 0, name: 'Games', date: '6/7/2020', type: 'File folder'},
  {id: 1, name: 'Program Files', date: '4/7/2021', type: 'File folder'},
  {id: 2, name: 'bootmgr', date: '11/20/2010', type: 'System file'},
  {id: 3, name: 'log.txt', date: '1/18/20167', type: 'Text Document'}
];

export const TableDynamicExample: TableStory = () => {
  return (
    <Table aria-label="Files">
      <TableHeader columns={columns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={rows}>
        {(item) => (
          <Row columns={columns} id={item.id}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

let timeTableColumns = [
  {name: 'Time', id: 'time', isRowHeader: true},
  {name: 'Monday', id: 'monday'},
  {name: 'Tuesday', id: 'tuesday'},
  {name: 'Wednesday', id: 'wednesday'},
  {name: 'Thursday', id: 'thursday'},
  {name: 'Friday', id: 'friday'}
];

let timeTableRows = [
  {id: 1, time: '08:00 - 09:00', monday: 'Math', tuesday: 'History', wednesday: 'Science', thursday: 'English', friday: 'Art'},
  {id: 2, time: '09:00 - 10:00', name: 'Break', type: 'break'},
  {id: 3, time: '10:00 - 11:00', monday: 'Math', tuesday: 'History', wednesday: 'Science', thursday: 'English', friday: 'Art'},
  {id: 4, time: '11:00 - 12:00', monday: 'Math', tuesday: 'History', wednesday: 'Science', thursday: 'English', friday: 'Art'},
  {id: 5, time: '12:00 - 13:00', name: 'Break', type: 'break'},
  {id: 6, time: '13:00 - 14:00', monday: 'History', tuesday: 'Math', wednesday: 'English', thursday: 'Science', friday: 'Art'}
];

export const TableCellColSpanExample: TableStory = () => {
  return (
    <Table aria-label="Timetable">
      <TableHeader columns={timeTableColumns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={timeTableRows}>
        {(item) => (
          <Row columns={columns}>
            {item.type === 'break' ? (
              <>
                <Cell>{item.time}</Cell>
                <Cell colSpan={5}>{item.name}</Cell>
              </>
            ) : (
              <>
                <Cell>{item.time}</Cell>
                <Cell>{item.monday}</Cell>
                <Cell>{item.tuesday}</Cell>
                <Cell>{item.wednesday}</Cell>
                <Cell>{item.thursday}</Cell>
                <Cell>{item.friday}</Cell>
              </>
            )}
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

export const TableCellColSpanWithVariousSpansExample: TableStory = () => {
  return (
    <Table aria-label="Table with various colspans">
      <TableHeader>
        <Column isRowHeader>Col 1</Column>
        <Column >Col 2</Column>
        <Column >Col 3</Column>
        <Column >Col 4</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>Cell</Cell>
          <Cell colSpan={2}>Span 2</Cell>
          <Cell>Cell</Cell>
        </Row>
        <Row>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
        </Row>
        <Row>
          <Cell colSpan={4}>Span 4</Cell>
        </Row>
        <Row>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
        </Row>
        <Row>
          <Cell colSpan={3}>Span 3</Cell>
          <Cell>Cell</Cell>
        </Row>
        <Row>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
          <Cell>Cell</Cell>
        </Row>
        <Row>
          <Cell>Cell</Cell>
          <Cell colSpan={3}>Span 3</Cell>
        </Row>
      </TableBody>
    </Table>
  );
};

const MyColumn = (props: ColumnProps) => {
  return (
    <Column {...props}>
      {({startResize}) => (
        <div style={{display: 'flex'}}>
          <MenuTrigger>
            <Button style={{flex: 1, textAlign: 'left'}}>{props.children as React.ReactNode}</Button>
            <Popover>
              <Menu className={styles.menu} onAction={() => startResize()}>
                <MyMenuItem id="resize">Resize</MyMenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
          <ColumnResizer onHoverStart={action('onHoverStart')} onHoverChange={action('onHoverChange')} onHoverEnd={action('onHoverEnd')}>
            ↔
          </ColumnResizer>
        </div>
      )}
    </Column>
  );
};

interface FileItem {
  id: string,
  name: string,
  type: string
}

interface DndTableProps {
  initialItems: FileItem[],
  'aria-label': string,
  isDisabled?: boolean,
  isLoading?: boolean,
  onSelectionChange?: (keys: Selection) => void
}

function DndTableRender(props: DndTableProps): JSX.Element {
  let list = useListData({
    initialItems: props.initialItems
  });

  let {dragAndDropHooks} = useDragAndDrop({
    isDisabled: props.isDisabled,
    // Provide drag data in a custom format as well as plain text.
    getItems(keys) {
      return [...keys].filter(k => !!list.getItem(k)).map((key) => {
        let item = list.getItem(key);
        return {
          'custom-app-type': JSON.stringify(item),
          'text/plain': item!.name
        };
      });
    },

    // Accept drops with the custom format.
    acceptedDragTypes: ['custom-app-type'],

    // Ensure items are always moved rather than copied.
    getDropOperation: () => 'move',

    // Handle drops between items from other lists.
    async onInsert(e) {
      let processedItems = await Promise.all(
          e.items
            .filter(isTextDropItem)
            .map(async item => JSON.parse(await item.getText('custom-app-type')))
        );
      if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...processedItems);
      } else if (e.target.dropPosition === 'after') {
        list.insertAfter(e.target.key, ...processedItems);
      }
    },

    // Handle drops on the collection when empty.
    async onRootDrop(e) {
      let processedItems = await Promise.all(
          e.items
            .filter(isTextDropItem)
            .map(async item => JSON.parse(await item.getText('custom-app-type')))
        );
      list.append(...processedItems);
    },

    // Handle reordering items within the same list.
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    },

    // Remove the items from the source list on drop
    // if they were moved to a different list.
    onDragEnd(e) {
      if (e.dropOperation === 'move' && !e.isInternal) {
        list.remove(...e.keys);
      }
    }
  });

  return (
    <Table
      aria-label={props['aria-label']}
      selectionMode="multiple"
      selectedKeys={list.selectedKeys}
      onSelectionChange={(keys) => {
        props.onSelectionChange?.(keys);
        list.setSelectedKeys(keys);
      }}
      dragAndDropHooks={dragAndDropHooks}>
      <TableHeader>
        <Column />
        <Column><MyCheckbox slot="selection" /></Column>
        <Column>ID</Column>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
      </TableHeader>
      <TableBody items={list.items} renderEmptyState={() => renderEmptyLoader({isLoading: props.isLoading, tableWidth: 200})}>
        <Collection items={list.items}>
          {item => (
            <Row>
              <Cell><Button slot="drag">≡</Button></Cell>
              <Cell><MyCheckbox slot="selection" /></Cell>
              <Cell>{item.id}</Cell>
              <Cell>{item.name}</Cell>
              <Cell>{item.type}</Cell>
            </Row>
          )}
        </Collection>
        <MyTableLoadingIndicator isLoading={props.isLoading} />
      </TableBody>
    </Table>
  );
};

export const DndTable: StoryFn<typeof DndTableRender> = (props) => {
  return (
    <DndTableRender {...props} />
  );
};

type DndTableExampleProps = {
  isDisabledFirstTable?: boolean,
  isDisabledSecondTable?: boolean,
  isLoading?: boolean
}

function DndTableExampleRender(props: DndTableExampleProps): JSX.Element {
  return (
    <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
      <DndTableRender
        isLoading={props.isLoading}
        initialItems={[
        {id: '1', type: 'file', name: 'Adobe Photoshop'},
        {id: '2', type: 'file', name: 'Adobe XD'},
        {id: '3', type: 'folder', name: 'Documents'},
        {id: '4', type: 'file', name: 'Adobe InDesign'},
        {id: '5', type: 'folder', name: 'Utilities'},
        {id: '6', type: 'file', name: 'Adobe AfterEffects'}
        ]}
        aria-label="First Table"
        isDisabled={props.isDisabledFirstTable} />
      <DndTableRender
        isLoading={props.isLoading}
        initialItems={[
        {id: '7', type: 'folder', name: 'Pictures'},
        {id: '8', type: 'file', name: 'Adobe Fresco'},
        {id: '9', type: 'folder', name: 'Apps'},
        {id: '10', type: 'file', name: 'Adobe Illustrator'},
        {id: '11', type: 'file', name: 'Adobe Lightroom'},
        {id: '12', type: 'file', name: 'Adobe Dreamweaver'}
        ]}
        aria-label="Second Table"
        isDisabled={props.isDisabledSecondTable} />
    </div>
  );
};

export const DndTableExample: StoryFn<typeof DndTableExampleRender> = (props) => {
  return <DndTableExampleRender {...props} />;
};

DndTableExample.args = {
  isDisabledFirstTable: false,
  isDisabledSecondTable: false,
  isLoading: false
};

export const MyCheckbox = ({children, ...props}: CheckboxProps) => {
  return (
    <Checkbox {...props}>
      {({isIndeterminate}) => (
        <>
          <div className="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              {isIndeterminate
                ? <rect x={1} y={7.5} width={15} height={3} />
                : <polyline points="1 9 7 14 15 4" />}
            </svg>
          </div>
          {children}
        </>
      )}
    </Checkbox>
  );
};

const MyTableLoadingIndicator = (props) => {
  let {tableWidth =  400, ...otherProps} = props;
  return (
    // These styles will make the load more spinner sticky. A user would know if their table is virtualized and thus could control this styling if they wanted to
    // TODO: this doesn't work because the virtualizer wrapper around the table body has overflow: hidden. Perhaps could change this by extending the table layout and
    // making the layoutInfo for the table body have allowOverflow
    <TableLoadMoreItem style={{height: 30, width: tableWidth}} {...otherProps}>
      <LoadingSpinner style={{height: 20, position: 'unset'}} />
    </TableLoadMoreItem>
  );
};

function MyTableBody(props) {
  let {rows, children, isLoading, onLoadMore, tableWidth, ...otherProps} = props;
  return (
    <TableBody {...otherProps}>
      <Collection items={rows}>
        {children}
      </Collection>
      <MyTableLoadingIndicator tableWidth={tableWidth} isLoading={isLoading} onLoadMore={onLoadMore} />
    </TableBody>
  );
}

const TableLoadingBodyWrapper = (args: {isLoadingMore: boolean}): JSX.Element => {
  return (
    <Table aria-label="Files">
      <TableHeader columns={columns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
        )}
      </TableHeader>
      <MyTableBody rows={rows} isLoading={args.isLoadingMore}>
        {(item) => (
          <Row columns={columns}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </MyTableBody>
    </Table>
  );
};

export const TableLoadingBodyWrapperStory: StoryObj<typeof TableLoadingBodyWrapper> = {
  render: TableLoadingBodyWrapper,
  args: {
    isLoadingMore: false
  },
  name: 'Table loading, table body wrapper with collection'
};

function MyRow(props) {
  return (
    <>
      {/* Note that all the props are propagated from MyRow to Row, ensuring the id propagates */}
      <Row {...props} />
      {props.shouldRenderLoader && <MyTableLoadingIndicator isLoading={props.isLoadingMore} /> }
    </>
  );
}

const TableLoadingRowRenderWrapper = (args: {isLoadingMore: boolean}): JSX.Element => {
  return (
    <Table aria-label="Files">
      <TableHeader columns={columns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={rows} dependencies={[args.isLoadingMore]}>
        {(item) => (
          <MyRow columns={columns} shouldRenderLoader={item.id === 4} isLoadingMore={args.isLoadingMore}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </MyRow>
        )}
      </TableBody>
    </Table>
  );
};

export const TableLoadingRowRenderWrapperStory: StoryObj<typeof TableLoadingRowRenderWrapper> = {
  render: TableLoadingRowRenderWrapper,
  args: {
    isLoadingMore: false
  },
  name: 'Table loading, row renderer wrapper and dep array'
};


function renderEmptyLoader({isLoading, tableWidth = 400}) {
  let contents = isLoading ? <LoadingSpinner style={{height: 20, width: 20, transform: 'translate(-50%, -50%)'}} />  : 'No results found';
  return <div style={{height: 30, position: 'sticky', top: 0, left: 0, width: tableWidth}}>{contents}</div>;
}

const RenderEmptyState = (args: {isLoading: boolean}): JSX.Element => {
  let {isLoading} = args;
  return (
    <Table aria-label="Files" selectionMode="multiple">
      <TableHeader columns={columns}>
        <Column><MyCheckbox slot="selection" /></Column>
        <Collection items={columns}>
          {(column) => (

            <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
          )}
        </Collection>
      </TableHeader>
      <TableBody renderEmptyState={() => renderEmptyLoader({isLoading})}>
        <Collection items={[]}>
          {(item) => (
            <Row columns={columns}>
              {(column) => {
                return <Cell>{item[column.id]}</Cell>;
              }}
            </Row>
          )}
        </Collection>
      </TableBody>
    </Table>
  );
};

export const RenderEmptyStateStory: StoryObj<typeof RenderEmptyState> = {
  render: RenderEmptyState,
  args: {
    isLoading: false
  },
  name: 'Empty/Loading Table rendered with TableLoadingIndicator collection element'
};

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const OnLoadMoreTable = (args: {delay: number}): JSX.Element => {
  let list = useAsyncList<Character>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <ResizableTableContainer style={{height: 150, width: 400, overflow: 'auto'}}>
      <Table aria-label="Load more table">
        <TableHeader>
          <Column id="name" isRowHeader style={{position: 'sticky', top: 0, backgroundColor: 'lightgray'}}>Name</Column>
          <Column id="height" style={{position: 'sticky', top: 0, backgroundColor: 'lightgray'}}>Height</Column>
          <Column id="mass" style={{position: 'sticky', top: 0, backgroundColor: 'lightgray'}}>Mass</Column>
          <Column id="birth_year" style={{position: 'sticky', top: 0, backgroundColor: 'lightgray'}}>Birth Year</Column>
        </TableHeader>
        <MyTableBody
          tableWidth={400}
          renderEmptyState={() => renderEmptyLoader({isLoading: list.loadingState === 'loading', tableWidth: 400})}
          isLoading={list.loadingState === 'loadingMore'}
          onLoadMore={list.loadMore}
          rows={list.items}>
          {(item) => (
            <Row id={item.name} style={{width: 'inherit', height: 'inherit'}}>
              <Cell>{item.name}</Cell>
              <Cell>{item.height}</Cell>
              <Cell>{item.mass}</Cell>
              <Cell>{item.birth_year}</Cell>
            </Row>
          )}
        </MyTableBody>
      </Table>
    </ResizableTableContainer>
  );
};

export const OnLoadMoreTableStory: StoryObj<typeof OnLoadMoreTable> = {
  render: OnLoadMoreTable,
  name: 'onLoadMore table',
  args: {
    delay: 50
  }
};

export const VirtualizedTable: TableStory = () => {
  let items: {id: number, foo: string, bar: string, baz: string}[] = [];
  for (let i = 0; i < 1000; i++) {
    items.push({id: i, foo: `Foo ${i}`, bar: `Bar ${i}`, baz: `Baz ${i}`});
  }

  let list = useListData({
    initialItems: items
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].filter(k => !!list.getItem(k)).map(key => ({'text/plain': list.getItem(key)!.foo}));
    },
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    },
    renderDropIndicator(target) {
      return <DropIndicator target={target} style={({isDropTarget}) => ({width: '100%', height: '100%', background: isDropTarget ? 'blue' : 'transparent'})} />;
    }
  });

  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        rowHeight: 25,
        headingHeight: 25
      }}>
      <Table aria-label="virtualized table" selectionMode="multiple" dragAndDropHooks={dragAndDropHooks} style={{height: 400, width: 400, overflow: 'auto', scrollPaddingTop: 25}}>
        <TableHeader style={{background: 'var(--spectrum-gray-100)', width: '100%', height: '100%'}}>
          <Column width={30} minWidth={0} />
          <Column width={30} minWidth={0}><MyCheckbox slot="selection" /></Column>
          <Column isRowHeader><strong>Foo</strong></Column>
          <Column><strong>Bar</strong></Column>
          <Column><strong>Baz</strong></Column>
        </TableHeader>
        <TableBody items={list.items}>
          {item => (
            <Row style={{width: 'inherit', height: 'inherit'}}>
              <Cell><Button slot="drag">≡</Button></Cell>
              <Cell><MyCheckbox slot="selection" /></Cell>
              <Cell>{item.foo}</Cell>
              <Cell>{item.bar}</Cell>
              <Cell>{item.baz}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Virtualizer>
  );
};

export const VirtualizedTableWithResizing: TableStory = () => {
  let items: {id: number, foo: string, bar: string, baz: string}[] = [];
  for (let i = 0; i < 1000; i++) {
    items.push({id: i, foo: `Foo ${i}`, bar: `Bar ${i}`, baz: `Baz ${i}`});
  }

  return (
    <ResizableTableContainer style={{height: 400, width: 400, overflow: 'auto', scrollPaddingTop: 25}}>
      <Virtualizer
        layout={TableLayout}
        layoutOptions={{
          rowHeight: 25,
          headingHeight: 25
        }}>
        <Table aria-label="virtualized table">
          <TableHeader style={{background: 'var(--spectrum-gray-100)', width: '100%', height: '100%'}}>
            <MyColumn isRowHeader>Foo</MyColumn>
            <MyColumn>Bar</MyColumn>
            <MyColumn>Baz</MyColumn>
          </TableHeader>
          <TableBody items={items}>
            {item => (
              <Row style={{width: 'inherit', height: 'inherit'}}>
                <Cell>{item.foo}</Cell>
                <Cell>{item.bar}</Cell>
                <Cell>{item.baz}</Cell>
              </Row>
            )}
          </TableBody>
        </Table>
      </Virtualizer>
    </ResizableTableContainer>
  );
};

function VirtualizedTableWithEmptyState(args: {isLoading: boolean, showRows: boolean}): JSX.Element {
  let rows = [
    {foo: 'Foo 1', bar: 'Bar 1', baz: 'Baz 1'},
    {foo: 'Foo 2', bar: 'Bar 2', baz: 'Baz 2'},
    {foo: 'Foo 3', bar: 'Bar 3', baz: 'Baz 3'},
    {foo: 'Foo 4', bar: 'Bar 4', baz: 'Baz 4'}
  ];

  return (
    <ResizableTableContainer style={{height: 400, width: 400, overflow: 'auto', scrollPaddingTop: 25}}>
      <Virtualizer
        layout={TableLayout}
        layoutOptions={{
          rowHeight: 25,
          headingHeight: 25
        }}>
        <Table aria-label="virtualized table">
          <TableHeader style={{background: 'var(--spectrum-gray-100)', width: '100%', height: '100%'}}>
            <MyColumn isRowHeader>Foo</MyColumn>
            <MyColumn>Bar</MyColumn>
            <MyColumn>Baz</MyColumn>
          </TableHeader>
          <MyTableBody
            isLoading={args.isLoading && args.showRows}
            renderEmptyState={() => renderEmptyLoader({isLoading: !args.showRows && args.isLoading})}
            rows={!args.showRows ? [] : rows}>
            {(item) => (
              <Row id={item.foo} style={{width: 'inherit', height: 'inherit'}}>
                <Cell>{item.foo}</Cell>
                <Cell>{item.bar}</Cell>
                <Cell>{item.baz}</Cell>
              </Row>
            )}
          </MyTableBody>
        </Table>
      </Virtualizer>
    </ResizableTableContainer>
  );
}

export const VirtualizedTableWithEmptyStateStory: StoryObj<typeof VirtualizedTableWithEmptyState> = {
  render: VirtualizedTableWithEmptyState,
  args: {
    isLoading: false,
    showRows: false
  },
  name: 'Virtualized Table With Empty State'
};

const OnLoadMoreTableVirtualized = (args: {delay: number}): JSX.Element => {
  let list = useAsyncList<Character>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        rowHeight: 25,
        headingHeight: 25,
        loaderHeight: 30
      }}>
      <Table aria-label="Load more table virtualized" style={{height: 150, width: 400, overflow: 'auto'}}>
        <TableHeader style={{background: 'var(--spectrum-gray-100)', width: '100%', height: '100%'}}>
          <Column id="name" isRowHeader>Name</Column>
          <Column id="height">Height</Column>
          <Column id="mass">Mass</Column>
          <Column id="birth_year">Birth Year</Column>
        </TableHeader>
        <MyTableBody
          renderEmptyState={() => renderEmptyLoader({isLoading: list.loadingState === 'loading'})}
          isLoading={list.loadingState === 'loadingMore'}
          onLoadMore={list.loadMore}
          rows={list.items}>
          {(item) => (
            <Row id={item.name} style={{width: 'inherit', height: 'inherit'}}>
              <Cell>{item.name}</Cell>
              <Cell>{item.height}</Cell>
              <Cell>{item.mass}</Cell>
              <Cell>{item.birth_year}</Cell>
            </Row>
          )}
        </MyTableBody>
      </Table>
    </Virtualizer>
  );
};

export const OnLoadMoreTableStoryVirtualized: StoryObj<typeof OnLoadMoreTableVirtualized> = {
  render: OnLoadMoreTableVirtualized,
  name: 'Virtualized Table with async loading',
  args: {
    delay: 50
  }
};

const OnLoadMoreTableVirtualizedResizeWrapper = (args: {delay: number}): JSX.Element => {
  let list = useAsyncList<Character>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <ResizableTableContainer style={{height: 150, width: 400, overflow: 'auto'}}>
      <Virtualizer
        layout={TableLayout}
        layoutOptions={{
          rowHeight: 25,
          headingHeight: 25,
          loaderHeight: 30
        }}>
        <Table aria-label="Load more table virtualized">
          <TableHeader style={{background: 'var(--spectrum-gray-100)', width: '100%', height: '100%'}}>
            <Column id="name" isRowHeader>Name</Column>
            <Column id="height">Height</Column>
            <Column id="mass">Mass</Column>
            <Column id="birth_year">Birth Year</Column>
          </TableHeader>
          <MyTableBody
            renderEmptyState={() => renderEmptyLoader({isLoading: list.loadingState === 'loading'})}
            isLoading={list.loadingState === 'loadingMore'}
            onLoadMore={list.loadMore}
            rows={list.items}>
            {(item) => (
              <Row id={item.name} style={{width: 'inherit', height: 'inherit'}}>
                <Cell>{item.name}</Cell>
                <Cell>{item.height}</Cell>
                <Cell>{item.mass}</Cell>
                <Cell>{item.birth_year}</Cell>
              </Row>
            )}
          </MyTableBody>
        </Table>
      </Virtualizer>
    </ResizableTableContainer>
  );
};

export const OnLoadMoreTableVirtualizedResizeWrapperStory: StoryObj<typeof OnLoadMoreTableVirtualizedResizeWrapper> = {
  render: OnLoadMoreTableVirtualizedResizeWrapper,
  name: 'Virtualized Table with async loading, with wrapper around Virtualizer',
  args: {
    delay: 50
  },
  parameters: {
    description: {
      data: 'This table has a ResizableTableContainer wrapper around the Virtualizer. The table itself doesnt have any resizablity, this is simply to test that it still loads/scrolls in this configuration.'
    }
  }
};

interface Launch {
  id: number,
  mission_name: string,
  launch_year: number
}

const items: Launch[] = [
  {id: 0, mission_name: 'FalconSat', launch_year: 2006},
  {id: 1, mission_name: 'DemoSat', launch_year: 2007},
  {id: 2, mission_name: 'Trailblazer', launch_year: 2008},
  {id: 3, mission_name: 'RatSat', launch_year: 2009}
];

export function makePromise(items: Launch[]): Promise<Launch[]> {
  return new Promise(resolve => setTimeout(() => resolve(items), 1000));
}

function TableSuspense({reactTransition = false}: {reactTransition?: boolean}): JSX.Element {
  let [promise, setPromise] = useState(() => makePromise(items.slice(0, 2)));
  let [isPending, startTransition] = React.useTransition();
  return (
    <div>
      <Table aria-label="Suspense table">
        <TableHeader>
          <Column isRowHeader>Name</Column>
          <Column>Year</Column>
        </TableHeader>
        <TableBody>
          <Suspense
            fallback={
              <Row>
                <Cell colSpan={2}>Loading...</Cell>
              </Row>
            }>
            <LocationsTableBody promise={promise} />
          </Suspense>
        </TableBody>
      </Table>
      <button
        onClick={() => {
          let update = () => {
            setPromise(makePromise(items));
          };

          if (reactTransition) {
            startTransition(update);
          } else {
            update();
          }
        }}>
        {isPending ? 'Loading' : 'Load more'}
      </button>
    </div>
  );
}

function LocationsTableBody({promise}) {
  let items = React.use<Launch[]>(promise);

  return items.map(item => (
    <Row key={item.id}>
      <Cell>{item.mission_name}</Cell>
      <Cell>{item.launch_year}</Cell>
    </Row>
  ));
}

export const TableWithSuspense: StoryObj<typeof TableSuspense> = {
  render: React.use != null ? (args) => <TableSuspense {...args} /> : () => <>'This story requires React 19.'</>,
  args: {
    reactTransition: false
  },
  parameters: {
    description: {
      data: 'Expected behavior: With reactTransition=false, rows should be replaced by loading indicator when pressing button. With reactTransition=true, existing rows should remain and loading should appear inside the button.'
    }
  }
};

let rows1 = [
  {
    id: 25,
    name: 'Web Development',
    date: '7/10/2023',
    type: 'File folder'
  },
  {
    id: 26,
    name: 'drivers',
    date: '2/2/2022',
    type: 'System file'
  },
  {
    id: 27,
    name: 'debug.txt',
    date: '12/5/2024',
    type: 'Text Document'
  },
  {
    id: 28,
    name: 'Marketing Plan.pptx',
    date: '3/15/2025',
    type: 'PowerPoint file'
  },
  {
    id: 29,
    name: 'Contract_v3.pdf',
    date: '1/2/2025',
    type: 'PDF Document'
  },
  {
    id: 30,
    name: 'Movies',
    date: '5/20/2024',
    type: 'File folder'
  },
  {
    id: 31,
    name: 'User Manual.docx',
    date: '9/1/2024',
    type: 'Word Document'
  },
  {
    id: 32,
    name: 'Sales Data_Q1.xlsx',
    date: '4/10/2025',
    type: 'Excel file'
  },
  {
    id: 33,
    name: 'archive_old.rar',
    date: '6/1/2023',
    type: 'RAR archive'
  },
  {
    id: 34,
    name: 'logo.svg',
    date: '11/22/2024',
    type: 'SVG image'
  },
  {
    id: 35,
    name: 'main.py',
    date: '10/1/2024',
    type: 'Python file'
  },
  {
    id: 36,
    name: 'base.html',
    date: '8/18/2024',
    type: 'HTML file'
  },
  {
    id: 37,
    name: 'Configurations',
    date: '4/5/2024',
    type: 'File folder'
  },
  {
    id: 38,
    name: 'kernel32.dll',
    date: '9/10/2018',
    type: 'System file'
  },
  {
    id: 39,
    name: 'security_log.txt',
    date: '3/28/2025',
    type: 'Text Document'
  },
  {
    id: 40,
    name: 'Project Proposal v2.pptx',
    date: '1/15/2025',
    type: 'PowerPoint file'
  },
  {
    id: 41,
    name: 'NDA_Signed.pdf',
    date: '12/20/2024',
    type: 'PDF Document'
  },
  {
    id: 42,
    name: 'Downloads',
    date: '7/1/2024',
    type: 'File folder'
  },
  {
    id: 43,
    name: 'Meeting Minutes.docx',
    date: '4/12/2025',
    type: 'Word Document'
  },
  {
    id: 44,
    name: 'Financial Report_FY24.xlsx',
    date: '3/5/2025',
    type: 'Excel file'
  },
  {
    id: 45,
    name: 'data_backup_v1.tar.gz',
    date: '11/8/2024',
    type: 'GZIP archive'
  },
  {
    id: 46,
    name: 'icon.ico',
    date: '6/25/2024',
    type: 'ICO file'
  },
  {
    id: 47,
    name: 'app.config',
    date: '9/30/2024',
    type: 'Configuration file'
  },
  {
    id: 48,
    name: 'Templates',
    date: '2/10/2025',
    type: 'File folder'
  }
];

let rows2 = [
  {
    id: 100,
    name: 'Assets',
    date: '8/15/2024',
    type: 'File folder'
  },
  {
    id: 101,
    name: 'drivers64',
    date: '3/3/2023',
    type: 'System file'
  },
  {
    id: 102,
    name: 'install.log',
    date: '1/8/2025',
    type: 'Text Document'
  },
  {
    id: 103,
    name: 'Product Demo.pptx',
    date: '4/20/2025',
    type: 'PowerPoint file'
  },
  {
    id: 104,
    name: 'Terms_of_Service.pdf',
    date: '2/5/2025',
    type: 'PDF Document'
  },
  {
    id: 105,
    name: 'Animations',
    date: '6/25/2024',
    type: 'File folder'
  },
  {
    id: 106,
    name: 'Release Notes.docx',
    date: '10/1/2024',
    type: 'Word Document'
  },
  {
    id: 107,
    name: 'Financial Projections.xlsx',
    date: '5/12/2025',
    type: 'Excel file'
  },
  {
    id: 108,
    name: 'backup_2023.tar',
    date: '7/1/2024',
    type: 'TAR archive'
  },
  {
    id: 109,
    name: 'thumbnail.jpg',
    date: '12/1/2024',
    type: 'JPEG image'
  },
  {
    id: 110,
    name: 'api_client.py',
    date: '11/15/2024',
    type: 'Python file'
  },
  {
    id: 111,
    name: 'index.html',
    date: '9/28/2024',
    type: 'HTML file'
  },
  {
    id: 112,
    name: 'Resources',
    date: '5/5/2024',
    type: 'File folder'
  },
  {
    id: 113,
    name: 'msvcr100.dll',
    date: '10/10/2019',
    type: 'System file'
  },
  {
    id: 114,
    name: 'system_events.txt',
    date: '4/1/2025',
    type: 'Text Document'
  },
  {
    id: 115,
    name: 'Training Presentation.pptx',
    date: '2/20/2025',
    type: 'PowerPoint file'
  },
  {
    id: 116,
    name: 'Privacy_Policy.pdf',
    date: '1/10/2025',
    type: 'PDF Document'
  },
  {
    id: 117,
    name: 'Desktop',
    date: '8/1/2024',
    type: 'File folder'
  },
  {
    id: 118,
    name: 'Meeting Agenda.docx',
    date: '5/15/2025',
    type: 'Word Document'
  },
  {
    id: 119,
    name: 'Budget_Forecast.xlsx',
    date: '4/15/2025',
    type: 'Excel file'
  },
  {
    id: 120,
    name: 'code_backup.7z',
    date: '12/1/2024',
    type: '7Z archive'
  },
  {
    id: 121,
    name: 'icon_large.ico',
    date: '7/1/2024',
    type: 'ICO file'
  },
  {
    id: 122,
    name: 'settings.ini',
    date: '10/5/2024',
    type: 'Configuration file'
  },
  {
    id: 123,
    name: 'Project Docs',
    date: '3/1/2025',
    type: 'File folder'
  },
  {
    id: 124,
    name: 'winload.exe',
    date: '11/1/2010',
    type: 'System file'
  },
  {
    id: 125,
    name: 'application.log',
    date: '6/1/2025',
    type: 'Text Document'
  },
  {
    id: 126,
    name: 'Client Presentation.pptx',
    date: '3/1/2025',
    type: 'PowerPoint file'
  },
  {
    id: 127,
    name: 'EULA.pdf',
    date: '2/15/2025',
    type: 'PDF Document'
  },
  {
    id: 128,
    name: 'Temporary',
    date: '9/1/2024',
    type: 'File folder'
  },
  {
    id: 129,
    name: 'Action Items.docx',
    date: '6/1/2025',
    type: 'Word Document'
  },
  {
    id: 130,
    name: 'Revenue_Report.xlsx',
    date: '5/20/2025',
    type: 'Excel file'
  },
  {
    id: 131,
    name: 'data_dump.sql',
    date: '1/1/2025',
    type: 'SQL Dump'
  },
  {
    id: 132,
    name: 'image_preview.bmp',
    date: '8/20/2024',
    type: 'Bitmap image'
  },
  {
    id: 133,
    name: 'server.conf',
    date: '11/20/2024',
    type: 'Configuration file'
  },
  {
    id: 134,
    name: 'Documentation',
    date: '4/1/2025',
    type: 'File folder'
  },
  {
    id: 135,
    name: 'hal.dll',
    date: '12/25/2007',
    type: 'System file'
  },
  {
    id: 136,
    name: 'access.log',
    date: '7/1/2025',
    type: 'Text Document'
  },
  {
    id: 137,
    name: 'Strategy Presentation.pptx',
    date: '4/1/2025',
    type: 'PowerPoint file'
  },
  {
    id: 138,
    name: 'Service Agreement.pdf',
    date: '3/1/2025',
    type: 'PDF Document'
  },
  {
    id: 139,
    name: 'Recycle Bin',
    date: '1/1/2000',
    type: 'System folder'
  }
];

const columns1 = [
  {
    id: 'name',
    name: 'Name',
    isRowHeader: true,
    allowsSorting: true
  },
  {
    id: 'type',
    name: 'Type',
    allowsSorting: true
  },
  {
    id: 'date',
    name: 'Date Modified',
    allowsSorting: true
  }
];

export const TableWithReactTransition: TableStory = () => {
  const [show, setShow] = useState(true);
  const items = show ? rows2 : rows1;

  return (
    <div>
      <Button
        onPress={() =>
          startTransition(() => {
            setShow((s) => !s);
          })
        }>
        Toggle data using useState + startTransition
      </Button>
      <Table aria-label="test">
        <TableHeader columns={columns1}>
          {(column) => <Column {...column}>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items}>
          {(row: any) => (
            <Row id={row.id} columns={columns1}>
              {/* @ts-ignore */}
              {(column) => <Cell>{row[column.id]}</Cell>}
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
