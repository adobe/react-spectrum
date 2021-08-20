import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import {ActionGroup} from '@react-spectrum/actiongroup';
import {ActionMenu, Menu, MenuTrigger} from '@react-spectrum/menu';
import Add from '@spectrum-icons/workflow/Add';
import {Content, View} from '@react-spectrum/view';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';
import {Flex} from '@react-spectrum/layout';
import Folder from '@spectrum-icons/workflow/Folder';
import {Heading, Text} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Item, ListView} from '../';
import {Link} from '@react-spectrum/link';
import MoreSmall from '@spectrum-icons/workflow/MoreSmall';
import React from 'react';
import {storiesOf} from '@storybook/react';


function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found</Content>
    </IllustratedMessage>
  );
}

storiesOf('ListView', module)
  .add('default', () => (
    <ListView width="250px">
      <Item textValue="row1">row 1</Item>
      <Item textValue="row2">row 2</Item>
      <Item textValue="row3">row 3</Item>
    </ListView>
  ))
  .add('with buttons', () => (
    <ListView width="300px">
      <Item textValue="one">
        <Flex alignItems="center">
          <View flexGrow={1}>row 1</View>
          <ActionButton>Button 1</ActionButton>
        </Flex>
      </Item>
      <Item textValue="two">
        <Flex alignItems="center">
          <View flexGrow={1}>row 2</View>
          <ActionButton>Button 1</ActionButton>
        </Flex>
      </Item>
      <Item textValue="three">
        <Flex alignItems="center">
          <View flexGrow={1}>row 3</View>
          <ActionButton>Button 1</ActionButton>
        </Flex>
      </Item>
    </ListView>
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
      <ListView items={items} width="300px" height="250px">
        {(item) => (
          <Item key={item.key}>
            <Flex alignItems="center" gap="10px">
              <View flexGrow={1}>Item {item.key}</View> {/* TODO */}
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
      </ListView>
    );
  })
  .add('empty list', () => (
    <ListView width="300px" height="300px" renderEmptyState={renderEmptyState}>
      {[]}
    </ListView>
  ))
  .add('loading', () => (
    <ListView width="300px" height="300px" isLoading>
      {[]}
    </ListView>
  ))
  .add('density: compact', () => (
    <ListView width="250px" density="compact">
      <Item textValue="row1">row 1</Item>
      <Item textValue="row2">row 2</Item>
      <Item textValue="row3">row 3</Item>
    </ListView>
  ))
  .add('density: spacious', () => (
    <ListView width="250px" density="spacious">
      <Item textValue="row1">row 1</Item>
      <Item textValue="row2">row 2</Item>
      <Item textValue="row3">row 3</Item>
    </ListView>
  ))
  .add('selection: none', () => (
    <Example selectionMode="none" />
  ))
  .add('selection: single, checkbox', () => (
    <Example selectionMode="single" />
  ))
  .add('selection: single, checkbox, disabled', () => (
    <Example selectionMode="single" disabledKeys={['row1']} />
  ))
  .add('selection: multiple, checkbox', () => (
    <Example selectionMode="multiple" />
  ))
  .add('parent link example', () => (
    <Example2 selectionMode="multiple" />
  ))
  .add('actions: ActionButton', () =>
    renderActionsExample(props => <ActionButton {...props}><Copy /></ActionButton>))
  .add('actions: ActionGroup', () =>
    renderActionsExample(props => (
      <ActionGroup {...props}>
        <Item key="add"><Add /></Item>
        <Item key="delete"><Delete /></Item>
      </ActionGroup>
    )))
  .add('actions: ActionMenu', () =>
    renderActionsExample(props => (
      <ActionMenu {...props}>
        <Item key="add">
          <Add />
          <Text>Add</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionMenu>
    )));

function Example(props?) {
  return (
    <ListView width="250px" onAction={action('onAction')} {...props}>
      <Item key="folder1" hasChildItems>
        <Content>folder 1</Content>
      </Item>
      <Item key="row1">
        <Content>row 1</Content>
      </Item>
      <Item key="row2">
        <Content>row 2</Content>
      </Item>
      <Item key="row3">
        <Content>row 3</Content>
      </Item>
    </ListView>
  );
}

function Example2(props?) {
  return (
    <ListView width="250px" {...props}>
      <Item key="folder1" hasChildItems>
        <Link>folder 1</Link>
      </Item>
      <Item textValue="row1">
        <Content>row 1</Content>
      </Item>
      <Item textValue="row2">
        <Content>row 2</Content>
      </Item>
      <Item textValue="row3">
        <Content>row 3</Content>
      </Item>
    </ListView>
  );
}

function renderActionsExample(renderActions, props?) {
  return (
    <ListView width="300px" {...props}>
      <Item textValue="row1" hasChildItems>
        <Folder />
        <Link>folder 1</Link>
        <Text slot="description">description for folder 1</Text>
        {renderActions({onPress: () => console.log('row 1')})}
      </Item>
      <Item textValue="row1">
        <Text>row 1</Text>
        <Text slot="description">description for row 1</Text>
        {renderActions({onPress: () => console.log('row 1')})}
      </Item>
      <Item textValue="row2">
        <Text>row 2</Text>
        <Text slot="description">description for row 2</Text>
        {renderActions({onPress: () => console.log('row 2')})}
      </Item>
      <Item textValue="row3">
        <Text>row 3</Text>
        <Text slot="description">description for row 3</Text>
        {renderActions({onPress: () => console.log('row 3')})}
      </Item>
    </ListView>
  );
}
