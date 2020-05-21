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
import {AlertDialog, Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {Content} from '@react-spectrum/view';
import Delete from '@spectrum-icons/workflow/Delete';
import {Divider} from '@react-spectrum/divider';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import {Heading} from '@react-spectrum/typography';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import {Modal} from '@react-spectrum/overlays';
import More from '@spectrum-icons/workflow/More';
import React, {useState} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {useListData} from '@react-stately/data';

export function CRUDExample() {
  let list = useListData({
    initialItems: [
      {id: 1, firstName: 'Sam', lastName: 'Smith', birthday: 'May 3'},
      {id: 2, firstName: 'Julia', lastName: 'Jones', birthday: 'February 10'}
    ]
  });

  let [editingItem, setEditingItem] = useState(null);
  let [deletingItem, setDeletingItem] = useState(null);

  let createItem = (item) => {
    list.prepend({...item, id: list.items.length + 1});
  };

  let editItem = (id, item) => {
    list.update(id, item);
    setEditingItem(null);
  };

  let deleteItem = (item) => {
    list.remove(item.id);
    setDeletingItem(null);
  };

  let deleteSelectedItems = () => {
    list.removeSelectedItems();
  };

  let onAction = (action, item) => {
    switch (action) {
      case 'edit':
        setEditingItem(item);
        break;
      case 'delete':
        setDeletingItem(item);
        break;
    }
  };

  let selectedCount = list.selectedKeys === 'all' ? list.items.length : list.selectedKeys.size;

  return (
    <Flex direction="column">
      <ActionGroup selectionMode="none" marginBottom={8}>
        <DialogTrigger>
          <Item aria-label="Add item"><Add /></Item>
          {onClose => <EditDialog item={null} onClose={onClose} onConfirm={createItem} />}
        </DialogTrigger>
        {selectedCount > 0 &&
          <DialogTrigger>
            <Item aria-label="Delete selected items"><Delete /></Item>
            <AlertDialog title="Delete" variant="destructive" primaryActionLabel="Delete" onPrimaryAction={deleteSelectedItems}>
              Are you sure you want to delete {selectedCount === 1 ? '1 item' : `${selectedCount} items`}?
            </AlertDialog>
          </DialogTrigger>
        }
      </ActionGroup>
      <Table width={500} height={300} isQuiet selectedKeys={list.selectedKeys} onSelectionChange={list.setSelectedKeys}>
        <TableHeader>
          <Column isRowHeader uniqueKey="firstName">First Name</Column>
          <Column isRowHeader uniqueKey="lastName">Last Name</Column>
          <Column uniqueKey="birthday">Birthday</Column>
          <Column uniqueKey="actions" align="end">Actions</Column>
        </TableHeader>
        <TableBody items={list.items}>
          {item =>
            (<Row>
              {column =>
                (<Cell>
                  {column === 'actions'
                    ? <MenuTrigger align="end">
                      <ActionButton isQuiet aria-label="Actions"><More /></ActionButton>
                      <Menu onAction={action => onAction(action, item)}>
                        <Item uniqueKey="edit">Edit...</Item>
                        <Item uniqueKey="delete">Delete...</Item>
                      </Menu>
                    </MenuTrigger>
                    : item[column]
                  }
                </Cell>)
              }
            </Row>)
          }
        </TableBody>
      </Table>
      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)}>
        <EditDialog
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onConfirm={item => editItem(editingItem.id, item)} />
      </Modal>
      <Modal isOpen={!!deletingItem} onClose={() => setDeletingItem(null)}>
        <AlertDialog title="Delete" variant="destructive" primaryActionLabel="Delete" onPrimaryAction={() => deleteItem(deletingItem)}>
          Are you sure you want to delete {deletingItem?.firstName} {deletingItem?.lastName}?
        </AlertDialog>
      </Modal>
    </Flex>
  );
}

function EditDialog({item, onClose, onConfirm}) {
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
        <Button variant="secondary" onPress={onClose}>Cancel</Button>
        <Button variant="cta" onPress={() => {onClose(); onConfirm(state);}}>{!item ? 'Create' : 'Save'}</Button>
      </ButtonGroup>
    </Dialog>
  );
}
