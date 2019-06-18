/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {Accordion, AccordionItem} from '../src/Accordion';
import {action} from '@storybook/addon-actions';
import ComboBox from '../src/ComboBox';
import FieldLabel from '../src/FieldLabel';
import Radio from '../src/Radio';
import RadioGroup from '../src/RadioGroup';
import React from 'react';
import {storiesOf} from '@storybook/react';

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
  .add(
    'Default',
    () => render({'aria-label': 'Default'}),
    {info: 'This is the basic usage of the Accordion.'}
  )
  .add(
    'Multiselectable',
    () => render({'aria-label': 'Multiselectable', multiselectable: true}),
    {info: 'This is an Accordion where you can open multiple accordion items.'}
  )
  .add(
    'Default selected index',
    () => render({'aria-label': 'Default selected index', defaultSelectedIndex: 1}),
    {info: 'This is an Accordion where the the second accordion item is opened by default.'}
  )
  .add(
    'Selected index',
    () => render({'aria-label': 'Selected index', selectedIndex: 1}),
    {info: 'This is a controlled Accordion where the the second accordion item is opened by default.'}
  )
  .add(
    'ariaLevel',
    () => render({'aria-label': 'ariaLevel', ariaLevel: 4}),
    {info: 'This is an Accordion where heading level for Accordion item headings has been changed from its default value of 3 to 4. This allows a developer to place Accordion headings with in the heading hierarchy of the application.'}
  )
  .add(
    'nested RadioGroup',
    () => render({'aria-label': 'nested RadioGroup', radioGroup: true}),
    {info: 'This is an Accordion containing a nested radio group to demonstrate that keyboard selection of RadioGroup items does not propagate to ancestor Accordion element.'}
  )
  .add(
    'nested ComboBox',
    () => render({'aria-label': 'nested ComboBox', comboBox: true}),
    {info: 'This is an Accordion containing a nested ComboBox to demonstrate that keyboard selection of ComboBox items does not propagate to ancestor Accordion element.'}
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
