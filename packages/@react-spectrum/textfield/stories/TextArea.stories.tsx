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
import {ActionButton, Button} from '@react-spectrum/button';
import {Content, ContextualHelp, Heading, useLocale} from '@adobe/react-spectrum';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import Info from '@spectrum-icons/workflow/Info';
import React, {useState} from 'react';
import {TextArea} from '../';

export default {
  title: 'TextArea',
  providerSwitcher: {status: 'positive'},
  args: {
    label: 'Comments',
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

export const Default = (args) => render(args);
export const ValueTestControlled = (args) => render({...args, value: 'Test'});

ValueTestControlled.story = {
  name: 'value: Test (controlled)'
};

export const DefaultValueTestUncontrolled = (args) => render({...args, defaultValue: 'Test'});

DefaultValueTestUncontrolled.story = {
  name: 'defaultValue: Test (uncontrolled)'
};

export const AutoFocusTrue = (args) => render({...args, autoFocus: true});

AutoFocusTrue.story = {
  name: 'autoFocus: true'
};

export const IconInfo = (args) => render({...args, icon: <Info />});

IconInfo.story = {
  name: 'icon: Info'
};

export const NoVisibleLabel = (args) =>
  render({...args, label: null, 'aria-label': 'Street address'});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const WithDescription = (args) =>
  render({...args, description: 'Enter product feedback.'});

WithDescription.story = {
  name: 'with description'
};

export const WithErrorMessage = (args) =>
  render({...args, errorMessage: 'Enter at least 250 characters.', validationState: 'invalid'});

WithErrorMessage.story = {
  name: 'with error message'
};

export const WithContextualHelp = (args) =>
  render({
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
  });

WithContextualHelp.story = {
  name: 'with contextual help'
};

export const CustomWidth = (args) =>
  render({...args, icon: <Info />, validationState: 'invalid', width: '300px'});

CustomWidth.story = {
  name: 'custom width'
};

export const CustomWidthSmall = (args) =>
  render({...args, icon: <Info />, validationState: 'invalid', width: '30px'});

CustomWidthSmall.story = {
  name: 'custom width small'
};

export const CustomHeightWithLabel = (args) => (
  <Form>
    <TextArea {...args} label="Custom height" description="height: size-2000" height="size-2000" />
    <TextArea
      {...args}
      label="Custom height"
      description="height: size-2000"
      height="size-2000"
      isQuiet />
    <TextArea
      {...args}
      labelPosition="side"
      label="Custom height"
      description="height: size-2000"
      height="size-2000" />
    <TextArea
      {...args}
      labelPosition="side"
      label="Custom height"
      description="height: size-2000"
      height="size-2000"
      isQuiet />
  </Form>
);

CustomHeightWithLabel.story = {
  name: 'custom height with label'
};

export const ChangeableHelptext = (args) => <ValidationExample {...args} />;

ChangeableHelptext.story = {
  name: 'changeable helptext',
  parameters: {
    description: {
      data: 'Verify that the changing size of the error message does not interfere with the height. To test, delete the input, then type the character "a". Height should update to match.'
    }
  }
};

export const ChangeableHelptextCustomHeight = (args) => (
  <ValidationExample {...args} height="175px" minHeight="100px" maxHeight="50vh" />
);

ChangeableHelptextCustomHeight.story = {
  name: 'changeable helptext custom height',
  parameters: {
    description: {
      data: 'Verify that the changing size of the error message does not interfere with the height. To test, delete the input, then type the character "a". Height should update to match.'
    }
  }
};

export const ControlledInteractive = (args) => <ControlledTextArea {...args} />;

ControlledInteractive.story = {
  name: 'controlled interactive'
};

export const InFlex = (args) => renderInFlexRowAndBlock(args);

InFlex.story = {
  name: 'in flex'
};

export const InFlexValidationState = (args) =>
  renderInFlexRowAndBlock({...args, validationState: 'invalid'});

InFlexValidationState.story = {
  name: 'in flex validation state'
};

function render(props = {}) {
  return (
    <TextArea
      label="Comments"
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      UNSAFE_className="custom_classname"
      {...props} />
  );
}

function ControlledTextArea(props) {
  let [value, setValue] = useState('');
  return (
    <>
      <TextArea label="megatron" value={value} onChange={setValue} {...props} isQuiet />
      <Button variant="primary" onPress={() => setValue('decepticons are evil transformers and should be kicked out of earth')}>Set Text</Button>
    </>
  );
}

function renderInFlexRowAndBlock(props = {}) {
  return (
    <Flex direction="column" gap="size-300">
      Align stretch
      <Flex gap="size-100">
        <TextArea
          label="Default"
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
      </Flex>
      Align end
      <Flex gap="size-100" alignItems="end">
        <TextArea
          label="Default"
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
      </Flex>
      Display block
      <div>
        <TextArea
          label="Default"
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
      </div>
    </Flex>
  );
}

function ValidationExample(props) {
  let [value, setValue] = React.useState('0');
  let isValid = React.useMemo(() => /^\d$/.test(value), [value]);

  return (
    <TextArea
      {...props}
      validationState={isValid ? 'valid' : 'invalid'}
      value={value}
      onChange={setValue}
      label="Favorite number"
      maxLength={1}
      description="Enter a single digit number."
      errorMessage={value === '' ? 'Empty input not allowed.' : 'Single digit numbers are 0-9. Lorem ipsum dolor.'} />
  );
}

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
      <TextArea
        label="Sampling of diacritics"
        value={isZalgo ? zalgoString : localeStrings[locale.locale]}
        UNSAFE_className="custom_classname"
        {...props} />
      <ActionButton onPress={() => setValue(prev => !prev)}>Toggle Zalgo</ActionButton>
    </>
  );
}

export const WithDifferentLocaleText = {
  render: (args) => <DefaultLocaleStrings {...args} />
};
