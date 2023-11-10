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
import {ActionButton, Content, ContextualHelp, Heading, useLocale} from '@adobe/react-spectrum';
import {ComponentStoryObj} from '@storybook/react';
import Info from '@spectrum-icons/workflow/Info';
import React from 'react';
import {TextField} from '../';

export default {
  title: 'TextField',
  component: TextField,
  providerSwitcher: {status: 'positive'},
  args: {
    label: 'Street address',
    isQuiet: false,
    isDisabled: false,
    isReadOnly: false,
    isRequired: false,
    necessityIndicator: 'icon',
    labelPosition: 'top',
    labelAlign: 'start',
    validationState: null
  },
  argTypes: {
    labelPosition: {
      control: {
        type: 'radio',
        options: ['top', 'side']
      }
    },
    necessityIndicator: {
      control: {
        type: 'radio',
        options: ['icon', 'label']
      }
    },
    labelAlign: {
      control: {
        type: 'radio',
        options: ['start', 'end']
      }
    },
    validationState: {
      control: {
        type: 'radio',
        options: [null, 'valid', 'invalid']
      }
    }
  }
};

export type TextFieldStory = ComponentStoryObj<typeof TextField>;

export const Default: TextFieldStory = {
  render: (args) => render(args)
};

export const ValueTestControlled: TextFieldStory = {
  render: (args) => render({...args, value: 'Test'}),
  name: 'value: Test (controlled)'
};

export const DefaultValueTestUncontrolled: TextFieldStory = {
  render: (args) => render({...args, defaultValue: 'Test'}),
  name: 'defaultValue: Test (uncontrolled)'
};

export const TypeEmail: TextFieldStory = {
  render: (args) => render({...args, type: 'email'}),
  name: 'type: email'
};

export const Pattern09: TextFieldStory = {
  render: (args) => render({...args, pattern: '[0-9]+'}),
  name: 'pattern: [0-9]+'
};

export const AutoFocusTrue: TextFieldStory = {
  render: (args) => render({...args, autoFocus: true}),
  name: 'autoFocus: true'
};

export const IconInfo: TextFieldStory = {
  render: (args) => render({...args, icon: <Info />}),
  name: 'icon: Info'
};

export const NoVisibleLabel: TextFieldStory = {
  render: (args) => render({...args, label: null, 'aria-label': 'Street address'}),
  name: 'no visible label'
};

export const WithDescription: TextFieldStory = {
  render: (args) => render({...args, description: 'Please enter your street address.'}),
  name: 'with description'
};

export const WithErrorMessage: TextFieldStory = {
  render: (args) => render({
    ...args,
    errorMessage: 'Please enter a valid street address.',
    validationState: 'invalid'
  }),
  name: 'with error message'
};

export const WithDescriptionErrorMessageAndValidation: TextFieldStory = {
  render: (args) => renderWithDescriptionErrorMessageAndValidation(args),
  name: 'with description, error message and validation'
};

export const WithContextualHelp: TextFieldStory = {
  render: (args) => render({
    ...args,
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>
          Segments identify who your visitors are, what devices and services they use, where they
          navigated from, and much more.
        </Content>
      </ContextualHelp>
    )
  }),
  name: 'with contextual help'
};

export const CustomWidth: TextFieldStory = {
  render: (args) => render({...args, icon: <Info />, validationState: 'invalid', width: '300px'}),
  name: 'custom width'
};

export const CustomWidthSmall: TextFieldStory = {
  render: (args) => render({...args, icon: <Info />, validationState: 'invalid', width: '30px'}),
  name: 'custom width small'
};

// strings with diacritic marks
let localeStrings = {
  'ar-AE': 'عِرِفِتـــانٍ خانٍِ',
  'bg-BG': 'Азбучен ред',
  'cs-CZ': 'Abecední řádek',
  'da-DK': 'Afbryder',
  'de-DE': 'Abbruch',
  'el-GR': 'Αλφαβητική γραμμή',
  'en-US': '123 Main St.',
  'es-ES': 'Línea alfabética',
  'et-EE': 'Tähestikuline rida',
  'fi-FI': 'Aakkosellinen rivi',
  'fr-FR': 'Ligne alphabétique',
  'he-IL': 'שורת אלפבית',
  'hr-HR': 'Abecedni redak',
  'hu-HU': 'Ábécésor',
  'it-IT': 'Riga alfabetica',
  'ja-JP': 'アルファベット順',
  'ko-KR': '알파벳 순서',
  'lt-LT': 'Abėcėlinė eilutė',
  'lv-LV': 'Alfabētiskā rinda',
  'nb-NO': 'Alfabetisk rekkefølge',
  'nl-NL': 'Alfabetische volgorde',
  'pl-PL': 'Alfabetyczny wiersz',
  'pt-BR': 'Linha alfabética',
  'ro-RO': 'Rând alfabetic',
  'ru-RU': 'Алфавитный порядок',
  'sk-SK': 'Abecedný riadok',
  'sl-SI': 'Abecedni red',
  'sr-SP': 'Абецедни ред',
  'sv-SE': 'Alfabetisk ordning',
  'tr-TR': 'Alfabetik sıra',
  'uk-UA': 'Алфавітний порядок',
  'zh-CN': '字母顺序',
  'zh-TW': '字母順序'
};
// https://lingojam.com/ZalgoText
let zalgoString = 'i̶͖̊́̃̒̄͆̚͝t̶̢̢̧̺̻̘̖̗͉̟̞̭̀̀͒͂͐̐̄̇́͒̅̆́\'̶̯̳̑͑͛͐͋̈́̆̇̓͝͝s̵͙͇͉̪̉̈́̐̌̌̃̓͝ ̴̙̘̙̏̍̌̀̕͝m̶̰̥͇̄͒̃̊́͋̎́͆̍̓͑̅͜ȩ̵̛̪̜̯͓͈̰̰̱̠͆̾́́̎̊͌̒́͗̚̕͠ͅ,̷̫̱͖̖͊̉̒̎͊͝ ̵̡̧̛̝̳̦͙͚̣̩̜͙̈́̾̃̋͒̃̇̔̀͜ͅi̵̯̰̰͉̺͎̖̐ͅ\'̷͚̊͐͑͗́͒͌́͛̚̕͝m̴̨̧̯̞͇̤͎̥̫̩͔͖̮̖̲̽͆͗̌̈̇͋̍̕͘͠ ̸͚̞̠̦̑̌̍͋̃t̷̘̝̘̣̮͓̠̮̤͍͕̓͛̉h̶̛͔̳̟̩̦͍̤̥̥̦̗͍͖̓͆̐̽̒̈́͝͠ē̷̛͓̫̜͕͈͙̮͕̝͙̆͂̇̿̋̇̓̂̋͒̂͂͝ ̸̨͈̠̟̤͇̟̗̼̲̯̭̓̈̑́̇̈̀͐͌͂͛͌̅͘͜͝ͅp̴̧̧̛̛̺̩̩̘̲̜̰̩͚̻̬̠̎̅́̏̂́̐̾̓̓͌͝r̷̜̱̒̊̒͛̔ơ̷̼̝̥̺͎͚͚͇̝̫̓̈́̽̈̍̈̌̂̀̚͝͝ḇ̵̠̼͔͙̦̝̠̳̤̍͗͐͝l̷̛̰̲̺̫̭̳̹̬̳̤̱͎̋͛ȩ̷͒m̵̳̟͉̪̞̎̐̓̏̒͗,̶̨͍̥̗̺̮̰̬͍̓͋̄̋͛́̄̕͝ ̷̧̡̧̫̯̘̣̠̮͕̪͈̣̹͌̈̃̃̈́̃̍̊͝͝ͅį̸̲̠̤̳͗̽̋͊̍͛͂̊̓̑̅͋̿t̶̛̲͈͇͇͊̋͐̐͌͒̊̿̕͘\'̸̧͍̠̲̤̠̝̩̟̿͌ś̷̳͇̅̇͛͛̈́̅̑̇̔̌͆͝ ̵̛̱̺̙̪͒̇̔͗͘ͅm̶̢̧̤̟͙͉̠̣̺̥̫͙̹͉̬̉̏͑̕͝e̴̪̥̪̠̜̻̪͎͎̱̱̯̜͒́̑̃̕';
function DefaultLocaleStrings(props) {
  let locale = useLocale();
  let [isZalgo, setValue] = React.useState(false);
  return (
    <>
      <TextField
        label="Sampling of diacritics"
        value={isZalgo ? zalgoString : localeStrings[locale.locale]}
        UNSAFE_className="custom_classname"
        {...props} />
      <ActionButton onPress={() => setValue(prev => !prev)}>Toggle Zalgo</ActionButton>
    </>
  );
}

export const WithDifferentLocaleText: TextFieldStory = {
  render: (args) => <DefaultLocaleStrings {...args} />
};

function render(props = {}) {
  return (
    <TextField
      label="Street address"
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      UNSAFE_className="custom_classname"
      {...props} />
  );
}

function renderWithDescriptionErrorMessageAndValidation(props) {
  function Example() {
    let [value, setValue] = React.useState('0');
    let isValid = React.useMemo(() => /^\d$/.test(value), [value]);

    return (
      <TextField
        {...props}
        validationState={isValid ? 'valid' : 'invalid'}
        value={value}
        onChange={setValue}
        label="Favorite number"
        maxLength={1}
        description="Enter a single digit number."
        errorMessage={
          value === ''
            ? 'Empty input not allowed.'
            : 'Single digit numbers are 0-9.'
       } />
    );
  }

  return <Example />;
}
