/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Checkbox} from '../../src/checkbox/Checkbox';

import {CheckboxGroup} from '../../src/checkbox/CheckboxGroup';
import {ColorField} from '../../src/color/ColorField';
import {ComboBox} from '../../src/combobox/ComboBox';
import {Content} from '../../src/view/Content';
import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {Form, SpectrumFormProps} from '../../src/form/Form';
import {Heading} from '../../src/text/Heading';
// @ts-ignore
import intlMessages from './intlMessages.json';
import {Item} from 'react-stately/Item';
import {Meta, StoryFn} from '@storybook/react';
import {NumberField} from '../../src/numberfield/NumberField';
import {Picker} from '../../src/picker/Picker';
import {Radio} from '../../src/radio/Radio';
import {RadioGroup} from '../../src/radio/RadioGroup';
import {RangeSlider} from '../../src/slider/RangeSlider';
import React, {JSX} from 'react';
import {SearchField} from '../../src/searchfield/SearchField';
import {Slider} from '../../src/slider/Slider';
import {Switch} from '../../src/switch/Switch';
import {TextArea} from '../../src/textfield/TextArea';
import {TextField} from '../../src/textfield/TextField';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

export default {
  title: 'Languages/Form',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['ar-AE', 'he-IL', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'],
      scales: ['large', 'medium']
    }
  },
  excludeStories: ['TranslateForm']
} as Meta<typeof Form>;

export type FormStory = StoryFn<typeof Form>;

export let TranslateForm = (props: Omit<SpectrumFormProps, 'children'>): JSX.Element => {
  let strings = useLocalizedStringFormatter(intlMessages);

  return (
    <Form {...props}>
      <CheckboxGroup
        defaultValue={['cow', 'goat']}
        label={strings.format('ruminants')}
        description={strings.format('areRuminats')}
        contextualHelp={
          <ContextualHelp>
            <Heading>{strings.format('whatIsARuminat')}</Heading>
            <Content>{strings.format('ruminatDefinition')}</Content>
          </ContextualHelp>
        }>
        <Checkbox value="cow">{strings.format('cow')}</Checkbox>
        <Checkbox value="goat">{strings.format('goat')}</Checkbox>
        <Checkbox value="chicken">{strings.format('chicken')}</Checkbox>
      </CheckboxGroup>
      <ColorField
        label={strings.format('color')}
        defaultValue="#119911"
        validationState="invalid"
        errorMessage={strings.format('colorError')}
      />
      <ComboBox
        label={strings.format('ruminants')}
        defaultInputValue={strings.format('cow')}
        validationState="valid"
        description={strings.format('areRuminats')}
        contextualHelp={
          <ContextualHelp>
            <Heading>{strings.format('whatIsARuminat')}</Heading>
            <Content>{strings.format('ruminatDefinition')}</Content>
          </ContextualHelp>
        }>
        <Item key="cow">{strings.format('cow')}</Item>
        <Item key="goat">{strings.format('goat')}</Item>
        <Item key="chicken">{strings.format('chicken')}</Item>
        <Item key="sheep">{strings.format('sheep')}</Item>
      </ComboBox>
      <NumberField
        label={strings.format('farmAnimalCount')}
        validationState="invalid"
        errorMessage={strings.format('farmCountError')}
      />
      <Picker
        label={strings.format('ruminants')}
        defaultSelectedKey={strings.format('chicken')}
        isInvalid
        errorMessage={strings.format('notRuminatError')}
        contextualHelp={
          <ContextualHelp>
            <Heading>{strings.format('whatIsARuminat')}</Heading>
            <Content>{strings.format('ruminatDefinition')}</Content>
          </ContextualHelp>
        }>
        <Item key="cow">{strings.format('cow')}</Item>
        <Item key="goat">{strings.format('goat')}</Item>
        <Item key={strings.format('chicken')}>{strings.format('chicken')}</Item>
        <Item key={strings.format('sheep')}>{strings.format('sheep')}</Item>
      </Picker>
      <RadioGroup
        label={strings.format('ruminants')}
        defaultValue={strings.format('sheep')}
        description={strings.format('areRuminats')}
        contextualHelp={
          <ContextualHelp>
            <Heading>{strings.format('whatIsARuminat')}</Heading>
            <Content>{strings.format('ruminatDefinition')}</Content>
          </ContextualHelp>
        }>
        <Radio value="cow">{strings.format('cow')}</Radio>
        <Radio value="goat">{strings.format('goat')}</Radio>
        <Radio value="chicken">{strings.format('chicken')}</Radio>
        <Radio value={strings.format('sheep')}>{strings.format('sheep')}</Radio>
      </RadioGroup>
      <RangeSlider label={strings.format('ageRange')} defaultValue={{start: 12, end: 36}} />
      <SearchField
        label={strings.format('cheeseSearch')}
        validationState="valid"
        description={strings.format('findCheese')}
      />
      <Slider label={strings.format('farmScore')} defaultValue={25} />
      <Switch>{strings.format('amHappy')}</Switch>
      <TextArea
        label={strings.format('clients')}
        validationState="invalid"
        errorMessage={strings.format('clientsError')}
        contextualHelp={
          <ContextualHelp>
            <Heading>{strings.format('clientHeading')}</Heading>
            <Content>{strings.format('clientContent')}</Content>
          </ContextualHelp>
        }
      />
      <TextField
        label={strings.format('farmName')}
        value={strings.format('brownFenceFarm')}
        validationState="valid"
        description={strings.format('farmDescription')}
        contextualHelp={
          <ContextualHelp>
            <Heading>{strings.format('farmTitle')}</Heading>
            <Content>{strings.format('farmLegal')}</Content>
          </ContextualHelp>
        }
      />
    </Form>
  );
};

export const FormTranslatedText: FormStory = props => <TranslateForm {...props} />;

export const FormTranslatedTextSideLabel: FormStory = () => {
  return <TranslateForm labelPosition="side" labelAlign="start" width="500px" />;
};
