import {Button, ComboBox, Input, Item, Label, ListBox, Menu, MenuTrigger, Option, Popover, Select, SelectValue, Separator} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
// import {Item, Section} from 'react-stately';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

export const ComboBoxExample = () => (
  <ComboBox>
    <Label style={{display: 'block'}}>Test</Label>
    <div style={{display: 'flex'}}>
      <Input />
      <Button>
        <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
      </Button>
    </div>
    <Popover placement="bottom end">
      <ListBox className={styles.menu}>
        <MyItem>Foo</MyItem>
        <MyItem>Bar</MyItem>
        <MyItem>Baz</MyItem>
      </ListBox>
    </Popover>
  </ComboBox>
);

export const ComboBoxReusable = () => (
  <ReusableComboBox label="Test">
    <Item>One</Item>
    <Item>Two</Item>
    <Item>Three</Item>
  </ReusableComboBox>
);

export const ListBoxExample = () => (
  <ListBox className={styles.menu} selectionMode="multiple" selectionBehavior="replace">
    <Item className={itemClass}>Foo</Item>
    <Item className={itemClass}>Bar</Item>
    <Item className={itemClass}>Baz</Item>
  </ListBox>
);

export const ListBoxResuable = () => (
  <ReusableListBox selectionMode="multiple" selectionBehavior="replace">
    <Item>One</Item>
    <Item>Two</Item>
    <Item>Three</Item>
  </ReusableListBox>
);

export const SelectExample = () => (
  <Select>
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue />
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover>
      <ListBox className={styles.menu}>
        <Item className={itemClass}>Foo</Item>
        <Item className={itemClass}>Bar</Item>
        <Item className={itemClass}>Baz</Item>
      </ListBox>
    </Popover>
  </Select>
);

export const MenuExample = () => (
  <MenuTrigger>
    <Button aria-label="Menu">☰</Button>
    <Popover>
      <Menu className={styles.menu}>
        <Section title={<span style={{fontSize: '1.2em'}}>Section 1</span>} className={styles.group}>
          <Item className={itemClass}>Foo</Item>
          <Item className={itemClass}>Bar</Item>
          <Item className={itemClass}>Baz</Item>
        </Section>
        <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
        <Section title={<span style={{fontSize: '1.2em'}}>Section 2</span>} className={styles.group}>
          <Item className={itemClass}>Foo</Item>
          <Item className={itemClass}>Bar</Item>
          <Item className={itemClass}>Baz</Item>
        </Section>
      </Menu>
    </Popover>
  </MenuTrigger>
);

function ReusableListBox(props) {
  return (
    <ListBox
      className={styles.menu}
      {...props}
      renderItem={item => (
        <Option item={item} className={itemClass}>
          {({isSelected}) => <>{item.rendered}{isSelected ? ' (selected)' : ''}</>}
        </Option>
      )} />
  );
}

function ReusableComboBox({label, children, ...props}) {
  return (
    <ComboBox {...props}>
      <Label style={{display: 'block'}}>{label}</Label>
      <div style={{display: 'flex'}}>
        <Input />
        <Button>
          <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
        </Button>
      </div>
      <Popover placement="bottom end">
        <ListBox
          className={styles.menu}
          renderItem={item => (
            <Option item={item} className={itemClass}>
              {({isSelected}) => <>{item.rendered}{isSelected ? ' (selected)' : ''}</>}
            </Option>
          )}>
          {children}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}

function itemClass({isFocused, isSelected}) {
  return classNames(styles, 'item', {
    focused: isFocused,
    selected: isSelected
  });
}

function MyItem(props) {
  return <Item {...props} className={itemClass} />;
}
