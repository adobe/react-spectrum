import {Button, Calendar, CalendarGrid, ComboBox, DateField, DateInput, DatePicker, DateRangePicker, DateSegment, Group, Heading, Input, Item, Label, ListBox, Menu, MenuTrigger, NumberField, Option, Popover, RangeCalendar, Section, Select, SelectValue, Separator, TimeField} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import clsx from 'clsx';
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
    <MyItem>Foo</MyItem>
    <MyItem>Bar</MyItem>
    <MyItem>Baz</MyItem>
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
        <MyItem>Foo</MyItem>
        <MyItem>Bar</MyItem>
        <MyItem>Baz</MyItem>
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
          <MyItem>Foo</MyItem>
          <MyItem>Bar</MyItem>
          <MyItem>Baz</MyItem>
        </Section>
        <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
        <Section title={<span style={{fontSize: '1.2em'}}>Section 2</span>} className={styles.group}>
          <MyItem>Foo</MyItem>
          <MyItem>Bar</MyItem>
          <MyItem>Baz</MyItem>
        </Section>
      </Menu>
    </Popover>
  </MenuTrigger>
);

export const NumberFieldExample = () => (
  <NumberField formatOptions={{style: 'currency', currency: 'USD'}}>
    <Label>Test</Label>
    <Group style={{display: 'flex'}}>
      <Button slot="decrement">-</Button>
      <Input />
      <Button slot="increment">+</Button>
    </Group>
  </NumberField>
);

export const DateFieldExample = () => (
  <DateField>
    <Label style={{display: 'block'}}>Date</Label>
    <DateInput className={styles.field}>
      {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
    </DateInput>
  </DateField>
);

export const TimeFieldExample = () => (
  <TimeField>
    <Label style={{display: 'block'}}>Time</Label>
    <DateInput className={styles.field}>
      {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
    </DateInput>
  </TimeField>
);

export const CalendarExample = () => (
  <Calendar style={{width: 220}}>
    <div style={{display: 'flex', alignItems: 'center'}}>
      <Button slot="previous">&lt;</Button>
      <Heading style={{flex: 1, textAlign: 'center'}} />
      <Button slot="next">&gt;</Button>
    </div>
    <CalendarGrid style={{width: '100%'}}>
      {({formattedDate, isSelected, isOutsideVisibleRange}) => (
        <div hidden={isOutsideVisibleRange} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
          {formattedDate}
        </div>
      )}
    </CalendarGrid>
  </Calendar>
);

export const CalendarMultiMonth = () => (
  <Calendar style={{width: 500}} visibleDuration={{months: 2}}>
    <div style={{display: 'flex', alignItems: 'center'}}>
      <Button slot="previous">&lt;</Button>
      <Heading style={{flex: 1, textAlign: 'center'}} />
      <Button slot="next">&gt;</Button>
    </div>
    <div style={{display: 'flex', gap: 20}}>
      <CalendarGrid style={{flex: 1}}>
        {({formattedDate, isSelected, isOutsideMonth}) => (
          <div hidden={isOutsideMonth} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
            {formattedDate}
          </div>
        )}
      </CalendarGrid>
      <CalendarGrid style={{flex: 1}} offset={{months: 1}}>
        {({formattedDate, isSelected, isOutsideMonth}) => (
          <div hidden={isOutsideMonth} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
            {formattedDate}
          </div>
        )}
      </CalendarGrid>
    </div>
  </Calendar>
);

export const RangeCalendarExample = () => (
  <RangeCalendar style={{width: 220}}>
    <div style={{display: 'flex', alignItems: 'center'}}>
      <Button slot="previous">&lt;</Button>
      <Heading style={{flex: 1, textAlign: 'center'}} />
      <Button slot="next">&gt;</Button>
    </div>
    <CalendarGrid style={{width: '100%'}}>
      {({formattedDate, isSelected, isOutsideVisibleRange}) => (
        <div hidden={isOutsideVisibleRange} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
          {formattedDate}
        </div>
      )}
    </CalendarGrid>
  </RangeCalendar>
);

export const DatePickerExample = () => (
  <DatePicker>
    <Label style={{display: 'block'}}>Date</Label>
    <Group style={{display: 'inline-flex'}}>
      <DateInput className={styles.field}>
        {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
      </DateInput>
      <Button>🗓</Button>
    </Group>
    <Popover
      placement="bottom start"
      style={{
        background: 'Canvas',
        color: 'CanvasText',
        border: '1px solid gray',
        padding: 20
      }}>
      <Calendar style={{width: 220}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Button slot="previous">&lt;</Button>
          <Heading style={{flex: 1, textAlign: 'center'}} />
          <Button slot="next">&gt;</Button>
        </div>
        <CalendarGrid style={{width: '100%'}}>
          {({formattedDate, isSelected, isOutsideVisibleRange}) => (
            <div hidden={isOutsideVisibleRange} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
              {formattedDate}
            </div>
          )}
        </CalendarGrid>
      </Calendar>
    </Popover>
  </DatePicker>
);

export const DateRangePickerExample = () => (
  <DateRangePicker>
    <Label style={{display: 'block'}}>Date</Label>
    <Group style={{display: 'inline-flex'}}>
      <div className={styles.field}>
        <DateInput slot="start" style={{display: 'inline-flex'}}>
          {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
        </DateInput>
        <span aria-hidden="true" style={{padding: '0 4px'}}>–</span>
        <DateInput slot="end" style={{display: 'inline-flex'}}>
          {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
        </DateInput>
      </div>
      <Button>🗓</Button>
    </Group>
    <Popover
      placement="bottom start"
      style={{
        background: 'Canvas',
        color: 'CanvasText',
        border: '1px solid gray',
        padding: 20
      }}>
      <RangeCalendar style={{width: 220}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Button slot="previous">&lt;</Button>
          <Heading style={{flex: 1, textAlign: 'center'}} />
          <Button slot="next">&gt;</Button>
        </div>
        <CalendarGrid style={{width: '100%'}}>
          {({formattedDate, isSelected, isOutsideVisibleRange}) => (
            <div hidden={isOutsideVisibleRange} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
              {formattedDate}
            </div>
          )}
        </CalendarGrid>
      </RangeCalendar>
    </Popover>
  </DateRangePicker>
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
  return (
    <Item
      {...props}
      className={({isFocused, isSelected}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected
      })} />
  );
}
