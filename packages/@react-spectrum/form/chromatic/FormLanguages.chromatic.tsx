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

import {Checkbox, CheckboxGroup} from '@react-spectrum/checkbox';
import {ColorField} from '@react-spectrum/color';
import {ComboBox} from '@react-spectrum/combobox';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Form} from '@react-spectrum/form';
import {Heading} from '@react-spectrum/text';
// @ts-ignore
import intlMessages from './intlMessages.json';
import {Item, Picker} from '@react-spectrum/picker';
import {NumberField} from '@react-spectrum/numberfield';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import {RangeSlider, Slider} from '@react-spectrum/slider';
import React from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {Switch} from '@react-spectrum/switch';
import {TextArea, TextField} from '@react-spectrum/textfield';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export default {
  title: 'Languages/Form',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['ar-AE', 'he-IL', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'],
      scales: ['large', 'medium']
    }
  }
};

let TranslateForm = (props) => {
  let strings = useLocalizedStringFormatter(intlMessages);

  return (
    <Form {...props}>
      <CheckboxGroup
        defaultValue={['cow', 'goat']}
        label={strings.format('ruminants')}
        description={strings.format('areRuminats')}
        contextualHelp={(
          <ContextualHelp>
            <Heading>{strings.format('whatIsARuminat')}</Heading>
            <Content>{strings.format('ruminatDefinition')}</Content>
          </ContextualHelp>
        )}>
        <Checkbox value="cow">{strings.format('cow')}</Checkbox>
        <Checkbox value="goat">{strings.format('goat')}</Checkbox>
        <Checkbox value="chicken">{strings.format('chicken')}</Checkbox>
      </CheckboxGroup>
      <ColorField
        label={strings.format('color')}
        defaultValue="#119911"
        validationState="invalid"
        errorMessage={strings.format('colorError')} />
      <ComboBox
        label={strings.format('ruminants')}
        defaultInputValue={strings.format('cow')}
        validationState="valid"
        description={strings.format('areRuminats')}
        contextualHelp={(
          <ContextualHelp>
            <Heading>{strings.format('whatIsARuminat')}</Heading>
            <Content>{strings.format('ruminatDefinition')}</Content>
          </ContextualHelp>
        )}>
        <Item key="cow">{strings.format('cow')}</Item>
        <Item key="goat">{strings.format('goat')}</Item>
        <Item key="chicken">{strings.format('chicken')}</Item>
        <Item key="sheep">{strings.format('sheep')}</Item>
      </ComboBox>
      <NumberField label={strings.format('farmAnimalCount')} validationState="invalid" errorMessage={strings.format('farmCountError')} />
      <Picker
        label={strings.format('ruminants')}
        defaultSelectedKey={strings.format('chicken')}
        isInvalid
        errorMessage={strings.format('notRuminatError')}
        contextualHelp={(
          <ContextualHelp>
            <Heading>{strings.format('whatIsARuminat')}</Heading>
            <Content>{strings.format('ruminatDefinition')}</Content>
          </ContextualHelp>
        )}>
        <Item key="cow">{strings.format('cow')}</Item>
        <Item key="goat">{strings.format('goat')}</Item>
        <Item key={strings.format('chicken')}>{strings.format('chicken')}</Item>
        <Item key={strings.format('sheep')}>{strings.format('sheep')}</Item>
      </Picker>
      <RadioGroup
        label={strings.format('ruminants')}
        defaultValue={strings.format('sheep')}
        description={strings.format('areRuminats')}
        contextualHelp={(
          <ContextualHelp>
            <Heading>{strings.format('whatIsARuminat')}</Heading>
            <Content>{strings.format('ruminatDefinition')}</Content>
          </ContextualHelp>
        )}>
        <Radio value="cow">{strings.format('cow')}</Radio>
        <Radio value="goat">{strings.format('goat')}</Radio>
        <Radio value="chicken">{strings.format('chicken')}</Radio>
        <Radio value={strings.format('sheep')}>{strings.format('sheep')}</Radio>
      </RadioGroup>
      <RangeSlider label={strings.format('ageRange')} defaultValue={{start: 12, end: 36}} />
      <SearchField
        label={strings.format('cheeseSearch')}
        validationState="valid"
        description={strings.format('findCheese')} />
      <Slider label={strings.format('farmScore')} defaultValue={25} />
      <Switch>{strings.format('amHappy')}</Switch>
      <TextArea
        label={strings.format('clients')}
        validationState="invalid"
        errorMessage={strings.format('clientsError')}
        contextualHelp={(
          <ContextualHelp>
            <Heading>{strings.format('clientHeading')}</Heading>
            <Content>{strings.format('clientContent')}</Content>
          </ContextualHelp>
        )} />
      <TextField
        label={strings.format('farmName')}
        value={strings.format('brownFenceFarm')}
        validationState="valid"
        description={strings.format('farmDescription')}
        contextualHelp={(
          <ContextualHelp>
            <Heading>{strings.format('farmTitle')}</Heading>
            <Content>{strings.format('farmLegal')}</Content>
          </ContextualHelp>
        )} />
    </Form>
  );
};

export const FormTranslatedText = (props) => (
  <TranslateForm {...props} />
);

export const FormTranslatedTextSideLabel = () => {
  return <FormTranslatedText labelPosition="side" labelAlign="start" width="500px" />;
};
