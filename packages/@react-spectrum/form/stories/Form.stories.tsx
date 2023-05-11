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
import {ComboBox} from '@react-spectrum/combobox';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {countries, states} from './data';
import {Flex} from '@react-spectrum/layout';
import {Form} from '../';
import {Heading} from '@react-spectrum/text';
import {Item, Picker} from '@react-spectrum/picker';
import {NumberField} from '@react-spectrum/numberfield';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React, {Key, useEffect, useState} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {StatusLight} from '@react-spectrum/statuslight';
import {Switch} from '@react-spectrum/switch';
import {TagGroup} from '@react-spectrum/tag';
import {TextArea, TextField} from '@react-spectrum/textfield';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {Well} from '@react-spectrum/well';

export default {
  title: 'Form',
  providerSwitcher: {status: 'positive'}
};

export const Default = () => render({});
export const LabelPositionSide = () => render({labelPosition: 'side'});

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const CustomWidth = () => render({width: 400});

CustomWidth.story = {
  name: 'custom width'
};

export const CustomWidthLabelPositionSide = () => render({width: 400, labelPosition: 'side'});

CustomWidthLabelPositionSide.story = {
  name: 'custom width, labelPosition: side'
};

export const LabelAlignEnd = () => render({width: 400, labelAlign: 'end'});

LabelAlignEnd.story = {
  name: 'labelAlign: end'
};

export const LabelPositionSideLabelAlignEnd = () =>
  render({width: 400, labelPosition: 'side', labelAlign: 'end'});

LabelPositionSideLabelAlignEnd.story = {
  name: 'labelPosition: side, labelAlign: end'
};

export const FieldsNextToEachOther = () => (
  <Form>
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
);

FieldsNextToEachOther.story = {
  name: 'fields next to each other'
};

export const FieldsWithAutoCompleteProperty = () => {
  const [checked, setChecked] = useState(true);
  return (
    <Form>
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

FieldsWithAutoCompleteProperty.story = {
  name: 'fields with autoComplete property'
};

export const IsRequiredTrue = () => render({isRequired: true});

IsRequiredTrue.story = {
  name: 'isRequired: true'
};

export const IsRequiredTrueNecessityIndicatorLabel = () =>
  render({isRequired: true, necessityIndicator: 'label'});

IsRequiredTrueNecessityIndicatorLabel.story = {
  name: 'isRequired: true, necessityIndicator: label'
};

export const IsRequiredFalseNecessityIndicatorLabel = () =>
  render({isRequired: false, necessityIndicator: 'label'});

IsRequiredFalseNecessityIndicatorLabel.story = {
  name: 'isRequired: false, necessityIndicator: label'
};

export const IsDisabled = () => render({isDisabled: true});

IsDisabled.story = {
  name: 'isDisabled'
};

export const IsQuiet = () => render({isQuiet: true});

IsQuiet.story = {
  name: 'isQuiet'
};

export const IsQuietLabelPositionSide = () => render({isQuiet: true, labelPosition: 'side'});

IsQuietLabelPositionSide.story = {
  name: 'isQuiet, labelPosition: side'
};

export const IsEmphasized = () => render({isEmphasized: true});

IsEmphasized.story = {
  name: 'isEmphasized'
};

export const ValidationStateInvalid = () => render({validationState: 'invalid'});

ValidationStateInvalid.story = {
  name: 'validationState: invalid'
};

export const ValidationStateValid = () => render({validationState: 'valid'});

ValidationStateValid.story = {
  name: 'validationState: valid'
};

export const ValidationStateInvalidIsQuietTrue = () =>
  render({validationState: 'invalid', isQuiet: true});

ValidationStateInvalidIsQuietTrue.story = {
  name: 'validationState: invalid, isQuiet: true'
};

export const ValidationStateValidIsQuietTrue = () =>
  render({validationState: 'valid', isQuiet: true});

ValidationStateValidIsQuietTrue.story = {
  name: 'validationState: valid, isQuiet: true'
};

export const FormWithReset = () => <FormWithControls />;

FormWithReset.story = {
  name: 'form with reset'
};

export const _FormWithSubmit = () => <FormWithSubmit />;

_FormWithSubmit.story = {
  name: 'form with submit'
};

export const FormWithNumberfieldAndLocaleArAe = () => (
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
);

FormWithNumberfieldAndLocaleArAe.story = {
  name: 'form with numberfield and locale=ar-AE'
};

function render(props: any = {}) {
  return (
    <Form {...props}>
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
      <NumberField label="Years lived there" />
      <Picker label="State" items={states}>
        {item => <Item key={item.abbr}>{item.name}</Item>}
      </Picker>
      <Picker label="Country" items={countries}>
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
      <Switch>Low power mode</Switch>
      <TextArea label="Comments" description="Express yourself!" errorMessage="No wrong answers, except for this one." />
      <TextField
        label="City"
        contextualHelp={(
          <ContextualHelp>
            <Heading>What is a segment?</Heading>
            <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
          </ContextualHelp>
        )} />
      <TextField label="Zip code" description="Please enter a five-digit zip code." errorMessage="Please remove letters and special characters." />
      <TagGroup label="Favorite tags" description="Select your favorite tags." errorMessage="Incorrect combination of tags.">
        <Item key="1">Cool Tag 1</Item>
        <Item key="2">Cool Tag 2</Item>
        <Item key="3">Cool Tag 3</Item>
        <Item key="4">Cool Tag 4</Item>
        <Item key="5">Cool Tag 5</Item>
        <Item key="6">Cool Tag 6</Item>
      </TagGroup>
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
        {...props}>
        <TextField name="first-name" label="First Name controlled" value={firstName} onChange={setFirstName} />
        <TextField name="last-name" label="Last Name default" defaultValue="world" />
        <TextField name="street-address" label="Street Address none" />
        <Picker name="country" label="Country none" items={countries}>
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
        <TextArea name="comments-controlled" label="Comments" value={howIFeel} onChange={setHowIFeel} />
        <TextArea name="comments-uncontrolled" label="Comments" defaultValue="hello" />
        <ComboBox label="Favorite Animal" name="favorite-animal">
          <Item key="red panda">Red Panda</Item>
          <Item key="aardvark">Aardvark</Item>
          <Item key="kangaroo">Kangaroo</Item>
          <Item key="snake">Snake</Item>
        </ComboBox>
        <TagGroup label="Favorite tags">
          <Item key="1">Cool Tag 1</Item>
          <Item key="2">Cool Tag 2</Item>
          <Item key="3">Cool Tag 3</Item>
          <Item key="4">Cool Tag 4</Item>
          <Item key="5">Cool Tag 5</Item>
          <Item key="6">Cool Tag 6</Item>
        </TagGroup>
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
            <input type="text" value={firstName2} onChange={e => setFirstName2(e.target.value)} />
          </label>
          <label>
            Last Name default
            <input type="text" defaultValue="world" />
          </label>
          <label>
            Street Address none
            <input type="text" />
          </label>
          <label>
            Country none
            <select name="Country">
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
            <textarea value={howIFeel2} onChange={e => setHowIFeel2(e.target.value)} />
          </label>
          <label>
            Comments default
            <textarea defaultValue="hello" />
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
    <Form onSubmit={handleSubmit} isReadOnly={formStatus === 'valid'}>
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
