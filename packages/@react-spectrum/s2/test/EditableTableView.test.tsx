/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

jest.mock('@react-aria/live-announcer');
jest.mock('@react-aria/utils/src/scrollIntoView');
import {act, render, within} from '@react-spectrum/test-utils-internal';
import {
  ActionButton,
  Cell,
  Column,
  ColumnProps,
  EditableCell,
  Picker,
  PickerItem,
  Row,
  StatusLight,
  TableBody,
  TableHeader,
  TableView,
  TableViewProps,
  Text,
  TextField
} from '../src';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import {installPointerEvent, pointerMap, User} from '@react-aria/test-utils';
import {Key} from '@react-types/shared';
import React, {useCallback, useEffect, useRef} from 'react';
import {useEffectEvent} from '@react-aria/utils';
import {useListData} from '@react-stately/data';
import userEvent from '@testing-library/user-event';

// @ts-ignore
window.getComputedStyle = (el) => el.style;

describe('TableView', () => {
  let user;
  let offsetWidth, offsetHeight;
  let testUtilUser = new User({advanceTimer: jest.advanceTimersByTime});
  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 400);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 200);
    jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 50);
    jest.useFakeTimers();
  });

  beforeEach(function () {
    user = userEvent.setup({delay: null, pointerMap});
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });
  let defaultItems = [
    {id: 1,
      fruits: 'Apples', task: 'Collect', status: 'Pending', farmer: 'Eva',
      isSaving: {}
    },
    {id: 2,
      fruits: 'Oranges', task: 'Collect', status: 'Pending', farmer: 'Steven',
      isSaving: {}
    },
    {id: 3,
      fruits: 'Pears', task: 'Collect', status: 'Pending', farmer: 'Michael',
      isSaving: {}
    },
    {id: 4,
      fruits: 'Cherries', task: 'Collect', status: 'Pending', farmer: 'Sara',
      isSaving: {}
    },
    {id: 5,
      fruits: 'Dates', task: 'Collect', status: 'Pending', farmer: 'Karina',
      isSaving: {}
    },
    {id: 6,
      fruits: 'Bananas', task: 'Collect', status: 'Pending', farmer: 'Otto',
      isSaving: {}
    },
    {id: 7,
      fruits: 'Melons', task: 'Collect', status: 'Pending', farmer: 'Matt',
      isSaving: {}
    },
    {id: 8,
      fruits: 'Figs', task: 'Collect', status: 'Pending', farmer: 'Emily',
      isSaving: {}
    },
    {id: 9,
      fruits: 'Blueberries', task: 'Collect', status: 'Pending', farmer: 'Amelia',
      isSaving: {}
    },
    {id: 10,
      fruits: 'Blackberries', task: 'Collect', status: 'Pending', farmer: 'Isla',
      isSaving: {}
    }
  ];

  let editableColumns: Array<Omit<ColumnProps, 'children'> & {name: string}> = [
    {name: 'Fruits', id: 'fruits', isRowHeader: true, width: '6fr', minWidth: 300},
    {name: 'Task', id: 'task', width: '2fr', minWidth: 100},
    {name: 'Status', id: 'status', width: '2fr', showDivider: true, minWidth: 100},
    {name: 'Farmer', id: 'farmer', width: '2fr', minWidth: 150}
  ];

  interface EditableTableProps extends TableViewProps {}

  function EditableTable(props: EditableTableProps & {delay?: number, onCancel?: () => void}) {
    let {delay = 0, onCancel} = props;
    let columns = editableColumns;
    let data = useListData({initialItems: defaultItems});

    let saveItem = useEffectEvent((id: Key, columnId: Key) => {
      data.update(id, (prevItem) => ({...prevItem, isSaving: {...prevItem.isSaving, [columnId]: false}}));
      currentRequests.current.delete(id);
    });
    let currentRequests = useRef<Map<Key, {request: ReturnType<typeof setTimeout>}>>(new Map());
    let onChange = useCallback((id: Key, columnId: Key, values: any) => {
      let value = values[columnId];
      if (value === null) {
        return;
      }
      let alreadySaving = currentRequests.current.get(id);
      if (alreadySaving) {
        // remove and cancel the previous request
        currentRequests.current.delete(id);
        clearTimeout(alreadySaving.request);
      }
      data.update(id, (prevItem) => ({...prevItem, [columnId]: value, isSaving: {...prevItem.isSaving, [columnId]: true}}));
    }, [data]);

    useEffect(() => {
      // if any item is saving and we don't have a request for it, start a timer to commit it
      for (const item of data.items) {
        for (const columnId in item.isSaving) {
          if (item.isSaving[columnId] && !currentRequests.current.has(item.id)) {
            let timeout = setTimeout(() => {
              saveItem(item.id, columnId);
            }, delay);
            currentRequests.current.set(item.id, {request: timeout});
          }
        }
      }
    }, [data, delay]);

    return (
      <div>
        <TableView aria-label="Dynamic table" {...props}>
          <TableHeader columns={columns}>
            {(column) => (
              <Column {...column}>{column.name}</Column>
            )}
          </TableHeader>
          <TableBody items={data.items}>
            {item => (
              <Row id={item.id} columns={columns}>
                {(column) => {
                  if (column.id === 'fruits') {
                    return (
                      <EditableCell
                        align={column.align}
                        showDivider={column.showDivider}
                        onSubmit={(e) => {
                          e.preventDefault();
                          let formData = new FormData(e.target as HTMLFormElement);
                          let values = Object.fromEntries(formData.entries());
                          onChange(item.id, column.id!, values);
                        }}
                        onCancel={onCancel}
                        isSaving={item.isSaving[column.id!]}
                        renderEditing={() => (
                          <TextField
                            aria-label="Edit fruit"
                            autoFocus
                            validate={value => value.length > 0 ? null : 'Fruit name is required'}
                            defaultValue={item[column.id!]}
                            name={column.id! as string} />
                        )}>
                        <div>{item[column.id]}<ActionButton slot="edit" aria-label="Edit fruit"><Edit /></ActionButton></div>
                      </EditableCell>
                    );
                  }
                  if (column.id === 'farmer') {
                    return (
                      <EditableCell
                        align={column.align}
                        showDivider={column.showDivider}
                        onSubmit={(e) => {
                          e.preventDefault();
                          let formData = new FormData(e.target as HTMLFormElement);
                          let values = Object.fromEntries(formData.entries());
                          onChange(item.id, column.id!, values);
                        }}
                        onCancel={onCancel}
                        isSaving={item.isSaving[column.id!]}
                        renderEditing={() => (
                          <Picker
                            aria-label="Edit farmer"
                            autoFocus
                            defaultValue={item[column.id!]}
                            name={column.id! as string}>
                            <PickerItem textValue="Eva" id="Eva"><Text>Eva</Text></PickerItem>
                            <PickerItem textValue="Steven" id="Steven"><Text>Steven</Text></PickerItem>
                            <PickerItem textValue="Michael" id="Michael"><Text>Michael</Text></PickerItem>
                            <PickerItem textValue="Sara" id="Sara"><Text>Sara</Text></PickerItem>
                            <PickerItem textValue="Karina" id="Karina"><Text>Karina</Text></PickerItem>
                            <PickerItem textValue="Otto" id="Otto"><Text>Otto</Text></PickerItem>
                            <PickerItem textValue="Matt" id="Matt"><Text>Matt</Text></PickerItem>
                            <PickerItem textValue="Emily" id="Emily"><Text>Emily</Text></PickerItem>
                            <PickerItem textValue="Amelia" id="Amelia"><Text>Amelia</Text></PickerItem>
                            <PickerItem textValue="Isla" id="Isla"><Text>Isla</Text></PickerItem>
                          </Picker>
                        )}>
                        <div>{item[column.id]}<ActionButton slot="edit" aria-label="Edit farmer"><Edit /></ActionButton></div>
                      </EditableCell>
                    );
                  }
                  if (column.id === 'status') {
                    return (
                      <Cell align={column.align} showDivider={column.showDivider}>
                        <StatusLight variant="informative">{item[column.id]}</StatusLight>
                      </Cell>
                    );
                  }
                  return <Cell align={column.align} showDivider={column.showDivider}>{item[column.id!]}</Cell>;
                }}
              </Row>
            )}
          </TableBody>
        </TableView>
        <button>After</button>
      </div>
    );
  }

  describe('keyboard', () => {
    it('should edit text in a cell either through a TextField or a Picker', async () => {
      let {getByRole} = render(
        <EditableTable />
      );

      let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
      await user.tab();
      await user.keyboard('{ArrowRight}');
      let dialogTrigger = document.activeElement! as HTMLElement;
      let dialogTester = testUtilUser.createTester('Dialog', {root: dialogTrigger, interactionType: 'keyboard', overlayType: 'modal'});
      await dialogTester.open();
      let dialog = dialogTester.dialog;
      expect(dialog).toBeVisible();

      let input = within(dialog!).getByRole('textbox');
      expect(input).toHaveFocus();

      await user.keyboard('Apples Crisp');
      await user.keyboard('{Enter}'); // implicitly submit through form

      act(() => {jest.runAllTimers();});

      expect(dialog).not.toBeInTheDocument();

      expect(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).toBeInTheDocument();

      // navigate to Farmer column
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      dialogTrigger = document.activeElement!  as HTMLElement;
      dialogTester = testUtilUser.createTester('Dialog', {root: dialogTrigger, interactionType: 'keyboard', overlayType: 'modal'});
      await dialogTester.open();
      dialog = dialogTester.dialog;
      // TODO: also weird that it is dialog.dialog?
      expect(dialog).toBeVisible();

      let selectTester = testUtilUser.createTester('Select', {root: dialog!});
      expect(selectTester.trigger).toHaveFocus();
      await selectTester.selectOption({option: 'Steven'});
      act(() => {jest.runAllTimers();});
      await user.tab();
      await user.tab();
      expect(within(dialog!).getByRole('button', {name: 'Save'})).toHaveFocus();
      await user.keyboard('{Enter}');

      act(() => {jest.runAllTimers();});

      expect(dialog).not.toBeInTheDocument();
      expect(within(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).getByText('Steven')).toBeInTheDocument();

      await user.tab();
      expect(getByRole('button', {name: 'After'})).toHaveFocus();

      await user.tab({shift: true});
      expect(within(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).getByRole('button', {name: 'Edit farmer'})).toHaveFocus();
    });

    it('should perform validation when editing text in a cell', async () => {
      let {getByRole} = render(
        <EditableTable />
      );

      let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let input = within(dialog).getByRole('textbox');
      expect(input).toHaveFocus();

      await user.clear(input);
      await user.keyboard('{Enter}');

      act(() => {jest.runAllTimers();});

      expect(dialog).toBeInTheDocument();
      expect(input).toHaveFocus();
      expect(document.getElementById(input.getAttribute('aria-describedby')!)).toHaveTextContent('Fruit name is required');

      await user.keyboard('Peaches');
      await user.tab();
      await user.tab();
      await user.keyboard('{Enter}');

      act(() => {jest.runAllTimers();});

      expect(dialog).not.toBeInTheDocument();

      expect(tableTester.findRow({rowIndexOrText: 'Peaches'})).toBeInTheDocument();
    });

    it('should be cancellable through the buttons in the dialog', async () => {
      let onCancel = jest.fn();
      let {getByRole} = render(
        <EditableTable onCancel={onCancel} />
      );

      let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let input = within(dialog).getByRole('textbox');
      expect(input).toHaveFocus();

      await user.keyboard(' Crisp');
      await user.tab();
      await user.keyboard('{Enter}');

      act(() => {jest.runAllTimers();});

      expect(dialog).not.toBeInTheDocument();

      expect(tableTester.findRow({rowIndexOrText: 'Apples'})).toBeInTheDocument();
      expect(onCancel).toHaveBeenCalled();
    });

    it('should be cancellable through Escape key', async () => {
      let onCancel = jest.fn();
      let {getByRole} = render(
        <EditableTable onCancel={onCancel} />
      );

      let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let input = within(dialog).getByRole('textbox');
      expect(input).toHaveFocus();

      await user.keyboard(' Crisp');
      await user.keyboard('{Escape}');

      act(() => {jest.runAllTimers();});

      expect(dialog).not.toBeInTheDocument();
      expect(tableTester.findRow({rowIndexOrText: 'Apples'})).toBeInTheDocument();
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('pointer', () => {
    installPointerEvent();

    it('should edit text in a cell', async () => {
      let {getByRole} = render(
        <EditableTable />
      );

      let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
      await user.click(within(tableTester.findCell({text: 'Apples'})).getByRole('button'));

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      await user.click(within(dialog).getByRole('textbox'));
      await user.keyboard(' Crisp');
      await user.click(document.body);

      act(() => {jest.runAllTimers();});

      expect(dialog).not.toBeInTheDocument();
      expect(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).toBeInTheDocument();
    });
  });

  describe('pending', () => {
    it('should display a pending state when editing a cell', async () => {
      let {getByRole} = render(
        <EditableTable delay={10000} />
      );

      let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let input = within(dialog).getByRole('textbox');
      expect(input).toHaveFocus();

      await user.keyboard('Apples Crisp');
      await user.keyboard('{Enter}'); // implicitly submit through form

      act(() => {jest.advanceTimersByTime(5000);});

      expect(dialog).not.toBeInTheDocument();
      expect(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).toBeInTheDocument();
      let button = within(tableTester.findCell({text: 'Apples Crisp'})).getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveFocus();

      act(() => {jest.runAllTimers();});

      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).toHaveFocus();
    });

    it('should allow tabbing off a pending button', async () => {
      let {getByRole} = render(
        <EditableTable delay={10000} />
      );

      let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();

      let input = within(dialog).getByRole('textbox');
      expect(input).toHaveFocus();

      await user.keyboard('Apples Crisp');
      await user.keyboard('{Enter}'); // implicitly submit through form

      act(() => {jest.advanceTimersByTime(5000);});

      expect(dialog).not.toBeInTheDocument();
      expect(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).toBeInTheDocument();
      let button = within(tableTester.findCell({text: 'Apples Crisp'})).getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveFocus();

      await user.tab();
      expect(getByRole('button', {name: 'After'})).toHaveFocus();

      act(() => {jest.runAllTimers();});

      expect(button).not.toHaveAttribute('aria-disabled');
    });
  });

  if (parseInt(React.version, 10) >= 19) {
    describe('using action instead of onSubmit', () => {
      function ActionEditableTable(props: EditableTableProps & {delay?: number, onCancel?: () => void}) {
        let {delay = 0, onCancel} = props;
        let columns = editableColumns;
        let data = useListData({initialItems: defaultItems});

        let saveItem = useEffectEvent((id: Key, columnId: Key) => {
          data.update(id, (prevItem) => ({...prevItem, isSaving: {...prevItem.isSaving, [columnId]: false}}));
          currentRequests.current.delete(id);
        });
        let currentRequests = useRef<Map<Key, {request: ReturnType<typeof setTimeout>}>>(new Map());
        let onChange = useCallback((id: Key, columnId: Key, values: any) => {
          let value = values.get(columnId);
          if (value === null) {
            return;
          }
          let alreadySaving = currentRequests.current.get(id);
          if (alreadySaving) {
            // remove and cancel the previous request
            currentRequests.current.delete(id);
            clearTimeout(alreadySaving.request);
          }
          data.update(id, (prevItem) => ({...prevItem, [columnId]: value, isSaving: {...prevItem.isSaving, [columnId]: true}}));
        }, [data]);

        useEffect(() => {
          // if any item is saving and we don't have a request for it, start a timer to commit it
          for (const item of data.items) {
            for (const columnId in item.isSaving) {
              if (item.isSaving[columnId] && !currentRequests.current.has(item.id)) {
                let timeout = setTimeout(() => {
                  saveItem(item.id, columnId);
                }, delay);
                currentRequests.current.set(item.id, {request: timeout});
              }
            }
          }
        }, [data, delay]);

        return (
          <div>
            <TableView aria-label="Dynamic table" {...props}>
              <TableHeader columns={columns}>
                {(column) => (
                  <Column {...column}>{column.name}</Column>
                )}
              </TableHeader>
              <TableBody items={data.items}>
                {item => (
                  <Row id={item.id} columns={columns}>
                    {(column) => {
                      if (column.id === 'fruits') {
                        return (
                          <EditableCell
                            align={column.align}
                            showDivider={column.showDivider}
                            action={(e) => {
                              onChange(item.id, column.id!, e);
                            }}
                            onCancel={onCancel}
                            isSaving={item.isSaving[column.id!]}
                            renderEditing={() => (
                              <TextField
                                aria-label="Edit fruit"
                                autoFocus
                                validate={value => value.length > 0 ? null : 'Fruit name is required'}
                                defaultValue={item[column.id!]}
                                name={column.id! as string} />
                            )}>
                            <div>{item[column.id]}<ActionButton slot="edit" aria-label="Edit fruit"><Edit /></ActionButton></div>
                          </EditableCell>
                        );
                      }
                      if (column.id === 'farmer') {
                        return (
                          <EditableCell
                            align={column.align}
                            showDivider={column.showDivider}
                            action={(e) => {
                              onChange(item.id, column.id!, e);
                            }}
                            onCancel={onCancel}
                            isSaving={item.isSaving[column.id!]}
                            renderEditing={() => (
                              <Picker
                                aria-label="Edit farmer"
                                autoFocus
                                defaultValue={item[column.id!]}
                                name={column.id! as string}>
                                <PickerItem textValue="Eva" id="Eva"><Text>Eva</Text></PickerItem>
                                <PickerItem textValue="Steven" id="Steven"><Text>Steven</Text></PickerItem>
                                <PickerItem textValue="Michael" id="Michael"><Text>Michael</Text></PickerItem>
                                <PickerItem textValue="Sara" id="Sara"><Text>Sara</Text></PickerItem>
                                <PickerItem textValue="Karina" id="Karina"><Text>Karina</Text></PickerItem>
                                <PickerItem textValue="Otto" id="Otto"><Text>Otto</Text></PickerItem>
                                <PickerItem textValue="Matt" id="Matt"><Text>Matt</Text></PickerItem>
                                <PickerItem textValue="Emily" id="Emily"><Text>Emily</Text></PickerItem>
                                <PickerItem textValue="Amelia" id="Amelia"><Text>Amelia</Text></PickerItem>
                                <PickerItem textValue="Isla" id="Isla"><Text>Isla</Text></PickerItem>
                              </Picker>
                            )}>
                            <div>{item[column.id]}<ActionButton slot="edit" aria-label="Edit farmer"><Edit /></ActionButton></div>
                          </EditableCell>
                        );
                      }
                      if (column.id === 'status') {
                        return (
                          <Cell align={column.align} showDivider={column.showDivider}>
                            <StatusLight variant="informative">{item[column.id]}</StatusLight>
                          </Cell>
                        );
                      }
                      return <Cell align={column.align} showDivider={column.showDivider}>{item[column.id!]}</Cell>;
                    }}
                  </Row>
                )}
              </TableBody>
            </TableView>
            <button>After</button>
          </div>
        );
      }

      describe('keyboard', () => {
        it('should edit text in a cell either through a TextField or a Picker', async () => {
          let {getByRole} = render(
            <ActionEditableTable />
          );

          let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
          await user.tab();
          await user.keyboard('{ArrowRight}');
          let dialogTrigger = document.activeElement! as HTMLElement;
          let dialogTester = testUtilUser.createTester('Dialog', {root: dialogTrigger, interactionType: 'keyboard', overlayType: 'modal'});
          await dialogTester.open();
          let dialog = dialogTester.dialog;
          expect(dialog).toBeVisible();

          let input = within(dialog!).getByRole('textbox');
          expect(input).toHaveFocus();

          await user.keyboard('Apples Crisp');
          await user.keyboard('{Enter}'); // implicitly submit through form

          act(() => {jest.runAllTimers();});

          expect(dialog).not.toBeInTheDocument();

          expect(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).toBeInTheDocument();

          // navigate to Farmer column
          await user.keyboard('{ArrowRight}');
          await user.keyboard('{ArrowRight}');
          await user.keyboard('{ArrowRight}');
          dialogTrigger = document.activeElement!  as HTMLElement;
          dialogTester = testUtilUser.createTester('Dialog', {root: dialogTrigger, interactionType: 'keyboard', overlayType: 'modal'});
          await dialogTester.open();
          dialog = dialogTester.dialog;
          // TODO: also weird that it is dialog.dialog?
          expect(dialog).toBeVisible();

          let selectTester = testUtilUser.createTester('Select', {root: dialog!});
          expect(selectTester.trigger).toHaveFocus();
          await selectTester.selectOption({option: 'Steven'});
          act(() => {jest.runAllTimers();});
          await user.tab();
          await user.tab();
          expect(within(dialog!).getByRole('button', {name: 'Save'})).toHaveFocus();
          await user.keyboard('{Enter}');

          act(() => {jest.runAllTimers();});

          expect(dialog).not.toBeInTheDocument();
          expect(within(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).getByText('Steven')).toBeInTheDocument();

          await user.tab();
          expect(getByRole('button', {name: 'After'})).toHaveFocus();

          await user.tab({shift: true});
          expect(within(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).getByRole('button', {name: 'Edit farmer'})).toHaveFocus();
        });

        it('should perform validation when editing text in a cell', async () => {
          let {getByRole} = render(
            <ActionEditableTable />
          );

          let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
          await user.tab();
          await user.keyboard('{ArrowRight}');
          await user.keyboard('{Enter}');

          let dialog = getByRole('dialog');
          expect(dialog).toBeVisible();

          let input = within(dialog).getByRole('textbox');
          expect(input).toHaveFocus();

          await user.clear(input);
          await user.keyboard('{Enter}');

          act(() => {jest.runAllTimers();});

          expect(dialog).toBeInTheDocument();
          expect(input).toHaveFocus();
          expect(document.getElementById(input.getAttribute('aria-describedby')!)).toHaveTextContent('Fruit name is required');

          await user.keyboard('Peaches');
          await user.tab();
          await user.tab();
          await user.keyboard('{Enter}');

          act(() => {jest.runAllTimers();});

          expect(dialog).not.toBeInTheDocument();

          expect(tableTester.findRow({rowIndexOrText: 'Peaches'})).toBeInTheDocument();
        });

        it('should be cancellable through the buttons in the dialog', async () => {
          let onCancel = jest.fn();
          let {getByRole} = render(
            <ActionEditableTable onCancel={onCancel} />
          );

          let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
          await user.tab();
          await user.keyboard('{ArrowRight}');
          await user.keyboard('{Enter}');

          let dialog = getByRole('dialog');
          expect(dialog).toBeVisible();

          let input = within(dialog).getByRole('textbox');
          expect(input).toHaveFocus();

          await user.keyboard(' Crisp');
          await user.tab();
          await user.keyboard('{Enter}');

          act(() => {jest.runAllTimers();});

          expect(dialog).not.toBeInTheDocument();

          expect(tableTester.findRow({rowIndexOrText: 'Apples'})).toBeInTheDocument();
          expect(onCancel).toHaveBeenCalled();
        });

        it('should be cancellable through Escape key', async () => {
          let onCancel = jest.fn();
          let {getByRole} = render(
            <ActionEditableTable onCancel={onCancel} />
          );

          let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
          await user.tab();
          await user.keyboard('{ArrowRight}');
          await user.keyboard('{Enter}');

          let dialog = getByRole('dialog');
          expect(dialog).toBeVisible();

          let input = within(dialog).getByRole('textbox');
          expect(input).toHaveFocus();

          await user.keyboard(' Crisp');
          await user.keyboard('{Escape}');

          act(() => {jest.runAllTimers();});

          expect(dialog).not.toBeInTheDocument();
          expect(tableTester.findRow({rowIndexOrText: 'Apples'})).toBeInTheDocument();
          expect(onCancel).toHaveBeenCalled();
        });
      });

      describe('pointer', () => {
        installPointerEvent();

        it('should edit text in a cell', async () => {
          let {getByRole} = render(
            <ActionEditableTable />
          );

          let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
          await user.click(within(tableTester.findCell({text: 'Apples'})).getByRole('button'));

          let dialog = getByRole('dialog');
          expect(dialog).toBeVisible();

          await user.click(within(dialog).getByRole('textbox'));
          await user.keyboard(' Crisp');
          await user.click(document.body);

          act(() => {jest.runAllTimers();});

          expect(dialog).not.toBeInTheDocument();
          expect(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).toBeInTheDocument();
        });
      });

      describe('pending', () => {
        it('should display a pending state when editing a cell', async () => {
          let {getByRole} = render(
            <ActionEditableTable delay={10000} />
          );

          let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
          await user.tab();
          await user.keyboard('{ArrowRight}');
          await user.keyboard('{Enter}');

          let dialog = getByRole('dialog');
          expect(dialog).toBeVisible();

          let input = within(dialog).getByRole('textbox');
          expect(input).toHaveFocus();

          await user.keyboard('Apples Crisp');
          await user.keyboard('{Enter}'); // implicitly submit through form

          act(() => {jest.advanceTimersByTime(5000);});

          expect(dialog).not.toBeInTheDocument();
          expect(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).toBeInTheDocument();
          let button = within(tableTester.findCell({text: 'Apples Crisp'})).getByRole('button');
          expect(button).toHaveAttribute('aria-disabled', 'true');
          expect(button).toHaveFocus();

          act(() => {jest.runAllTimers();});

          expect(button).not.toHaveAttribute('aria-disabled');
          expect(button).toHaveFocus();
        });

        it('should allow tabbing off a pending button', async () => {
          let {getByRole} = render(
            <ActionEditableTable delay={10000} />
          );

          let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
          await user.tab();
          await user.keyboard('{ArrowRight}');
          await user.keyboard('{Enter}');

          let dialog = getByRole('dialog');
          expect(dialog).toBeVisible();

          let input = within(dialog).getByRole('textbox');
          expect(input).toHaveFocus();

          await user.keyboard('Apples Crisp');
          await user.keyboard('{Enter}'); // implicitly submit through form

          act(() => {jest.advanceTimersByTime(5000);});

          expect(dialog).not.toBeInTheDocument();
          expect(tableTester.findRow({rowIndexOrText: 'Apples Crisp'})).toBeInTheDocument();
          let button = within(tableTester.findCell({text: 'Apples Crisp'})).getByRole('button');
          expect(button).toHaveAttribute('aria-disabled', 'true');
          expect(button).toHaveFocus();

          await user.tab();
          expect(getByRole('button', {name: 'After'})).toHaveFocus();

          act(() => {jest.runAllTimers();});

          expect(button).not.toHaveAttribute('aria-disabled');
        });
      });
    });
  }
});
