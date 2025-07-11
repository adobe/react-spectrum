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
import {CalendarDate, parseDate, parseDateTime, parseTime} from '@internationalized/date';
import {chain} from '@react-aria/utils';
import {Checkbox, CheckboxGroup} from '@react-spectrum/checkbox';
import {ColorField} from '@react-spectrum/color';
import {ComboBox} from '@react-spectrum/combobox';
import {Content, Header} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {countries, states} from './data';
import {DateField, DatePicker, DateRangePicker, TimeField} from '@react-spectrum/datepicker';
import {Flex} from '@react-spectrum/layout';
import {Form, SpectrumFormProps} from '../';
import {Heading} from '@react-spectrum/text';
import {InlineAlert} from '@react-spectrum/inlinealert';
import {Item, Picker} from '@react-spectrum/picker';
import {Key, ValidationState} from '@react-types/shared';
import {Meta, StoryObj} from '@storybook/react';
import {NumberField} from '@react-spectrum/numberfield';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React, {useEffect, useState} from 'react';
import {SearchAutocomplete} from '@react-spectrum/autocomplete';
import {SearchField} from '@react-spectrum/searchfield';
import {Slider} from '@react-spectrum/slider';
import {StatusLight} from '@react-spectrum/statuslight';
import {Switch} from '@react-spectrum/switch';
import {TagGroup} from '@react-spectrum/tag';
import {TextArea, TextField} from '@react-spectrum/textfield';
import {TranslateForm} from './../chromatic/FormLanguages.stories';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {Well} from '@react-spectrum/well';

export default {
  title: 'Form',
  component: Form,
  providerSwitcher: {status: 'positive'}
} as Meta<typeof Form>;

export type FormStory = StoryObj<typeof Form>;

export const Default: FormStory = {
  render: () => <Render />
};

export const LabelPositionSide: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    labelPosition: 'side'
  },
  name: 'labelPosition: side'
};

export const CustomWidth: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    width: 400
  },
  name: 'custom width'
};

export const CustomWidthLabelPositionSide: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    width: 400,
    labelPosition: 'side'
  },
  name: 'custom width, labelPosition: side'
};

export const LabelAlignEnd: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    width: 400,
    labelAlign: 'end'
  },
  name: 'labelAlign: end'
};

export const LabelPositionSideLabelAlignEnd: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    width: 400,
    labelPosition: 'side',
    labelAlign: 'end'
  },
  name: 'labelPosition: side, labelAlign: end'
};

export const FieldsNextToEachOther: FormStory = {
  render: (args) => (
    <Form {...args}>
      <Flex>
        <TextField
          label="First Name"
          marginEnd="size-100"
          flex={1}
          description="Please enter your first name." />
        <TextField label="Last Name" flex={1} description="Please enter your last name." />
      </Flex>
      <TextField label="Street Address" description="Please include apartment or suite number." />
      <Flex>
        <TextField
          label="City"
          marginEnd="size-100"
          flex={1}
          description="Please enter the city you live in." />
        <Picker label="State" items={states} marginEnd="size-100" flex={1}>
          {(item) => <Item key={item.abbr}>{item.name}</Item>}
        </Picker>
        <TextField label="Zip code" flex={1} description="Please enter a five-digit zip code." />
      </Flex>
    </Form>
  ),
  name: 'fields next to each other'
};

const FieldsWithAutoCompletePropertyRender = (props: SpectrumFormProps) => {
  const [checked, setChecked] = useState(true);
  return (
    <Form {...props}>
      <Well role="group" aria-labelledby="billing-legend">
        <h2 id="billing-legend" className={typographyStyles['spectrum-Heading4']}>
          Billing address
        </h2>
        <Flex>
          <TextField
            autoComplete="billing given-name"
            name="firstName"
            isRequired
            label="First Name"
            marginEnd="size-100"
            flex={1} />
          <TextField
            autoComplete="billing family-name"
            name="lastName"
            isRequired
            label="Last Name"
            flex={1} />
        </Flex>
        <Flex>
          <TextArea
            autoComplete="billing street-address"
            name="streetAddress"
            isRequired
            label="Street Address"
            flex={1} />
        </Flex>
        <Flex>
          <TextField
            autoComplete="billing address-level2"
            name="city"
            isRequired
            label="City"
            marginEnd="size-100"
            flex={1} />
          <Picker
            autoComplete="billing address-level1"
            name="state"
            isRequired
            label="State"
            items={states}
            marginEnd="size-100"
            flex={1}>
            {(item) => <Item key={item.abbr}>{item.name}</Item>}
          </Picker>
          <TextField
            autoComplete="billing postal-code"
            name="zip"
            isRequired
            label="Zip code"
            flex={1} />
        </Flex>
        <Flex>
          <Picker
            autoComplete="billing country"
            name="country"
            isRequired
            label="Country"
            items={countries}
            marginEnd="size-100"
            flex={1}>
            {(item) => <Item key={item.code}>{item.name}</Item>}
          </Picker>
        </Flex>
        <Flex>
          <TextField
            autoComplete="billing tel"
            type="tel"
            name="phone"
            label="Phone number"
            marginEnd="size-100"
            flex={1} />
          <TextField
            autoComplete="billing email"
            type="email"
            name="email"
            isRequired
            label="Email address"
            marginEnd="size-100"
            flex={1} />
        </Flex>
      </Well>
      <Well role="group" aria-labelledby="shipping-legend">
        <h2 id="shipping-legend" className={typographyStyles['spectrum-Heading4']}>
          Shipping address
        </h2>
        <Checkbox isSelected={checked} onChange={setChecked}>
          Same as billing address
        </Checkbox>
        {!checked && (
          <>
            <Flex>
              <TextField
                autoComplete="shipping given-name"
                name="shippingFirstName"
                isRequired
                label="First Name"
                marginEnd="size-100"
                flex={1} />
              <TextField
                autoComplete="shipping family-name"
                name="shippingLastName"
                isRequired
                label="Last Name"
                flex={1} />
            </Flex>
            <Flex>
              <TextArea
                autoComplete="shipping street-address"
                name="shippingStreetAddress"
                isRequired
                label="Street Address"
                flex={1} />
            </Flex>
            <Flex>
              <TextField
                autoComplete="shipping address-level2"
                name="shippingCity"
                isRequired
                label="City"
                marginEnd="size-100"
                flex={1} />
              <Picker
                autoComplete="shipping address-level1"
                name="shippingState"
                isRequired
                label="State"
                items={states}
                marginEnd="size-100"
                flex={1}>
                {(item) => <Item key={item.abbr}>{item.name}</Item>}
              </Picker>
              <TextField
                autoComplete="shipping postal-code"
                name="shippingZip"
                isRequired
                label="Zip code"
                flex={1} />
            </Flex>
            <Flex>
              <Picker
                autoComplete="shipping country"
                name="shippingCountry"
                isRequired
                label="Country"
                items={countries}
                marginEnd="size-100"
                flex={1}>
                {(item) => <Item key={item.code}>{item.name}</Item>}
              </Picker>
            </Flex>
            <Flex>
              <TextField
                autoComplete="shipping tel"
                type="tel"
                name="shippingPhone"
                label="Phone number"
                marginEnd="size-100"
                flex={1} />
              <TextField
                autoComplete="shipping email"
                type="email"
                name="shippingEmail"
                isRequired
                label="Email address"
                marginEnd="size-100"
                flex={1} />
            </Flex>
          </>
        )}
      </Well>
    </Form>
  );
};
export const FieldsWithAutoCompleteProperty: FormStory = {
  render: (args) => <FieldsWithAutoCompletePropertyRender {...args} />,
  name: 'fields with autoComplete property'
};

export const IsRequiredTrue: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    isRequired: true
  },
  name: 'isRequired: true'
};

export const IsRequiredTrueNecessityIndicatorLabel: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    isRequired: true,
    necessityIndicator: 'label'
  },
  name: 'isRequired: true, necessityIndicator: label'
};

export const IsRequiredFalseNecessityIndicatorLabel: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    isRequired: false,
    necessityIndicator: 'label'
  },
  name: 'isRequired: false, necessityIndicator: label'
};

export const IsDisabled: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    isDisabled: true
  },
  name: 'isDisabled'
};

export const IsQuiet: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    isQuiet: true
  },
  name: 'isQuiet'
};

export const IsQuietLabelPositionSide: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    isQuiet: true,
    labelPosition: 'side'
  },
  name: 'isQuiet, labelPosition: side'
};

export const IsEmphasized: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    isEmphasized: true
  },
  name: 'isEmphasized'
};

export const ValidationStateInvalid: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    validationState: 'invalid'
  },
  name: 'validationState: invalid'
};

export const ValidationStateValid: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    validationState: 'valid'
  },
  name: 'validationState: valid'
};

export const ValidationStateInvalidIsQuietTrue: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    validationState: 'invalid',
    isQuiet: true
  },
  name: 'validationState: invalid, isQuiet: true'
};

export const ValidationStateValidIsQuietTrue: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    validationState: 'valid',
    isQuiet: true
  },
  name: 'validationState: valid, isQuiet: true'
};

export const FormWithReset: FormStory = {
  render: () => <FormWithControls />,
  name: 'form with reset'
};

export const _FormWithSubmit: FormStory = {
  render: () => <FormWithSubmit />,
  name: 'form with submit'
};

export const FormWithNumberfieldAndLocaleArAe: FormStory = {
  render: () => (
    <Flex gap="size-100">
      <NumberField label="Outside form" description="Hello" />
      <Form>
        <NumberField label="Inside form" />
      </Form>
      <Form>
        <TextField label="First Name" />
      </Form>
      <Form>
        <TextField label="First Name" />
        <NumberField label="Inside form" />
      </Form>
    </Flex>
  ),
  name: 'form with numberfield and locale=ar-AE'
};

export const WithTranslations: FormStory = {
  render: () => <TranslateForm />,
  name: 'with translations',
  parameters: {description: {data: 'Translations included for: Arabic, English, Hebrew, Japanese, Korean, Simplified Chinese, and Traditional Chinese.'}}
};

function Render(props: any = {}) {
  let formData = props.formData || new FormData();
  return (
    <Form {...props}>
      <CheckboxGroup label="Pets" name="pets" validate={v => v.includes('dogs') ? 'No dogs' : null} defaultValue={formData.getAll('pets')}>
        <Checkbox value="dogs">Dogs</Checkbox>
        <Checkbox value="cats">Cats</Checkbox>
        <Checkbox value="dragons">Dragons</Checkbox>
      </CheckboxGroup>
      <ComboBox label="More Animals" name="combobox" defaultInputValue={formData.get('combobox')}>
        <Item key="red panda">Red Panda</Item>
        <Item key="aardvark">Aardvark</Item>
        <Item key="kangaroo">Kangaroo</Item>
        <Item key="snake">Snake</Item>
      </ComboBox>
      <SearchAutocomplete label="Search Animals" name="searchAutocomplete" defaultInputValue={formData.get('searchAutocomplete')}>
        <Item key="red panda">Red Panda</Item>
        <Item key="aardvark">Aardvark</Item>
        <Item key="kangaroo">Kangaroo</Item>
        <Item key="snake">Snake</Item>
      </SearchAutocomplete>
      <NumberField label="Years lived there" name="years" defaultValue={formData.get('years') ? Number(formData.get('years')) : undefined} />
      <Picker label="State" items={states} name="state" defaultSelectedKey={formData.get('state')}>
        {item => <Item key={item.abbr}>{item.name}</Item>}
      </Picker>
      <Picker label="Country" items={countries} name="country" defaultSelectedKey={formData.get('country')}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Picker>
      <Picker label="Favorite color" name="color" description="Select any color you like." errorMessage="Please select a nicer color." defaultSelectedKey={formData.get('color')}>
        <Item>Red</Item>
        <Item>Orange</Item>
        <Item>Yellow</Item>
        <Item>Green</Item>
        <Item>Blue</Item>
        <Item>Purple</Item>
      </Picker>
      <RadioGroup label="Favorite pet" name="favorite-pet-group" defaultValue={formData.get('favorite-pet-group')}>
        <Radio value="dogs">Dogs</Radio>
        <Radio value="cats">Cats</Radio>
        <Radio value="dragons">Dragons</Radio>
      </RadioGroup>
      <SearchField label="Search" name="search" defaultValue={formData.get('search')} />
      <Switch name="switch" defaultSelected={formData.get('switch') === 'on'}>Low power mode</Switch>
      <TextArea name="comments" label="Comments" description="Express yourself!" errorMessage="No wrong answers, except for this one." defaultValue={formData.get('comments')} />
      <TextField
        label="City"
        name="city"
        defaultValue={formData.get('city')}
        contextualHelp={(
          <ContextualHelp>
            <Heading>What is a segment?</Heading>
            <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
          </ContextualHelp>
        )} />
      <TextField label="Zip code" description="Please enter a five-digit zip code." pattern="[0-9]{5}" name="zip" defaultValue={formData.get('zip')} />
      <TagGroup label="Favorite tags" description="Select your favorite tags." errorMessage="Incorrect combination of tags.">
        <Item key="1">Cool Tag 1</Item>
        <Item key="2">Cool Tag 2</Item>
        <Item key="3">Cool Tag 3</Item>
        <Item key="4">Cool Tag 4</Item>
        <Item key="5">Cool Tag 5</Item>
        <Item key="6">Cool Tag 6</Item>
      </TagGroup>
      <ColorField label="Color" name="color" defaultValue={formData.get('color')} />
      <DateField label="Date" granularity="minute" name="date" defaultValue={formData.get('date') ? parseDateTime(formData.get('date')) : null} />
      <TimeField label="Time" name="time" defaultValue={formData.get('time') ? parseTime(formData.get('time')) : null} />
      <DatePicker label="Date picker" name="datePicker" defaultValue={formData.get('datePicker') ? parseDate(formData.get('datePicker')) : null} />
      <DateRangePicker label="Date range" startName="startDate" endName="endDate" defaultValue={formData.get('startDate') && formData.get('endDate') ? {start: parseDate(formData.get('startDate')), end: parseDate(formData.get('endDate'))} : null} />
      <TextField type="email" label="Email" name="email" defaultValue={formData.get('email')} />
      {props.showSubmit && (
        <ButtonGroup>
          <Button variant="primary" type="submit">Submit</Button>
          <Button variant="secondary" type="reset">Reset</Button>
        </ButtonGroup>
      )}
    </Form>
  );
}

function FormWithControls(props: any = {}) {
  let [firstName, setFirstName] = useState('hello');
  let [isHunter, setIsHunter] = useState(true);
  let [favoritePet, setFavoritePet] = useState('cats');
  let [favoriteColor, setFavoriteColor] = useState<Key | null>('green');
  let [howIFeel, setHowIFeel] = useState('I feel good, o I feel so good!');
  let [birthday, setBirthday] = useState<CalendarDate | null>(new CalendarDate(1732, 2, 22));
  let [money, setMoney] = useState(50);
  let [superSpeed, setSuperSpeed] = useState(true);

  return (
    <Form
      onSubmit={e => {
        action('onSubmit')(Object.fromEntries(new FormData(e.target as HTMLFormElement).entries()));
        e.preventDefault();
      }}
      {...props}>
      <TextField name="first-name" label="First Name (controlled)" value={firstName} onChange={setFirstName} />
      <TextField name="last-name" label="Last Name (uncontrolled)" defaultValue="world" />
      <TextField name="street-address" label="Street Address (uncontrolled)" />
      <Picker name="country" label="Country (uncontrolled)" items={countries}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Picker>
      <NumberField name="age" label="Age (uncontrolled)" />
      <NumberField name="money" label="Money (controlled)" formatOptions={{style: 'currency', currency: 'USD'}} value={money} onChange={setMoney} />
      <Picker name="favorite-color" label="Favorite color (controlled)" selectedKey={favoriteColor} onSelectionChange={setFavoriteColor}>
        <Item key="red">Red</Item>
        <Item key="orange">Orange</Item>
        <Item key="yellow">Yellow</Item>
        <Item key="green">Green</Item>
        <Item key="blue">Blue</Item>
        <Item key="purple">Purple</Item>
      </Picker>
      <Checkbox name="is-hunter" isSelected={isHunter} onChange={setIsHunter}>I am a hunter! (controlled)</Checkbox>
      <Checkbox name="is-wizard" defaultSelected>I am a wizard! (uncontrolled)</Checkbox>
      <Switch name="airplane-mode">Airplane mode (uncontrolled)</Switch>
      <Switch name="super-speed" isSelected={superSpeed} onChange={setSuperSpeed}>Super speed (controlled)</Switch>
      <RadioGroup label="Favorite pet (controlled)" name="favorite-pet-group" value={favoritePet} onChange={setFavoritePet}>
        <Radio value="dogs">Dogs</Radio>
        <Radio value="cats">Cats</Radio>
        <Radio value="dragons">Dragons</Radio>
      </RadioGroup>
      <RadioGroup label="Favorite pet (uncontrolled)" name="favorite-pet-group2" defaultValue="cats">
        <Radio value="dogs">Dogs</Radio>
        <Radio value="cats">Cats</Radio>
        <Radio value="dragons">Dragons</Radio>
      </RadioGroup>
      <TextArea name="comments-controlled" label="Comments (controlled)" value={howIFeel} onChange={setHowIFeel} />
      <TextArea name="comments-uncontrolled" label="Comments (uncontrolled)" defaultValue="hello" />
      <ComboBox label="Favorite Animal (uncontrolled)" name="favorite-animal" formValue="key">
        <Item key="red panda">Red Panda</Item>
        <Item key="aardvark">Aardvark</Item>
        <Item key="kangaroo">Kangaroo</Item>
        <Item key="snake">Snake</Item>
      </ComboBox>
      <DateField name="date-uncontrolled" label="Birth date (uncontrolled)" />
      <DateField name="date-controlled" label="Birth date (controlled)" value={birthday} onChange={setBirthday} />
      <DateRangePicker startName="trip-start" endName="trip-end" label="Trip dates (uncontrolled)" />
      <Slider name="cookies" label="Cookies (uncontrolled)" defaultValue={50} />
      <ButtonGroup>
        <Button variant="primary" type="submit">Submit</Button>
        <Button variant="secondary" type="reset">Reset</Button>
      </ButtonGroup>
    </Form>
  );
}

function FormWithSubmit() {
  let [policies, setPolicies] = useState<string[]>([]);
  let [policiesDirty, setPoliciesDirty] = useState(false);
  let [pet, setPet] = useState('');
  let [petDirty, setPetDirty] = useState(false);
  let [truth, setTruth] = useState(false);
  let [truthDirty, setTruthDirty] = useState(false);
  let [email, setEmail] = useState('');
  let [emailDirty, setEmailDirty] = useState(false);

  let [formStatus, setFormStatus] = useState<'progress' | 'invalid' | 'valid' | 'fixing'>('progress');
  let [isSubmitted, setSubmitted] = useState(false); // TODO: really should be isSectionInvalid / 'fixing' for each form field. once form is submitted with mistakes, unchecking an unrelated, previously valid field should not make it look invalid.

  let getValidationState = (isValid: boolean): ValidationState | undefined =>
    ['invalid', 'fixing'].includes(formStatus) && !isValid ? 'invalid' : undefined;

  useEffect(() => {
    let validate = (): boolean => policies.length === 3 && !!pet && truth && email.includes('@');
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
    <Form onSubmit={handleSubmit} isReadOnly={formStatus === 'valid'}>
      <>
        {(formStatus === 'invalid' || formStatus === 'valid') &&
          <InlineAlert variant={formStatus === 'invalid' ? 'negative' : 'positive'}>
            <Header>{formStatus === 'invalid' ? 'Error' : 'Success'}</Header>
            <Content>{formStatus === 'invalid' ? 'There was an error with the form.' : 'Form was successfully completed.'}</Content>
          </InlineAlert>
        }
      </>
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
          isInvalid={getValidationState(policies.includes('terms')) === 'invalid'}>
          Terms and conditions
        </Checkbox>
        <Checkbox
          value="privacy"
          isRequired
          isInvalid={getValidationState(policies.includes('privacy')) === 'invalid'}>
          Privacy policy
        </Checkbox>
        <Checkbox
          value="cookies"
          isRequired
          isInvalid={getValidationState(policies.includes('cookies')) === 'invalid'}>
          Cookie policy
        </Checkbox>
      </CheckboxGroup>

      <Checkbox
        isRequired
        value="truth"
        isSelected={truth}
        onChange={(chain(() => setTruthDirty(true), setTruth))}
        isInvalid={getValidationState(truth) === 'invalid'}>
        I am telling the truth
      </Checkbox>

      <RadioGroup
        label="Favorite pet"
        isRequired
        value={pet}
        onChange={chain(() => setPetDirty(true), setPet)}
        isInvalid={getValidationState(Boolean(pet)) === 'invalid'}>
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

      <TagGroup label="Favorite tags">
        <Item key="1">Cool Tag 1</Item>
        <Item key="2">Cool Tag 2</Item>
        <Item key="3">Cool Tag 3</Item>
        <Item key="4">Cool Tag 4</Item>
        <Item key="5">Cool Tag 5</Item>
        <Item key="6">Cool Tag 6</Item>
      </TagGroup>

      <Button variant="cta" type="submit" isDisabled={formStatus === 'valid'}>Submit</Button>
      <Button variant="secondary" type="reset" onPress={reset}>Reset</Button>
      <Status formStatus={formStatus} />
    </Form>
  );
}

export const NativeValidation: FormStory = {
  render: (args) => <Render {...args} />,
  args: {
    isRequired: true,
    validationBehavior: 'native',
    // @ts-ignore
    showSubmit: true,
    onSubmit: (e) => {
      e.preventDefault();
      action('onSubmit')(Object.fromEntries(new FormData(e.target as HTMLFormElement).entries()));
    }
  },
  parameters: {description: {data: 'This story is to test that client validation occurs on form submit and updates when the user commits changes to a field value (e.g. on blur).'}}
};

const ServerValidationRender = () => {
  let [serverErrors, setServerErrors] = useState<any>({});
  let onSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    for (let el of e.target.elements) {
      errors[el.name] = `Invalid value for "${el.name}".`;
    }
    setServerErrors(errors);
  };

  return (
    <Render
      validationBehavior="native"
      onSubmit={onSubmit}
      validationErrors={serverErrors}
      // @ts-ignore
      showSubmit />
  );
};

export const ServerValidation: FormStory = {
  render: () => <ServerValidationRender />,
  parameters: {description: {data: 'This story is to test that server errors appear after submission, and are cleared when a field is modified.'}}
};

export const NumberFieldFormSubmit: FormStory = {
  render: () => {
    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          action('submitted the form')();
        }}>
        <NumberField label="Number" name="number" />
      </Form>
    );
  },
  parameters: {description: {data: 'Try using "Enter" to submit the form from the NumberField. It should call an action in the actions panel.'}}
};

interface State {
  formData: FormData,
  errors: Record<string, string>
}

function FormActionExample() {
  const action = (previousState: State, formData: FormData): State => {
    let errors = {};
    for (let key of formData.keys()) {
      errors[key] = 'Some error for ' + key;
    }
    return {
      formData,
      errors
    };
  };

  const [{errors, formData}, formAction] = React.useActionState(action, {
    errors: {},
    formData: new FormData()
  });
  
  return (
    <Render
      action={formAction}
      validationErrors={errors}
      showSubmit
      formData={formData} />
  );
}

export const FormAction: FormStory = {
  render: () => <FormActionExample />
};
