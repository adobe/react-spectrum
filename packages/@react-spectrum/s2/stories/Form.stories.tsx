import {Form} from '../src/Form';

import type {Meta} from '@storybook/react';
import {TextArea, TextField} from '../src/TextField';
import {Button} from '../src/Button';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {Checkbox} from '../src/Checkbox';
import {SearchField} from '../src/SearchField';
import {CheckboxGroup} from '../src/CheckboxGroup';
import {Switch} from '../src/Switch';
import {Radio} from '../src/Radio';
import {RadioGroup} from '../src/RadioGroup';

const meta: Meta<typeof Form> = {
  component: Form,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
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
    <Button type="submit" variant="primary" className={style({gridColumnStart: 'field', width: 'fit'})()}>Submit</Button>
  </Form>
);
