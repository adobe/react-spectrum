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
import Info from '@spectrum-icons/workflow/Info';
import {Item, ListView} from '../';
import {Link} from '@react-spectrum/link';
import MoreSmall from '@spectrum-icons/workflow/MoreSmall';
import NoSearchResults from '@spectrum-icons/illustrations/src/NoSearchResults';
import React, {useEffect, useState} from 'react';
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
      <Item textValue="row 1">row 1</Item>
      <Item textValue="row 2">row 2</Item>
      <Item textValue="row 3">row 3</Item>
    </ListView>
  ))
  .add('isQuiet', () => (
    <ListView width="250px" isQuiet>
      <Item textValue="row 1">row 1</Item>
      <Item textValue="row 2">row 2</Item>
      <Item textValue="row 3">row 3</Item>
    </ListView>
  ))
  .add('with buttons', () => (
    <ListView width="300px">
      <Item textValue="row 1">
        <Content>row 1</Content>
        <ActionButton>Button 1</ActionButton>
      </Item>
      <Item textValue="row 2">
        <Content>row 2</Content>
        <ActionButton>Button 1</ActionButton>
      </Item>
      <Item textValue="row 3">
        <Content>row 3</Content>
        <ActionButton>Button 1</ActionButton>
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
          <Item key={item.key} textValue={`Item ${item.key}`}>
            <Content>
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
            </Content>
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
    <ListView width="300px" height="300px" loadingState="loading">
      {[]}
    </ListView>
  ))
  .add('density: compact', () => (
    <ListView width="250px" density="compact">
      <Item textValue="row 1">row 1</Item>
      <Item textValue="row 2">row 2</Item>
      <Item textValue="row 3">row 3</Item>
    </ListView>
  ))
  .add('density: spacious', () => (
    <ListView width="250px" density="spacious">
      <Item textValue="row 1">row 1</Item>
      <Item textValue="row 2">row 2</Item>
      <Item textValue="row 3">row 3</Item>
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
      <ActionGroup buttonLabelBehavior="hide" {...props}>
        <Item key="add">
          <Add />
          <Text>Add</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
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
    )))
  .add('actions: ActionGroup + ActionMenu', () =>
    renderActionsExample(props => (
      <>
        <ActionGroup buttonLabelBehavior="hide" {...props} slot="actionGroup">
          <Item key="info">
            <Info />
            <Text>Info</Text>
          </Item>
        </ActionGroup>
        <ActionMenu {...props} slot="actionMenu">
          <Item key="add">
            <Add />
            <Text>Add</Text>
          </Item>
          <Item key="delete">
            <Delete />
            <Text>Delete</Text>
          </Item>
        </ActionMenu>
      </>
    )))
  .add('dynamic items + renderEmptyState', () => (<EmptyTest />))
  .add('selectionStyle: highlight', () => (
    <ListView width="250px" height={400} selectionStyle="highlight" selectionMode="multiple" items={[...Array(20).keys()].map(k => ({key: k, name: `Item ${k}`}))}>
      {item => <Item>{item.name}</Item>}
    </ListView>
  ))
  .add('selectionStyle: highlight, onAction', () => (
    <ListView width="250px" height={400} selectionStyle="highlight" selectionMode="multiple" items={[...Array(20).keys()].map(k => ({key: k, name: `Item ${k}`}))} onAction={action('onAction')}>
      {item => <Item>{item.name}</Item>}
    </ListView>
  ))
  .add('selectionMode: none, onAction', () => (
    <ListView width="250px" height={400} selectionMode="none" items={[...Array(20).keys()].map(k => ({key: k, name: `Item ${k}`}))} onAction={action('onAction')}>
      {item => <Item>{item.name}</Item>}
    </ListView>
  ));

function Example(props?) {
  return (
    <ListView width="250px" onSelectionChange={action('onSelectionChange')} {...props}>
      <Item key="folder1" hasChildItems>
        <Content>folder 1</Content>
      </Item>
      <Item key="row1" textValue="row 1">
        <Content>row 1</Content>
      </Item>
      <Item key="row2" textValue="row 2">
        <Content>row 2</Content>
      </Item>
      <Item key="row3" textValue="row 3">
        <Content>row 3</Content>
      </Item>
    </ListView>
  );
}

function Example2(props?) {
  return (
    <ListView width="250px" onSelectionChange={action('onSelectionChange')} {...props}>
      <Item key="folder1" hasChildItems>
        <Link>folder 1</Link>
      </Item>
      <Item textValue="row 1">
        <Content>row 1</Content>
      </Item>
      <Item textValue="row 2">
        <Content>row 2</Content>
      </Item>
      <Item textValue="row 3">
        <Content>row 3</Content>
      </Item>
    </ListView>
  );
}

function renderActionsExample(renderActions, props?) {
  return (
    <ListView width="300px" selectionMode="single" {...props} onSelectionChange={keys => console.log('sel', keys)}>
      <Item key="a" textValue="folder 1" hasChildItems>
        <Folder />
        <Link>folder 1</Link>
        <Text slot="description">description for folder 1</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="b" textValue="row 1">
        <Text>row 1</Text>
        <Text slot="description">description for row 1</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="c" textValue="row 2">
        <Text>row 2</Text>
        <Text slot="description">description for row 2</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="d" textValue="row 3">
        <Text>row 3</Text>
        <Text slot="description">description for row 3</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
    </ListView>
  );
}

let i = 0;
function EmptyTest() {
  const [items, setItems] = useState([]);
  const [divProps, setDivProps] = useState({});

  useEffect(() => {
    let newItems = [];
    for (i = 0; i < 20; i++) {
      newItems.push({key: i, name: `Item ${i}`});
    }
    setItems(newItems);
  }, []);

  const renderEmpty = () => (
    <IllustratedMessage>
      <NoSearchResults />
      <Heading>No items</Heading>
    </IllustratedMessage>
  );
  let hasDivProps = Object.keys(divProps).length > 0;
  return (
    <div>
      <Flex direction="row">
        <div {...divProps}>
          <ListView items={items} width="250px" height={hasDivProps ? null : '500px'} renderEmptyState={renderEmpty}>
            {
              item => (
                <Item key={item.key}>
                  <Content>{item.name}</Content>
                </Item>
              )
            }
          </ListView>
        </div>
        <div style={{paddingLeft: '10px'}}>
          <ActionButton
            isDisabled={hasDivProps}
            onPress={() => setDivProps({style: {display: 'flex', flexGrow: 1, minWidth: '200px', maxHeight: '500px'}})}>
            Use flex div wrapper (no set height)
          </ActionButton>
          <Flex gap={10} marginTop={10}>
            <ActionButton onPress={() => setItems([])}>
              Clear All
            </ActionButton>
            <ActionButton
              onPress={() => {
                let newArr = [...items];
                newArr.push({key: i++, name: `Item ${i}`});
                setItems(newArr);
              }}>
              Add 1
            </ActionButton>
            <ActionButton
              onPress={() => {
                let newItems = [...items];
                setItems(newItems.slice(0, 4));
              }}>
              Slice (0, 4)
            </ActionButton>
          </Flex>
        </div>
      </Flex>
    </div>
  );
}
