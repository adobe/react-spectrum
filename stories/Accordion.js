import {Accordion, AccordionItem} from '../src/Accordion';
import {action, storiesOf} from '@storybook/react';
import ComboBox from '../src/ComboBox';
import FieldLabel from '../src/FieldLabel';
import Radio from '../src/Radio';
import RadioGroup from '../src/RadioGroup';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

const OPTIONS = [
  'Chocolate',
  'Vanilla',
  'Strawberry',
  'Caramel',
  'Cookies and Cream',
  'Coconut',
  'Peppermint',
  'Some crazy long value that should be cut off'
];

storiesOf('Accordion', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    'This is the basic usage of the Accordion.',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'Multiselectable',
    'This is an Accordion where you can open multiple accordion items.',
    () => render({multiselectable: true}),
    {inline: true}
  )
  .addWithInfo(
    'Default selected index',
    'This is an Accordion where the the second accordion item is opened by default.',
    () => render({defaultSelectedIndex: 1}),
    {inline: true}
  )
  .addWithInfo(
    'Selected index',
    'This is a controlled Accordion where the the second accordion item is opened by default.',
    () => render({selectedIndex: 1}),
    {inline: true}
  )
  .addWithInfo(
    'ariaLevel',
    'This is an Accordion where heading level for Accordion item headings has been changed from its default value of 3 to 4. This allows a developer to place Accordion headings with in the heading hierarchy of the application.',
    () => render({ariaLevel: 4}),
    {inline: true}
  )
  .addWithInfo(
    'nested RadioGroup',
    'This is an Accordion containing a nested radio group to demonstrate that keyboard selection of RadioGroup items does not propagate to ancestor Accordion element.',
    () => render({radioGroup: true}),
    {inline: true}
  )
  .addWithInfo(
    'nested ComboBox',
    'This is an Accordion containing a nested ComboBox to demonstrate that keyboard selection of ComboBox items does not propagate to ancestor Accordion element.',
    () => render({comboBox: true}),
    {inline: true}
  );

function render(props = {}) {
  const {radioGroup, comboBox, ...otherProps} = props;
  return (
    <Accordion {...otherProps} defaultSelectedIndex={radioGroup || comboBox ? 1 : otherProps.defaultSelectedIndex} onChange={action('onChange')}>
      <AccordionItem header="Header 1">Item 1</AccordionItem>
      <AccordionItem header="Header 2">
        {(radioGroup &&
          <FieldLabel label="Radio Group" id="radio-group-label">
            <RadioGroup name="radio-group" aria-labelledby="radio-group-label" vertical>
              <Radio label="this" value="this" checked />
              <Radio label="that" value="that" />
              <Radio label="the other" value="the other" />
            </RadioGroup>
          </FieldLabel>) ||
          (comboBox &&
          <FieldLabel label="Combo Box">
            <ComboBox options={OPTIONS} placeholder="Combo Box" />
          </FieldLabel>) ||
          'Item 2'}
      </AccordionItem>
      <AccordionItem header="Header 3" disabled>Item 3</AccordionItem>
      <AccordionItem header="Header 4">Item 4</AccordionItem>
    </Accordion>
  );
}
