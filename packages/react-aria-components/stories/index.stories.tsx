import {Button, Calendar, CalendarGrid, ComboBox, DateField, DateInput, DatePicker, DateRangePicker, DateSegment, DialogTrigger, Dialog, Group, Heading, Input, Item, Label, ListBox, Menu, MenuTrigger, ModalOverlay, Modal, NumberField, Option, Popover, RangeCalendar, Section, Select, SelectValue, Separator, Slider, SliderOutput, SliderThumb, SliderTrack, TimeField, Tooltip, TooltipArrow, TooltipTrigger} from 'react-aria-components';
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
      <Dialog>
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
      </Dialog>
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
      <Dialog>
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
      </Dialog>
    </Popover>
  </DateRangePicker>
);

export const SliderExample = () => (
  <Slider
    defaultValue={[30, 60]}
    style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 300
    }}>
    <div style={{display: 'flex', alignSelf: 'stretch'}}>
      <Label>Test</Label>
      <SliderOutput style={{flex: '1 0 auto', textAlign: 'end'}}>
        {state => `${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`}
      </SliderOutput>
    </div>
    <SliderTrack
      style={{
        position: 'relative',
        height: 30,
        width: '100%'
      }}>
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'gray',
          height: 3,
          top: 13,
          width: '100%'
        }} />
      <CustomThumb index={0}>
        <Label>A</Label>
      </CustomThumb>
      <CustomThumb index={1}>
        <Label>B</Label>
      </CustomThumb>
    </SliderTrack>
  </Slider>
);

export const SliderCSS = (props) => (
  <Slider {...props} defaultValue={30} className={styles.slider}>
    <div className={styles.label}>
      <Label>Test</Label>
      <SliderOutput />
    </div>
    <SliderTrack className={styles.track}>
      <SliderThumb className={styles.thumb} />
    </SliderTrack>
  </Slider>
);

SliderCSS.args = {
  orientation: 'horizontal',
  isDisabled: false,
  minValue: 0,
  maxValue: 100,
  step: 1
};

SliderCSS.argTypes = {
  orientation: {
    control: {
      type: 'inline-radio',
      options: ['horizontal', 'vertical']
    }
  }
};

export const TooltipExample = () => (
  <TooltipTrigger offset={5}>
    <Button>Tooltip trigger</Button>
    <Tooltip
      style={{
        background: 'Canvas',
        color: 'CanvasText',
        border: '1px solid gray',
        padding: 5,
        borderRadius: 4
      }}>
      <TooltipArrow style={{transform: 'translateX(-50%)'}}>
        <svg width="8" height="8" style={{display: 'block'}}>
          <path d="M0 0,L4 4,L8 0" fill="white" strokeWidth={1} stroke="gray" />
        </svg>
      </TooltipArrow>
      I am a tooltip
    </Tooltip>
  </TooltipTrigger>
);

export const PopoverExample = () => (
  <DialogTrigger>
    <Button>Open popover</Button>
    <Popover 
      placement="bottom start"
      style={{
        background: 'Canvas',
        color: 'CanvasText',
        border: '1px solid gray',
        padding: 30
      }}>
      <Dialog>
        {({close}) => (
          <form style={{display: 'flex', flexDirection: 'column'}}>
            <label>
              First Name: <input placeholder="John" />
            </label>
            <label>
              Last Name: <input placeholder="Smith" />
            </label>
            <Button onPress={close} style={{marginTop: 10}}>
              Submit
            </Button>
          </form>
        )}
      </Dialog>
    </Popover>
  </DialogTrigger>
);

export const ModalExample = () => (
  <DialogTrigger>
    <Button>Open modal</Button>
    <ModalOverlay
      style={{
        position: 'fixed',
        zIndex: 100,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <Modal
        style={{
          background: 'Canvas',
          color: 'CanvasText',
          border: '1px solid gray',
          padding: 30
        }}>
        <Dialog>
          {({close}) => (
            <form style={{display: 'flex', flexDirection: 'column'}}>
              <Heading style={{marginTop: 0}}>Sign up</Heading>
              <label>
                First Name: <input placeholder="John" />
              </label>
              <label>
                Last Name: <input placeholder="Smith" />
              </label>
              <Button onPress={close} style={{marginTop: 10}}>
                Submit
              </Button>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  </DialogTrigger>
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

function CustomThumb({index, children}) {
  return (
    <SliderThumb
      index={index}
      style={({isDragging, isFocusVisible}) => ({
        width: 20,
        height: 20,
        borderRadius: '50%',
        top: '50%',
        // eslint-disable-next-line
        backgroundColor: isFocusVisible ? 'orange' : isDragging
          ? 'dimgrey'
          : 'gray'
      })}>
      {children}
    </SliderThumb>
  );
}
