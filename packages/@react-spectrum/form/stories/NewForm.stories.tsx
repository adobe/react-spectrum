/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {chain} from '@react-aria/utils';
import {Checkbox, CheckboxGroup} from '@react-spectrum/checkbox';
import {ColorWheel} from '@react-spectrum/color';
import {ComboBox} from '@react-spectrum/combobox';
import {countries, states} from './data';
import {DateField, DatePicker, DateRangePicker, TimeField} from '@react-spectrum/datepicker';
import {Divider} from '@react-spectrum/divider';
import {FieldGroup, Form} from '../';
import {Flex, repeat} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {Item, Picker} from '@react-spectrum/picker';
import {NumberField} from '@react-spectrum/numberfield';
import {parseDate} from '@internationalized/date';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import {RangeCalendar} from '@react-spectrum/calendar';
import React, {Key, useEffect, useRef, useState} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SearchWithin} from '@react-spectrum/searchwithin';
import {Slider} from '@react-spectrum/slider';
import {StatusLight} from '@react-spectrum/statuslight';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';
import {TextArea, TextField} from '@react-spectrum/textfield';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {Well} from '@react-spectrum/well';

storiesOf('Form/newLayout', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'Default',
    () => render({})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'custom width',
    () => render({width: 400})
  )
  .add(
    'custom width, labelPosition: side',
    () => render({width: 400, labelPosition: 'side'})
  )
  .add(
    'labelAlign: end',
    () => render({width: 400, labelAlign: 'end'})
  )
  .add(
    'labelPosition: side, labelAlign: end',
    () => render({width: 400, labelPosition: 'side', labelAlign: 'end'})
  )
  .add(
    'fields next to each other',
    () => (
      <Form newFormLayout>
        <FieldGroup>
          <TextField label="First Name" placeholder="John" />
          <TextField label="Last Name" placeholder="Smith" />
        </FieldGroup>
        <TextField label="Street Address" placeholder="123 Any Street" />
        <FieldGroup>
          <TextField label="Work city" placeholder="San Francisco" />
          <Picker label="Work state" placeholder="Select a state" items={states}>
            {item => <Item key={item.abbr}>{item.name}</Item>}
          </Picker>
          <TextField label="Work zip code" placeholder="12345" />
        </FieldGroup>
        <FieldGroup columns="80px 1fr 80px">
          <TextField label="Home city" placeholder="San Francisco" />
          <Picker label="Home state" placeholder="Select a state" items={states}>
            {item => <Item key={item.abbr}>{item.name}</Item>}
          </Picker>
          <TextField label="Home zip code" placeholder="12345" />
        </FieldGroup>
      </Form>
    )
  )
  .add(
    'fields next to each other side label',
    () => (
      <Form labelPosition="side" newFormLayout>
        <FieldGroup gap={10}>
          <TextField label="First Name" placeholder="John" />
          <TextField label="Last Name" placeholder="Smith" />
        </FieldGroup>
        <TextField label="Street Address" placeholder="123 Any Street" />
        <FieldGroup>
          <TextField label="City" placeholder="San Francisco" />
          <Picker label="State" placeholder="Select a state" items={states}>
            {item => <Item key={item.abbr}>{item.name}</Item>}
          </Picker>
          <TextField label="Zip code" placeholder="12345" />
        </FieldGroup>
      </Form>
    )
  )
  .add(
    'fields with autoComplete property',
    () => {
      const [checked, setChecked] = useState(true);
      return (
        <Form newFormLayout>
          <Well role="group" aria-labelledby="billing-legend">
            <Flex direction="column" gap={10}>
              <h2 id="billing-legend" className={typographyStyles['spectrum-Heading4']}>Billing address</h2>
              <FieldGroup>
                <TextField autoComplete="billing given-name" name="firstName" isRequired label="First Name" placeholder="John" marginEnd="size-100" flex={1} />
                <TextField autoComplete="billing family-name" name="lastName" isRequired label="Last Name" placeholder="Smith" flex={1} />
              </FieldGroup>
              <FieldGroup>
                <TextArea autoComplete="billing street-address" name="streetAddress" isRequired label="Street Address" placeholder="123 Any Street" flex={1} />
              </FieldGroup>
              <FieldGroup>
                <TextField autoComplete="billing address-level2" name="city" isRequired label="City" placeholder="San Francisco" marginEnd="size-100" flex={1} />
                <Picker autoComplete="billing address-level1" name="state" isRequired label="State" placeholder="Select a state" items={states} marginEnd="size-100" flex={1}>
                  {item => <Item key={item.abbr}>{item.name}</Item>}
                </Picker>
                <TextField autoComplete="billing postal-code" name="zip" isRequired label="Zip code" placeholder="12345" flex={1} />
              </FieldGroup>
              <FieldGroup>
                <Picker autoComplete="billing country" name="country" isRequired label="Country" placeholder="Select a country" items={countries} marginEnd="size-100" flex={1}>
                  {item => <Item key={item.code}>{item.name}</Item>}
                </Picker>
              </FieldGroup>
              <FieldGroup>
                <TextField autoComplete="billing tel" type="tel" name="phone" label="Phone number" placeholder="123-456-7890" marginEnd="size-100" flex={1} />
                <TextField autoComplete="billing email" type="email" name="email" isRequired label="Email address" placeholder="me@example.org" marginEnd="size-100" flex={1} />
              </FieldGroup>
            </Flex>
          </Well>
          <Well role="group" aria-labelledby="shipping-legend">
            <Flex direction="column" gap={10}>
              <h2 id="shipping-legend" className={typographyStyles['spectrum-Heading4']}>Shipping address</h2>
              <Checkbox isSelected={checked} onChange={setChecked} >Same as billing address</Checkbox>
              {
                !checked &&
                <>
                  <FieldGroup>
                    <TextField autoComplete="shipping given-name" name="shippingFirstName" isRequired label="First Name" placeholder="John" marginEnd="size-100" flex={1} />
                    <TextField autoComplete="shipping family-name" name="shippingLastName" isRequired label="Last Name" placeholder="Smith" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <TextArea autoComplete="shipping street-address" name="shippingStreetAddress" isRequired label="Street Address" placeholder="123 Any Street" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <TextField autoComplete="shipping address-level2" name="shippingCity" isRequired label="City" placeholder="San Francisco" marginEnd="size-100" flex={1} />
                    <Picker autoComplete="shipping address-level1" name="shippingState" isRequired label="State" placeholder="Select a state" items={states} marginEnd="size-100" flex={1}>
                      {item => <Item key={item.abbr}>{item.name}</Item>}
                    </Picker>
                    <TextField autoComplete="shipping postal-code" name="shippingZip" isRequired label="Zip code" placeholder="12345" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <Picker autoComplete="shipping country" name="shippingCountry" isRequired label="Country" placeholder="Select a country" items={countries} marginEnd="size-100" flex={1}>
                      {item => <Item key={item.code}>{item.name}</Item>}
                    </Picker>
                  </FieldGroup>
                  <FieldGroup>
                    <TextField autoComplete="shipping tel" type="tel" name="shippingPhone" label="Phone number" placeholder="123-456-7890" marginEnd="size-100" flex={1} />
                    <TextField autoComplete="shipping email" type="email" name="shippingEmail" isRequired label="Email address" placeholder="me@example.org" marginEnd="size-100" flex={1} />
                  </FieldGroup>
                </>
              }
            </Flex>
          </Well>
        </Form>
      );
    }
  )
  // todo haven't figured this one out yet, might be best not to use FieldGroup?
  .add(
    'fields with different FieldGroup configuration',
    () => {
      const [checked, setChecked] = useState(true);
      return (
        <Form newFormLayout>
          <Well role="group" aria-labelledby="billing-legend">
            <FieldGroup rowGap={10} columns="1fr" rows={repeat('auto-fit', 'minmax(0, auto) minmax(0, auto) minmax(0, auto)')} autoFlow="row">
              <h2 id="billing-legend" className={typographyStyles['spectrum-Heading4']} style={{gridRowStart: '1'}}>Billing address</h2>
              <FieldGroup gridColumnStart="1">
                <TextField autoComplete="billing given-name" name="firstName" isRequired label="First Name" placeholder="John" marginEnd="size-100" />
                <TextField autoComplete="billing family-name" name="lastName" isRequired label="Last Name" placeholder="Smith" />
              </FieldGroup>
              <TextArea autoComplete="billing street-address" name="streetAddress" isRequired label="Street Address" placeholder="123 Any Street" />
              <FieldGroup gridColumnStart="1">
                <TextField autoComplete="billing address-level2" name="city" isRequired label="City" placeholder="San Francisco" marginEnd="size-100" />
                <Picker autoComplete="billing address-level1" name="state" isRequired label="State" placeholder="Select a state" items={states} marginEnd="size-100">
                  {item => <Item key={item.abbr}>{item.name}</Item>}
                </Picker>
                <TextField autoComplete="billing postal-code" name="zip" isRequired label="Zip code" placeholder="12345" />
              </FieldGroup>
              <FieldGroup gridColumnStart="1">
                <Picker autoComplete="billing country" name="country" isRequired label="Country" placeholder="Select a country" items={countries} marginEnd="size-100">
                  {item => <Item key={item.code}>{item.name}</Item>}
                </Picker>
              </FieldGroup>
              <FieldGroup gridColumnStart="1">
                <TextField autoComplete="billing tel" type="tel" name="phone" label="Phone number" placeholder="123-456-7890" marginEnd="size-100" />
                <TextField autoComplete="billing email" type="email" name="email" isRequired label="Email address" placeholder="me@example.org" marginEnd="size-100" />
              </FieldGroup>
            </FieldGroup>
          </Well>
          <Well role="group" aria-labelledby="shipping-legend">
            <Flex direction="column" gap={10}>
              <h2 id="shipping-legend" className={typographyStyles['spectrum-Heading4']}>Shipping address</h2>
              <Checkbox isSelected={checked} onChange={setChecked} >Same as billing address</Checkbox>
              {
                !checked &&
                <>
                  <FieldGroup>
                    <TextField autoComplete="shipping given-name" name="shippingFirstName" isRequired label="First Name" placeholder="John" marginEnd="size-100" flex={1} />
                    <TextField autoComplete="shipping family-name" name="shippingLastName" isRequired label="Last Name" placeholder="Smith" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <TextArea autoComplete="shipping street-address" name="shippingStreetAddress" isRequired label="Street Address" placeholder="123 Any Street" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <TextField autoComplete="shipping address-level2" name="shippingCity" isRequired label="City" placeholder="San Francisco" marginEnd="size-100" flex={1} />
                    <Picker autoComplete="shipping address-level1" name="shippingState" isRequired label="State" placeholder="Select a state" items={states} marginEnd="size-100" flex={1}>
                      {item => <Item key={item.abbr}>{item.name}</Item>}
                    </Picker>
                    <TextField autoComplete="shipping postal-code" name="shippingZip" isRequired label="Zip code" placeholder="12345" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <Picker autoComplete="shipping country" name="shippingCountry" isRequired label="Country" placeholder="Select a country" items={countries} marginEnd="size-100" flex={1}>
                      {item => <Item key={item.code}>{item.name}</Item>}
                    </Picker>
                  </FieldGroup>
                  <FieldGroup>
                    <TextField autoComplete="shipping tel" type="tel" name="shippingPhone" label="Phone number" placeholder="123-456-7890" marginEnd="size-100" flex={1} />
                    <TextField autoComplete="shipping email" type="email" name="shippingEmail" isRequired label="Email address" placeholder="me@example.org" marginEnd="size-100" flex={1} />
                  </FieldGroup>
                </>
              }
            </Flex>
          </Well>
        </Form>
      );
    }
  )
  .add(
    'fields following guidelines',
    () => {
      const [checked, setChecked] = useState(true);
      return (
        <Form newFormLayout>
          <Heading level={2} id="billing-legend">Billing address</Heading>
          <Divider />
          <FieldGroup gridColumnStart="1">
            <TextField autoComplete="billing given-name" name="firstName" isRequired label="First Name" placeholder="John" marginEnd="size-100" />
            <TextField autoComplete="billing family-name" name="lastName" isRequired label="Last Name" placeholder="Smith" />
          </FieldGroup>
          <TextArea autoComplete="billing street-address" name="streetAddress" isRequired label="Street Address" placeholder="123 Any Street" />
          <FieldGroup gridColumnStart="1">
            <TextField autoComplete="billing address-level2" name="city" isRequired label="City" placeholder="San Francisco" marginEnd="size-100" />
            <Picker autoComplete="billing address-level1" name="state" isRequired label="State" placeholder="Select a state" items={states} marginEnd="size-100">
              {item => <Item key={item.abbr}>{item.name}</Item>}
            </Picker>
            <TextField autoComplete="billing postal-code" name="zip" isRequired label="Zip code" placeholder="12345" />
          </FieldGroup>
          <FieldGroup gridColumnStart="1">
            <Picker autoComplete="billing country" name="country" isRequired label="Country" placeholder="Select a country" items={countries} marginEnd="size-100">
              {item => <Item key={item.code}>{item.name}</Item>}
            </Picker>
          </FieldGroup>
          <FieldGroup gridColumnStart="1">
            <TextField autoComplete="billing tel" type="tel" name="phone" label="Phone number" placeholder="123-456-7890" marginEnd="size-100" />
            <TextField autoComplete="billing email" type="email" name="email" isRequired label="Email address" placeholder="me@example.org" marginEnd="size-100" />
          </FieldGroup>
          <Heading level={2} id="shipping-legend">Shipping address</Heading>
          <Divider />
          <Checkbox isSelected={checked} onChange={setChecked} >Same as billing address</Checkbox>
          {
            !checked &&
            <>
              <FieldGroup>
                <TextField autoComplete="shipping given-name" name="shippingFirstName" isRequired label="First Name" placeholder="John" marginEnd="size-100" flex={1} />
                <TextField autoComplete="shipping family-name" name="shippingLastName" isRequired label="Last Name" placeholder="Smith" flex={1} />
              </FieldGroup>
              <FieldGroup>
                <TextArea autoComplete="shipping street-address" name="shippingStreetAddress" isRequired label="Street Address" placeholder="123 Any Street" flex={1} />
              </FieldGroup>
              <FieldGroup>
                <TextField autoComplete="shipping address-level2" name="shippingCity" isRequired label="City" placeholder="San Francisco" marginEnd="size-100" flex={1} />
                <Picker autoComplete="shipping address-level1" name="shippingState" isRequired label="State" placeholder="Select a state" items={states} marginEnd="size-100" flex={1}>
                  {item => <Item key={item.abbr}>{item.name}</Item>}
                </Picker>
                <TextField autoComplete="shipping postal-code" name="shippingZip" isRequired label="Zip code" placeholder="12345" flex={1} />
              </FieldGroup>
              <FieldGroup>
                <Picker autoComplete="shipping country" name="shippingCountry" isRequired label="Country" placeholder="Select a country" items={countries} marginEnd="size-100" flex={1}>
                  {item => <Item key={item.code}>{item.name}</Item>}
                </Picker>
              </FieldGroup>
              <FieldGroup>
                <TextField autoComplete="shipping tel" type="tel" name="shippingPhone" label="Phone number" placeholder="123-456-7890" marginEnd="size-100" flex={1} />
                <TextField autoComplete="shipping email" type="email" name="shippingEmail" isRequired label="Email address" placeholder="me@example.org" marginEnd="size-100" flex={1} />
              </FieldGroup>
            </>
          }
        </Form>
      );
    }
  )
  // not done yet, need to decide how we want it to work
  .add(
    '2 column form',
    () => {
      const [checked, setChecked] = useState(false);
      return (
        <Form newFormLayout>
          <Flex gap={50}>
            <Form newFormLayout>
              <Heading level={2} id="billing-legend">Billing address</Heading>
              <Divider />
              <FieldGroup gridColumnStart="1">
                <TextField autoComplete="billing given-name" name="firstName" isRequired label="First Name" placeholder="John" marginEnd="size-100" />
                <TextField autoComplete="billing family-name" name="lastName" isRequired label="Last Name" placeholder="Smith" />
              </FieldGroup>
              <TextArea autoComplete="billing street-address" name="streetAddress" isRequired label="Street Address" placeholder="123 Any Street" />
              <FieldGroup gridColumnStart="1">
                <TextField autoComplete="billing address-level2" name="city" isRequired label="City" placeholder="San Francisco" marginEnd="size-100" />
                <Picker autoComplete="billing address-level1" name="state" isRequired label="State" placeholder="Select a state" items={states} marginEnd="size-100">
                  {item => <Item key={item.abbr}>{item.name}</Item>}
                </Picker>
                <TextField autoComplete="billing postal-code" name="zip" isRequired label="Zip code" placeholder="12345" />
              </FieldGroup>
              <FieldGroup gridColumnStart="1">
                <Picker autoComplete="billing country" name="country" isRequired label="Country" placeholder="Select a country" items={countries} marginEnd="size-100">
                  {item => <Item key={item.code}>{item.name}</Item>}
                </Picker>
              </FieldGroup>
              <FieldGroup gridColumnStart="1">
                <TextField autoComplete="billing tel" type="tel" name="phone" label="Phone number" placeholder="123-456-7890" marginEnd="size-100" />
                <TextField autoComplete="billing email" type="email" name="email" isRequired label="Email address" placeholder="me@example.org" marginEnd="size-100" />
              </FieldGroup>
            </Form>
            <Form newFormLayout>
              <Heading level={2} id="shipping-legend">Shipping address</Heading>
              <Divider />
              <Checkbox isSelected={checked} onChange={setChecked} >Same as billing address</Checkbox>
              {
                !checked &&
                <>
                  <FieldGroup>
                    <TextField autoComplete="shipping given-name" name="shippingFirstName" isRequired label="First Name" placeholder="John" marginEnd="size-100" flex={1} />
                    <TextField autoComplete="shipping family-name" name="shippingLastName" isRequired label="Last Name" placeholder="Smith" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <TextArea autoComplete="shipping street-address" name="shippingStreetAddress" isRequired label="Street Address" placeholder="123 Any Street" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <TextField autoComplete="shipping address-level2" name="shippingCity" isRequired label="City" placeholder="San Francisco" marginEnd="size-100" flex={1} />
                    <Picker autoComplete="shipping address-level1" name="shippingState" isRequired label="State" placeholder="Select a state" items={states} marginEnd="size-100" flex={1}>
                      {item => <Item key={item.abbr}>{item.name}</Item>}
                    </Picker>
                    <TextField autoComplete="shipping postal-code" name="shippingZip" isRequired label="Zip code" placeholder="12345" flex={1} />
                  </FieldGroup>
                  <FieldGroup>
                    <Picker autoComplete="shipping country" name="shippingCountry" isRequired label="Country" placeholder="Select a country" items={countries} marginEnd="size-100" flex={1}>
                      {item => <Item key={item.code}>{item.name}</Item>}
                    </Picker>
                  </FieldGroup>
                  <FieldGroup>
                    <TextField autoComplete="shipping tel" type="tel" name="shippingPhone" label="Phone number" placeholder="123-456-7890" marginEnd="size-100" flex={1} />
                    <TextField autoComplete="shipping email" type="email" name="shippingEmail" isRequired label="Email address" placeholder="me@example.org" marginEnd="size-100" flex={1} />
                  </FieldGroup>
                </>
              }
            </Form>
          </Flex>
        </Form>
      );
    }
  )
  .add(
    'isRequired: true',
    () => render({isRequired: true})
  )
  .add(
    'isRequired: true, necessityIndicator: label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'isRequired: false, necessityIndicator: label',
    () => render({isRequired: false, necessityIndicator: 'label'})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isQuiet, labelPosition: side',
    () => render({isQuiet: true, labelPosition: 'side'})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid'})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid'})
  )
  .add(
    'form with reset',
    () => <FormWithControls />
  )
  .add(
    'form with submit',
    () => <FormWithSubmit />
  )
  .add(
    'form with numberfield and locale=ar-AE',
    () => (
      <Flex gap="size-100" alignItems="start">
        <NumberField label="Outside form" />
        <Form newFormLayout>
          <NumberField label="Inside form" />
        </Form>
        <Form newFormLayout>
          <TextField label="First Name" placeholder="John" />
        </Form>
        <Form newFormLayout>
          <TextField label="First Name" placeholder="John" />
          <NumberField label="Inside form" />
        </Form>
      </Flex>
    )
  )
  .add(
    'TextArea custom height and focusable',
    () => <FocusableFormFields />
  );

function FocusableFormFields() {
  let ref = useRef();
  return (
    <div>
      <Button variant="secondary" onPress={() => (ref.current as any).focus()}>Focus TextArea</Button>
      <Form newFormLayout>
        <FieldGroup>
          <TextField label="First Name" placeholder="John" />
          <TextField label="Last Name" placeholder="Smith" />
        </FieldGroup>
        <TextArea label="Feedback" height={200} ref={ref} />
        <ComboBox label="More Animals" autoFocus>
          <Item key="red panda">Red Panda</Item>
          <Item key="aardvark">Aardvark</Item>
          <Item key="kangaroo">Kangaroo</Item>
          <Item key="snake">Snake</Item>
        </ComboBox>
      </Form>
    </div>
  );
}

function render(props: any = {}) {
  return (
    <Form {...props} newFormLayout>
      <CheckboxGroup defaultValue={['dragons']} label="Pets">
        <Checkbox value="dogs">Dogs</Checkbox>
        <Checkbox value="cats">Cats</Checkbox>
        <Checkbox value="dragons">Dragons</Checkbox>
      </CheckboxGroup>
      <ComboBox label="More Animals">
        <Item key="red panda">Red Panda</Item>
        <Item key="aardvark">Aardvark</Item>
        <Item key="kangaroo">Kangaroo</Item>
        <Item key="snake">Snake</Item>
      </ComboBox>
      <DateField label="Birthday" />
      <DatePicker label="What date is it?" value={parseDate('2004-10-03')} />
      <DateRangePicker label="Flight dates" />
      <NumberField label="Years lived there" />
      <Picker label="State" placeholder="Select a state" items={states}>
        {item => <Item key={item.abbr}>{item.name}</Item>}
      </Picker>
      <Picker label="Country" placeholder="Select a country" items={countries}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Picker>
      <Picker label="Favorite color" description="Select any color you like." errorMessage="Please select a nicer color.">
        <Item>Red</Item>
        <Item>Orange</Item>
        <Item>Yellow</Item>
        <Item>Green</Item>
        <Item>Blue</Item>
        <Item>Purple</Item>
      </Picker>
      <RadioGroup label="Favorite pet" name="favorite-pet-group">
        <Radio value="dogs">Dogs</Radio>
        <Radio value="cats">Cats</Radio>
        <Radio value="dragons">Dragons</Radio>
      </RadioGroup>
      <SearchField label="Search" />
      <SearchWithin label="Search cities">
        <SearchField placeholder="City" />
        <Picker label="State" placeholder="Select a state" items={states}>
          {item => <Item key={item.abbr}>{item.name}</Item>}
        </Picker>
      </SearchWithin>
      <Switch>Low power mode</Switch>
      <TextArea label="Comments" placeholder="How do you feel?" description="Express yourself!" errorMessage="No wrong answers, except for this one." />
      <TextField label="City" placeholder="San Francisco" />
      <TextField label="Zip code" placeholder="12345" description="Please enter a five-digit zip code." errorMessage="Please remove letters and special characters." />
      <ColorWheel />
      <Slider label="the slider" />
      <RangeCalendar />
      <TimeField label="Count down" />
    </Form>
  );
}

function FormWithControls(props: any = {}) {
  let [firstName, setFirstName] = useState('hello');
  let [isHunter, setIsHunter] = useState(true);
  let [favoritePet, setFavoritePet] = useState('cats');
  let [favoriteColor, setFavoriteColor] = useState('green' as Key);
  let [howIFeel, setHowIFeel] = useState('I feel good, o I feel so good!');
  let [firstName2, setFirstName2] = useState('hello');
  let [isHunter2, setIsHunter2] = useState(true);
  let [favoritePet2, setFavoritePet2] = useState('cats');
  let [favoriteColor2, setFavoriteColor2] = useState('green' as Key);
  let [howIFeel2, setHowIFeel2] = useState('I feel good, o I feel so good!');
  let [preventDefault, setPreventDefault] = useState(true);
  let [favoriteColor3, setFavoriteColor3] = useState('green' as Key);

  return (
    <Flex>
      <Checkbox alignSelf="start" isSelected={preventDefault} onChange={setPreventDefault}>Prevent Default onSubmit</Checkbox>
      <Form
        onSubmit={e => {
          action('onSubmit')(e);
          if (preventDefault) {
            e.preventDefault();
          }
        }}
        newFormLayout
        {...props}>
        <TextField name="first-name" label="First Name controlled" placeholder="John" value={firstName} onChange={setFirstName} />
        <TextField name="last-name" label="Last Name default" placeholder="Smith" defaultValue="world" />
        <TextField name="street-address" label="Street Address none" placeholder="123 Any Street" />
        <Picker name="country" label="Country none" placeholder="Select a country" items={countries}>
          {item => <Item key={item.name}>{item.name}</Item>}
        </Picker>
        <Checkbox name="is-hunter" isSelected={isHunter} onChange={setIsHunter}>I am a hunter! controlled</Checkbox>
        <Checkbox name="is-wizard" defaultSelected>I am a wizard! default</Checkbox>
        <RadioGroup label="Favorite pet controlled" name="favorite-pet-group" value={favoritePet} onChange={setFavoritePet}>
          <Radio value="dogs">Dogs</Radio>
          <Radio value="cats">Cats</Radio>
          <Radio value="dragons">Dragons</Radio>
        </RadioGroup>
        <RadioGroup label="Favorite pet none" name="favorite-pet-group2" defaultValue="cats">
          <Radio value="dogs">Dogs</Radio>
          <Radio value="cats">Cats</Radio>
          <Radio value="dragons">Dragons</Radio>
        </RadioGroup>
        <Picker name="favorite-color" label="Favorite color controlled" selectedKey={favoriteColor} onSelectionChange={setFavoriteColor}>
          <Item key="red">Red</Item>
          <Item key="orange">Orange</Item>
          <Item key="yellow">Yellow</Item>
          <Item key="green">Green</Item>
          <Item key="blue">Blue</Item>
          <Item key="purple">Purple</Item>
        </Picker>
        <TextArea name="comments-controlled" label="Comments" placeholder="How do you feel? controlled" value={howIFeel} onChange={setHowIFeel} />
        <TextArea name="comments-uncontrolled" label="Comments" placeholder="How do you feel? default" defaultValue="hello" />
        <SearchWithin label="Search">
          <SearchField placeholder="Search" />
          <Picker name="favorite-color3" label="Favorite color searchwithin" selectedKey={favoriteColor3} onSelectionChange={setFavoriteColor3}>
            <Item key="red">Red</Item>
            <Item key="orange">Orange</Item>
            <Item key="yellow">Yellow</Item>
            <Item key="green">Green</Item>
            <Item key="blue">Blue</Item>
            <Item key="purple">Purple</Item>
          </Picker>
        </SearchWithin>
        <ButtonGroup>
          <Button variant="primary" type="submit">Submit</Button>
        </ButtonGroup>
      </Form>
      <form
        onSubmit={e => {
          action('onSubmit')(e);
          if (preventDefault) {
            e.preventDefault();
          }
        }}
        {...props}>
        <Flex direction="column" gap="size-500" marginTop="size-500">
          <label>
            First Name controlled
            <input type="text" placeholder="John" value={firstName2} onChange={e => setFirstName2(e.target.value)} />
          </label>
          <label>
            Last Name default
            <input type="text" placeholder="Smith" defaultValue="world" />
          </label>
          <label>
            Street Address none
            <input type="text" placeholder="123 Any Street" />
          </label>
          <label>
            Country none
            <select name="Country" placeholder="Select a country">
              {countries.map(item => <option value={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label>
            I am a hunter! controlled
            <input type="checkbox" checked={isHunter2} onChange={e => setIsHunter2(e.target.checked)} />
          </label>
          <label>
            I am a wizard! default
            <input type="checkbox" defaultChecked />
          </label>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            Favorite Pet controlled
            <label>
              Dogs
              <input type="radio" name="favorit-pet-group3" value="dogs" checked={favoritePet2 === 'dogs'} onChange={e => setFavoritePet2(e.target.value)} />
            </label>
            <label>
              Cats
              <input type="radio" name="favorit-pet-group3" value="cats" checked={favoritePet2 === 'cats'} onChange={e => setFavoritePet2(e.target.value)} />
            </label>
            <label>
              Dragons
              <input type="radio" name="favorit-pet-group3" value="dragons" checked={favoritePet2 === 'dragons'} onChange={e => setFavoritePet2(e.target.value)} />
            </label>
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            Favorite Pet uncontrolled
            <label>
              Dogs
              <input type="radio" name="favorit-pet-group4" value="dogs" />
            </label>
            <label>
              Cats
              <input type="radio" name="favorit-pet-group4" value="cats" defaultChecked />
            </label>
            <label>
              Dragons
              <input type="radio" name="favorit-pet-group4" value="dragons" />
            </label>
          </div>
          <label>
            Favorite Color controlled
            <select onChange={e => setFavoriteColor2(e.target.value)}>
              <option value="red" selected={favoriteColor2 === 'red'}>Red</option>
              <option value="orange" selected={favoriteColor2 === 'orange'}>Orange</option>
              <option value="yellow" selected={favoriteColor2 === 'yellow'}>Yellow</option>
              <option value="green" selected={favoriteColor2 === 'green'}>Green</option>
              <option value="blue" selected={favoriteColor2 === 'blue'}>Blue</option>
              <option value="purple" selected={favoriteColor2 === 'purple'}>Purple</option>
            </select>
          </label>
          <label>
            Comments controlled
            <textarea placeholder="How do you feel?" value={howIFeel2} onChange={e => setHowIFeel2(e.target.value)} />
          </label>
          <label>
            Comments default
            <textarea placeholder="How do you feel?" defaultValue="hello" />
          </label>
          <label>
            Favorite Color searchwithin
            <input type="text" placeholder="Search" />
            <select onChange={e => setFavoriteColor3(e.target.value)}>
              <option value="red" selected={favoriteColor3 === 'red'}>Red</option>
              <option value="orange" selected={favoriteColor3 === 'orange'}>Orange</option>
              <option value="yellow" selected={favoriteColor3 === 'yellow'}>Yellow</option>
              <option value="green" selected={favoriteColor3 === 'green'}>Green</option>
              <option value="blue" selected={favoriteColor3 === 'blue'}>Blue</option>
              <option value="purple" selected={favoriteColor3 === 'purple'}>Purple</option>
            </select>
          </label>
          <ButtonGroup>
            <Button variant="secondary" type="reset">Reset</Button>
            <Button variant="primary" type="submit">Submit</Button>
          </ButtonGroup>
        </Flex>
      </form>
    </Flex>
  );
}

function FormWithSubmit() {
  let [policies, setPolicies] = useState([]);
  let [policiesDirty, setPoliciesDirty] = useState(false);
  let [pet, setPet] = useState('');
  let [petDirty, setPetDirty] = useState(false);
  let [truth, setTruth] = useState(false);
  let [truthDirty, setTruthDirty] = useState(false);
  let [email, setEmail] = useState('');
  let [emailDirty, setEmailDirty] = useState(false);

  let [formStatus, setFormStatus] = useState<'progress' | 'invalid' | 'valid' | 'fixing'>('progress');
  let [isSubmitted, setSubmitted] = useState(false); // TODO: really should be isSectionInvalid / 'fixing' for each form field. once form is submitted with mistakes, unchecking an unrelated, previously valid field should not make it look invalid.

  let getValidationState = (isValid: boolean): 'invalid' | null =>
    ['invalid', 'fixing'].includes(formStatus) && !isValid ? 'invalid' : null;

  useEffect(() => {
    let validate = (): boolean => policies.length === 3 && pet && truth && email.includes('@');
    let formDirty = policiesDirty || petDirty || truthDirty || emailDirty;

    if (isSubmitted) {
      if (formDirty) {
        setFormStatus('fixing');
      } else {
        setFormStatus(validate() ? 'valid' : 'invalid');
      }
    } else {
      setFormStatus('progress');
    }
  }, [policies, policiesDirty, pet, petDirty, truth, truthDirty, email, emailDirty, isSubmitted]);

  let Status = ({formStatus}) => {
    let [variant, setVariant] = useState<'info' | 'negative' | 'positive' | 'notice'>('info');

    useEffect(() => {
      switch (formStatus) {
        case 'invalid':
          return setVariant('negative');
        case 'valid':
          return setVariant('positive');
        case 'fixing':
          return setVariant('notice');
        default:
          return setVariant('info');
      }
    }, [formStatus]);

    return (
      <StatusLight variant={variant}>
        {formStatus === 'progress' && 'In progress'}
        {formStatus === 'valid' && 'Submitted successfully'}
        {formStatus === 'invalid' && 'Error'}
        {formStatus === 'fixing' && 'Fixing mistakes'}
      </StatusLight>
    );
  };

  let handleSubmit: React.FormEventHandler<Element> = (e) => {
    e.preventDefault();
    setPoliciesDirty(false);
    setTruthDirty(false);
    setPetDirty(false);
    setEmailDirty(false);
    setSubmitted(true);
    action('onSubmit')(e);
  };

  let reset = () => {
    setSubmitted(false);
    setPolicies([]);
    setPet('');
    setTruth(false);
    setPoliciesDirty(false);
    setPetDirty(false);
    setTruthDirty(false);
    setEmail('');
    setEmailDirty(false);
    setFormStatus('progress');
  };

  return (
    <Form newFormLayout onSubmit={handleSubmit} isReadOnly={formStatus === 'valid'}>
      <TextField
        label="Email address"
        type="email"
        value={email}
        onChange={chain(() => setEmailDirty(true), setEmail)}
        validationState={getValidationState(email.includes('@'))}
        errorMessage="Email address must contain @" />
      <CheckboxGroup
        label="Agree to the following"
        isRequired
        value={policies}
        onChange={chain(() => setPoliciesDirty(true), setPolicies)}>
        <Checkbox
          value="terms"
          isRequired
          validationState={getValidationState(policies.includes('terms'))}>
          Terms and conditions
        </Checkbox>
        <Checkbox
          value="privacy"
          isRequired
          validationState={getValidationState(policies.includes('privacy'))}>
          Privacy policy
        </Checkbox>
        <Checkbox
          value="cookies"
          isRequired
          validationState={getValidationState(policies.includes('cookies'))}>
          Cookie policy
        </Checkbox>
      </CheckboxGroup>

      <Checkbox
        isRequired
        value="truth"
        isSelected={truth}
        onChange={(chain(() => setTruthDirty(true), setTruth))}
        validationState={getValidationState(truth)}>
        I am telling the truth
      </Checkbox>

      <RadioGroup
        label="Favorite pet"
        isRequired
        value={pet}
        onChange={chain(() => setPetDirty(true), setPet)}
        validationState={getValidationState(Boolean(pet))}>
        <Radio value="dogs">
          Dogs
        </Radio>
        <Radio value="cats">
          Cats
        </Radio>
        <Radio value="dragons">
          Dragons
        </Radio>
      </RadioGroup>

      <Button variant="cta" type="submit" isDisabled={formStatus === 'valid'} justifySelf="start">Submit</Button>
      <Button variant="secondary" type="reset" onPress={reset} justifySelf="start">Reset</Button>
      <Status formStatus={formStatus} />
    </Form>
  );
}
