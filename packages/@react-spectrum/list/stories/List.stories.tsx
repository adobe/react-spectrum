import {ActionButton} from '@react-spectrum/button';
import {Flex} from '@react-spectrum/layout';
import {Item, List} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TextField} from '@react-spectrum/textfield';
import {View} from '@react-spectrum/view';


storiesOf('List', module)
  // .addDecorator(story => (
  //   <List>
  //     <Item>
  //       <TextField />
  //     </Item>
  //   </List>
  // ));
  .add('default', () => (
    <List width="300px">
      <Item>
        <Flex direction="row" gap="10px" alignItems="center">
          <ActionButton>Press1</ActionButton>
          <div>hi there</div>
          <ActionButton>Press2</ActionButton>
        </Flex>
      </Item>
      <Item>
        <Flex gap="10px" alignItems="center">
          <ActionButton>Press1</ActionButton>
          <div>hola</div>
          <ActionButton>Press2</ActionButton>
        </Flex>
      </Item>
      <Item>
        <Flex gap="10px" alignItems="center">
          <TextField />
          <ActionButton>Press2</ActionButton>
        </Flex>
      </Item>
    </List>
  ))
  .add('basic', () => (
    <List width="500px">
      <Item>
        <View margin="10px">row 1</View>
      </Item>
      <Item>
        <View margin="10px">row 2</View>
      </Item>
      <Item>
        <View margin="10px">row 3</View>
      </Item>
    </List>
  ))

  .add('button', () => (
    <List width="500px">
      <Item>
        <View margin="10px">row 1</View>
        <ActionButton>Button 1</ActionButton>
      </Item>
      <Item>
        <View margin="10px">row 2</View>
        <ActionButton>Button 2</ActionButton>
      </Item>
      <Item>
        <View margin="10px">row 3</View>
        <ActionButton>Button 3</ActionButton>
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
      {key: 'n'},
    ];
    return (
      <List items={items} width="500px" height="250px">
        {item =>
          <Item>
            <ActionButton>1 Button {item.key}</ActionButton>
            <ActionButton>2 Button {item.key}</ActionButton>
          </Item>
        }
      </List>
    );
  });
