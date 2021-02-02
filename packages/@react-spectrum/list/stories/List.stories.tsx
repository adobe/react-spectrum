import {Item, List} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TextField} from '@react-spectrum/textfield';
import {ActionButton} from '@react-spectrum/button';
import {Flex} from '@react-spectrum/layout';
import {Text} from '@react-spectrum/text';
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
    <List>
      <Item>
        <Flex direction="row" margin="10px" gap="10px" alignItems="center">
          <ActionButton>Press1</ActionButton>
          <div>hi there</div>
          <ActionButton>Press2</ActionButton>
        </Flex>
      </Item>
      <Item>
        <Flex margin="10px" gap="10px" alignItems="center">
          <ActionButton>Press1</ActionButton>
          <div>hola</div>
          <ActionButton>Press2</ActionButton>
        </Flex>
      </Item>
      <Item>
        <Flex margin="10px" gap="10px" alignItems="center">
          <TextField />
          <ActionButton>Press2</ActionButton>
        </Flex>
      </Item>
    </List>
  ))
  .add('basic', () => (
    <List>
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
    <List>
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
  ));
