import {ActionButton} from '@react-spectrum/button';
import Add from '@spectrum-icons/workflow/Add';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';
import {Flex} from '@react-spectrum/layout';
import {Item, List} from '../';
import {Menu, MenuTrigger} from '@react-spectrum/menu';
import MoreSmall from '@spectrum-icons/workflow/MoreSmall';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';
import {View} from '@react-spectrum/view';

storiesOf('List', module)
  .add('default', () => (
    <List width="250px">
      <Item>row 1</Item>
      <Item>row 2</Item>
      <Item>row 3</Item>
    </List>
  ))

  .add('with buttons', () => (
    <List width="300px">
      <Item>
        <Flex alignItems="center">
          <View flexGrow={1}>row 1</View>
          <ActionButton>Button 1</ActionButton>
        </Flex>
      </Item>
      <Item>
        <Flex alignItems="center">
          <View flexGrow={1}>row 2</View>
          <ActionButton>Button 1</ActionButton>
        </Flex>
      </Item>
      <Item>
        <Flex alignItems="center">
          <View flexGrow={1}>row 3</View>
          <ActionButton>Button 1</ActionButton>
        </Flex>
      </Item>
    </List>
  ))
  .add('dynamic items', () => {
    const items = [
      {key: 'a'},
      {key: 'b'},
      {key: 'c'},
      {key: 'd'},
      {key: 'e'},
      {key: 'f'},
      {key: 'g'},
      {key: 'h'},
      {key: 'i'},
      {key: 'j'},
      {key: 'k'},
      {key: 'l'},
      {key: 'm'},
      {key: 'n'}
    ];
    return (
      <List items={items} width="300px" height="250px">
        {item => (
          <Item>
            <Flex alignItems="center" gap="10px">
              <View flexGrow={1}>Item {item.key}</View>
              <ActionButton><Add /></ActionButton>
              <MenuTrigger>
                <ActionButton><MoreSmall /></ActionButton>
                <Menu>
                  <Item>
                    <Edit />
                    <Text>Edit</Text>
                  </Item>
                  <Item>
                    <Delete />
                    <Text>Delete</Text>
                  </Item>
                </Menu>
              </MenuTrigger>
            </Flex>
          </Item>
        )}
      </List>
    );
  });
