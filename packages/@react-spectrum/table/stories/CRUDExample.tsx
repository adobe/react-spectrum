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

import {ActionButton, Button} from '@react-spectrum/button';
import {ActionGroup} from '@react-spectrum/actiongroup';
import Add from '@spectrum-icons/workflow/Add';
import {AlertDialog, Dialog, DialogContainer, useDialogContainer} from '@react-spectrum/dialog';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
import {Content} from '@react-spectrum/view';
import Delete from '@spectrum-icons/workflow/Delete';
import {Divider} from '@react-spectrum/divider';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import {Key} from '@react-types/shared';
import More from '@spectrum-icons/workflow/More';
import NoSearchResults from '@spectrum-icons/illustrations/NoSearchResults';
import React, {useState} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {useListData} from '@react-stately/data';

export function CRUDExample(props) {
  let list = useListData({
    initialItems: [
      {id: 1, firstName: 'Sam', lastName: 'Smith', birthday: 'May 3'},
      {id: 2, firstName: 'Julia', lastName: 'Jones', birthday: 'February 10'}
    ]
  });

  let [dialog, setDialog] = useState<{action: Key, item?: any} | null>(null);
  let createItem = (item) => {
    list.prepend({...item, id: Date.now()});
  };

  let selectedCount = list.selectedKeys === 'all' ? list.items.length : list.selectedKeys.size;

  return (
    <Flex direction="column">
      <ActionGroup marginBottom={8} onAction={action => setDialog({action})}>
        <Item key="add" aria-label="Add item"><Add /></Item>
        {selectedCount > 0 
          ? <Item key="bulk-delete" aria-label="Delete selected items"><Delete /></Item>
          : null
        }
      </ActionGroup>
      <TableView
        aria-label="People"
        width={500}
        height={300}
        selectionMode="multiple"
        {...props}
        selectedKeys={list.selectedKeys}
        onSelectionChange={list.setSelectedKeys}
        renderEmptyState={list.items.length === 0 ? () => <EmptyState /> : undefined}>
        <TableHeader>
          <Column isRowHeader key="firstName">First Name</Column>
          <Column isRowHeader key="lastName">Last Name</Column>
          <Column key="birthday">Birthday</Column>
          <Column key="actions" align="end">Actions</Column>
        </TableHeader>
        <TableBody items={list.items}>
          {item =>
            (<Row>
              {column =>
                (<Cell>
                  {column === 'actions'
                    ? <MenuTrigger align="end">
                      <ActionButton isQuiet aria-label="Actions"><More /></ActionButton>
                      <Menu onAction={action => setDialog({action, item})}>
                        <Item key="edit">Edit...</Item>
                        <Item key="delete">Delete...</Item>
                      </Menu>
                    </MenuTrigger>
                    : item[column]
                  }
                </Cell>)
              }
            </Row>)
          }
        </TableBody>
      </TableView>
      <DialogContainer onDismiss={() => setDialog(null)}>
        {dialog?.action === 'add' &&
          <EditDialog
            item={null}
            onConfirm={createItem} />
        }
        {dialog?.action === 'edit' &&
          <EditDialog
            item={dialog.item}
            onConfirm={item => list.update(dialog.item.id, item)} />
        }
        {dialog?.action === 'delete' &&
          <AlertDialog
            title="Delete"
            variant="destructive"
            primaryActionLabel="Delete"
            onPrimaryAction={() => {
              // Add delay so that dialog closes and restores focus
              // to the TableView before removing the row.
              setTimeout(() => list.remove(dialog.item.id), list.items.length === 1 ? 0 : 60);
            }}>
            Are you sure you want to delete {dialog.item.firstName} {dialog.item.lastName}?
          </AlertDialog>
        }
        {dialog?.action === 'bulk-delete' &&
          <AlertDialog
            title="Delete"
            variant="destructive"
            primaryActionLabel="Delete"
            onPrimaryAction={() => list.removeSelectedItems()}>
            Are you sure you want to delete {selectedCount === 1 ? '1 item' : `${selectedCount} items`}?
          </AlertDialog>
        }
      </DialogContainer>
    </Flex>
  );
}

function EditDialog({item, onConfirm}) {
  let dialog = useDialogContainer();
  let [state, setState] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    ...item
  });

  return (
    <Dialog>
      <Heading>{!item ? 'Create item' : 'Edit item'}</Heading>
      <Divider />
      <Content>
        <Form labelPosition="side" width="100%">
          <TextField autoFocus label="First Name" value={state.firstName} onChange={firstName => setState({...state, firstName})} />
          <TextField label="Last Name" value={state.lastName} onChange={lastName => setState({...state, lastName})} />
          <TextField label="Birthday" value={state.birthday} onChange={birthday => setState({...state, birthday})} />
        </Form>
      </Content>
      <ButtonGroup>
        <Button variant="secondary" onPress={dialog.dismiss}>Cancel</Button>
        <Button variant="cta" onPress={() => {dialog.dismiss(); onConfirm(state);}}>{!item ? 'Create' : 'Save'}</Button>
      </ButtonGroup>
    </Dialog>
  );
}

function EmptyState() {
  return (
    <IllustratedMessage>
      <NoSearchResults />
      <Heading>No results</Heading>
    </IllustratedMessage>
  );
}
