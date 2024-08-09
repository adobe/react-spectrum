/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  ActionButton,
  Button,
  Checkbox,
  CheckboxGroup,
  ColorField,
  ColorSlider,
  ComboBox,
  ComboBoxItem,
  Divider,
  Form,
  Meter,
  NumberField,
  Picker,
  PickerItem,
  ProgressBar,
  Radio,
  RadioGroup,
  RangeSlider,
  SearchField,
  Slider,
  Switch,
  Tag,
  TagGroup,
  TextArea,
  TextField,
  ToggleButton
} from '../src';
import {categorizeArgTypes} from './utils';
import type {Meta} from '@storybook/react';
import SortDown from '../s2wf-icons/S2_Icon_SortDown_20_N.svg';
import SortUp from '../s2wf-icons/S2_Icon_SortUp_20_N.svg';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useState} from 'react';

const meta: Meta<typeof Form> = {
  component: Form,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onInvalid', 'onReset', 'onSubmit'])
  }
};

export default meta;

export const Example = (args: any) => (
  <Form {...args}>
    <TextField label="First Name" name="firstName" />
    <TextField label="Last Name" name="firstName" />
    <TextField label="Email" name="email" type="email" description="Enter an email" />
    <CheckboxGroup label="Favorite sports">
      <Checkbox value="soccer">Soccer</Checkbox>
      <Checkbox value="baseball">Baseball</Checkbox>
      <Checkbox value="basketball">Basketball</Checkbox>
    </CheckboxGroup>
    <RadioGroup label="Favorite pet">
      <Radio value="cat">Cat</Radio>
      <Radio value="dog">Dog</Radio>
      <Radio value="plant" isDisabled>Plant</Radio>
    </RadioGroup>
    <TextField label="City" name="city" description="A long description to test help text wrapping." />
    <TextField label="A long label to test wrapping behavior" name="long" />
    <SearchField label="Search" name="search" />
    <TextArea label="Comment" name="comment" />
    <Switch>Wi-Fi</Switch>
    <Checkbox>I agree to the terms</Checkbox>
    <Slider label="Cookies"  defaultValue={30} />
    <RangeSlider label="Range"  defaultValue={{start: 30, end: 60}} />
    <Button type="submit" variant="primary" styles={style({gridColumnStart: 'field', width: 'fit'})}>Submit</Button>
  </Form>
);

export const CustomLabelsExample = (args: any) => {
  const [isSortAscending, setIsSortAscending] = useState(true);
  return (
    <Form {...args}>
      <div className={style({display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'sans'})}>
        <span id="sortOrder">Sort order</span>
        <ActionButton onPress={() => setIsSortAscending(!isSortAscending)}>
          {
            isSortAscending ? <SortUp/> : <SortDown/>
          }
        </ActionButton>
        <Picker aria-labelledby="sortOrder" styles={style({width: 208})}>
          <PickerItem id="name">Name</PickerItem>
          <PickerItem id="created">Created</PickerItem>
        </Picker>
      </div>
      <div className={style({display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'sans'})}>
        <span>Filter terms</span>
        <TagGroup styles={style({minWidth: 208})}>
          <Tag>keyword 1</Tag>
          <Tag>keyword 2</Tag>
        </TagGroup>
      </div>
      <Divider size="S"/>
      <div className={style({display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'sans'})}>
        <span id="colorLabel">Color settings</span>
        <ToggleButton>
          Enable color
        </ToggleButton>
        <ColorField aria-labelledby="coloRlabel" styles={style({width: 144})}/>
        <ColorSlider channel="alpha" defaultValue="#000"/>
      </div>
      <Divider size="S"/>
      <div className={style({display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'sans'})}>
        <span>Search</span>
        <ToggleButton>
          Enable search
        </ToggleButton>
        <TextField aria-label="Query" styles={style({width: 144})}/>
        <ComboBox styles={style({width: 144})}>
          <ComboBoxItem>search term 1</ComboBoxItem>
          <ComboBoxItem>search term 2</ComboBoxItem>
        </ComboBox>
        <NumberField aria-label="Number of results" defaultValue={50} styles={style({width: 96})}/>
      </div>
      <div className={style({display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'sans'})}>
        <span>Search parameters</span>
        <RadioGroup aria-label="Search range" orientation="horizontal" styles={style({width: 208})}>
          <Radio value="text">Text</Radio>
          <Radio value="images">Images</Radio>
          <Radio value="video">Video</Radio>
        </RadioGroup>
        <CheckboxGroup aria-label="Content display" orientation="horizontal" styles={style({width: 256})}>
          <Checkbox value="summary">Summary</Checkbox>
          <Checkbox value="date">Date</Checkbox>
          <Checkbox value="author">Author</Checkbox>
        </CheckboxGroup>
      </div>
      <Divider size="S"/>
      <div className={style({display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'sans'})}>
        <span>Misc</span>
        <Slider aria-label="Days to search" styles={style({width: 208})}/>
        <ProgressBar aria-label="Percent complete" styles={style({width: 144})}/>
        <Meter aria-label="Search confidence" variant="positive" styles={style({width: 144})}/>
      </div>
      <Button type="submit" variant="primary" styles={style({gridColumnStart: 'field', width: 'fit'})}>Submit</Button>
    </Form>
  );
};
