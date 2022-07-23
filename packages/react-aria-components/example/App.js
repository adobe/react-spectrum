import {Item, Section} from 'react-stately';
import {MenuTrigger, Menu, MenuSection, MenuItem} from '../src/Menu';
import { Separator } from "../src/Separator";
import {Button} from '../src/Button';
import {Popover} from '../src/Popover';
import clsx from 'clsx';
import {OverlayProvider} from 'react-aria';
import {Select, SelectValue} from '../src/Select';
import {ListBox, Option} from '../src/ListBox';
import {ComboBox} from '../src/ComboBox';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {Slider, Track, Thumb, Output} from '../src/Slider';
import {DialogTrigger, Modal, Dialog} from '../src/Dialog';
import {TooltipTrigger, Tooltip, Arrow} from '../src/Tooltip';
import {NumberField, IncrementButton, DecrementButton} from '../src/NumberField';
import {Group} from '../src/Group';
import {Calendar, RangeCalendar, CalendarHeader, CalendarGrid, CalendarNextButton, CalendarPreviousButton} from '../src/Calendar';
import {DateField, TimeField, DateInput, DateSegment} from '../src/DateField';
import {DatePicker, DateRangePicker, StartDateInput, EndDateInput} from '../src/DatePicker';

function MyListBox(props) {
  return (
    <ListBox
      className="menu"
      {...props}
      renderItem={item => (
        <Option item={item} className={itemClass}>
          {({isSelected}) => <>{item.rendered}{isSelected ? ' (selected)' : ''}</>}
        </Option>
      )} />
  );
}

function MyComboBox({label, items, children, ...props}) {
  return (
    <ComboBox {...props}>
      <Label style={{display: 'block'}}>{label}</Label>
      <div style={{display: 'flex'}}>
        <Input />
        <Button>
          <span aria-hidden="true" style={{ padding: '0 2px' }}>▼</span>
        </Button>
      </div>
      <Popover placement="bottom end">
        <ListBox
          className="menu"
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

function MyMenu(props) {
  return (
    <Menu
      className="menu"
      {...props}
      renderSection={section => (
        <MenuSection section={section} className="group">
          <span style={{fontSize: '1.2em'}}>{section.rendered}</span>
        </MenuSection>
      )}
      renderSeparator={() => <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />}
      renderItem={item => (
        <MenuItem item={item} className={itemClass} />
      )} />
  );
}

import React from 'react';
import { Heading } from '../src/Heading';
function Example() {
  let options = [
    {id: 1, name: 'Aerospace'},
    {id: 2, name: 'Mechanical'},
    {id: 3, name: 'Civil'},
    {id: 4, name: 'Biomedical'},
    {id: 5, name: 'Nuclear'},
    {id: 6, name: 'Industrial'},
    {id: 7, name: 'Chemical'},
    {id: 8, name: 'Agricultural'},
    {id: 9, name: 'Electrical'}
  ];
  let [majorId, setMajorId] = React.useState();

  return (
    <>
      <MyComboBox
        label="Pick a engineering major"
        defaultItems={options}
        onSelectionChange={setMajorId}>
        {(item) => <Item>{item.name}</Item>}
      </MyComboBox>
      <p>Selected topic id: {majorId}</p>
    </>
  );
}

export function App() {
  return (
    <OverlayProvider>
      <Example />
      <MenuTrigger>
        <Button aria-label="Menu">☰</Button>
        <Popover>
          <Menu className="menu">
            <Section title={<span style={{fontSize: '1.2em'}}>Section 1</span>} className="group">
              <Item className={itemClass}>Foo</Item>
              <Item className={itemClass}>Bar</Item>
              <Item className={itemClass}>Baz</Item>
            </Section>
            <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
            <Section title={<span style={{fontSize: '1.2em'}}>Section 2</span>} className="group">
              <Item className={itemClass}>Foo</Item>
              <Item className={itemClass}>Bar</Item>
              <Item className={itemClass}>Baz</Item>
            </Section>
          </Menu>
        </Popover>
      </MenuTrigger>
      <MenuTrigger>
        <Button aria-label="Menu">☰</Button>
        <Popover>
          <MyMenu>
            <Section title="Section 1">
              <Item>Foo</Item>
              <Item>Bar</Item>
              <Item >Baz</Item>
            </Section>
            <Separator />
            <Section title="Section 2">
              <Item>Foo</Item>
              <Item>Bar</Item>
              <Item>Baz</Item>
            </Section>
          </MyMenu>
        </Popover>
      </MenuTrigger>
      <Select>
        <Label style={{display: 'block'}}>Test</Label>
        <Button>
          <SelectValue />
          <span aria-hidden="true" style={{ paddingLeft: 5 }}>▼</span>
        </Button>
        <Popover>
          <ListBox className="menu">
            <Item className={itemClass}>Foo</Item>
            <Item className={itemClass}>Bar</Item>
            <Item className={itemClass}>Baz</Item>
          </ListBox>
        </Popover>
      </Select>
      <ComboBox>
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
          <Button>
            <span aria-hidden="true" style={{ padding: '0 2px' }}>▼</span>
          </Button>
        </div>
        <Popover placement="bottom end">
          <ListBox className="menu">
            <Item className={itemClass}>Foo</Item>
            <Item className={itemClass}>Bar</Item>
            <Item className={itemClass}>Baz</Item>
          </ListBox>
        </Popover>
      </ComboBox>
      <MyComboBox label="Test">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </MyComboBox>
      <ListBox className="menu" selectionMode="multiple" selectionBehavior="replace">
        <Item className={itemClass}>Foo</Item>
        <Item className={itemClass}>Bar</Item>
        <Item className={itemClass}>Baz</Item>
      </ListBox>
      <MyListBox selectionMode="multiple" selectionBehavior="replace">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </MyListBox>
      <Slider
        defaultValue={[30, 60]}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 300,
          touchAction: 'none'
        }}>
        <div style={{ display: 'flex', alignSelf: 'stretch' }}>
          <Label>Test</Label>
          <Output style={{ flex: '1 0 auto', textAlign: 'end' }}>
            {state => `${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`}
          </Output>
        </div>
        <Track
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
          <CustomThumb index={0} />
          <CustomThumb index={1} />
        </Track>
      </Slider>
      <NumberField formatOptions={{style: 'currency', currency: 'USD'}}>
        <Label>Test</Label>
        <Group style={{display: 'flex'}}>
          <DecrementButton>-</DecrementButton>
          <Input />
          <IncrementButton>+</IncrementButton>
        </Group>
      </NumberField>
      <DialogTrigger>
        <Button>Open modal</Button>
        <Modal
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
          <Dialog style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 30
          }}>
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
      </DialogTrigger>
      <DialogTrigger>
        <Button>Open popover</Button>
        <Popover placement="bottom start">
          <Dialog style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 30
          }}>
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
          <Arrow style={{transform: 'translateX(-50%)'}}>
            <svg width="8" height="8">
              <path d="M0 0,L4 4,L8 0" fill="white" strokeWidth={1} stroke="gray" />
            </svg>
          </Arrow>
          I am a tooltip
        </Tooltip>
      </TooltipTrigger>
      <Calendar style={{width: 220}}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarPreviousButton>&lt;</CalendarPreviousButton>
          <CalendarHeader style={{ flex: 1, textAlign: 'center' }} />
          <CalendarNextButton>&gt;</CalendarNextButton>
        </div>
        <CalendarGrid style={{ width: "100%" }}>
          {({ formattedDate, isSelected, isOutsideVisibleRange }) => (
            <div hidden={isOutsideVisibleRange} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
              {formattedDate}
            </div>
          )}
        </CalendarGrid>
      </Calendar>
      <RangeCalendar style={{width: 220}}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarPreviousButton>&lt;</CalendarPreviousButton>
          <CalendarHeader style={{ flex: 1, textAlign: 'center' }} />
          <CalendarNextButton>&gt;</CalendarNextButton>
        </div>
        <CalendarGrid style={{ width: "100%" }}>
          {({ formattedDate, isSelected, isOutsideVisibleRange }) => (
            <div hidden={isOutsideVisibleRange} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
              {formattedDate}
            </div>
          )}
        </CalendarGrid>
      </RangeCalendar>
      <DateField>
        <Label style={{display: 'block'}}>Date</Label>
        <DateInput className="field">
          {segment => <DateSegment segment={segment} className={clsx('segment', {placeholder: segment.isPlaceholder})} />}
        </DateInput>
      </DateField>
      <TimeField>
        <Label style={{display: 'block'}}>Time</Label>
        <DateInput className="field">
          {segment => <DateSegment segment={segment} className={clsx('segment', {placeholder: segment.isPlaceholder})} />}
        </DateInput>
      </TimeField>
      <DatePicker>
        <Label style={{display: 'block'}}>Date</Label>
        <Group style={{display: 'inline-flex'}}>
          <DateInput className="field">
            {segment => <DateSegment segment={segment} className={clsx('segment', {placeholder: segment.isPlaceholder})} />}
          </DateInput>
          <Button>🗓</Button>
        </Group>
        <Popover placement="bottom start" style={{
          background: 'Canvas',
          color: 'CanvasText',
          border: '1px solid gray',
          padding: 20
        }}>
          <Calendar style={{width: 220}}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <CalendarPreviousButton>&lt;</CalendarPreviousButton>
              <CalendarHeader style={{ flex: 1, textAlign: 'center' }} />
              <CalendarNextButton>&gt;</CalendarNextButton>
            </div>
            <CalendarGrid style={{ width: "100%" }}>
              {({ formattedDate, isSelected, isOutsideVisibleRange }) => (
                <div hidden={isOutsideVisibleRange} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
                  {formattedDate}
                </div>
              )}
            </CalendarGrid>
          </Calendar>
        </Popover>
      </DatePicker>
      <DateRangePicker>
        <Label style={{display: 'block'}}>Date</Label>
        <Group style={{display: 'inline-flex'}}>
          <div className="field">
            <StartDateInput style={{display: 'inline-flex'}}>
              {segment => <DateSegment segment={segment} className={clsx('segment', {placeholder: segment.isPlaceholder})} />}
            </StartDateInput>
            <span aria-hidden="true" style={{padding: '0 4px'}}>–</span>
            <EndDateInput style={{display: 'inline-flex'}}>
              {segment => <DateSegment segment={segment} className={clsx('segment', {placeholder: segment.isPlaceholder})} />}
            </EndDateInput>
          </div>
          <Button>🗓</Button>
        </Group>
        <Popover placement="bottom start" style={{
          background: 'Canvas',
          color: 'CanvasText',
          border: '1px solid gray',
          padding: 20
        }}>
          <RangeCalendar style={{width: 220}}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <CalendarPreviousButton>&lt;</CalendarPreviousButton>
              <CalendarHeader style={{ flex: 1, textAlign: 'center' }} />
              <CalendarNextButton>&gt;</CalendarNextButton>
            </div>
            <CalendarGrid style={{ width: "100%" }}>
              {({ formattedDate, isSelected, isOutsideVisibleRange }) => (
                <div hidden={isOutsideVisibleRange} style={{textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''}}>
                  {formattedDate}
                </div>
              )}
            </CalendarGrid>
          </RangeCalendar>
        </Popover>
      </DateRangePicker>
    </OverlayProvider>
  );
}

function itemClass({isFocused, isSelected}) {
  return clsx('item', {
    focused: isFocused,
    selected: isSelected
  })
}

function CustomThumb({index}) {
  return (
    <Thumb
      index={index}
      style={({isDragging, isFocusVisible}) => ({
        width: 20,
        height: 20,
        borderRadius: '50%',
        top: '50%',
        backgroundColor: isFocusVisible ? 'orange' : isDragging
          ? 'dimgrey'
          : 'gray'
      })} />
    )
}
