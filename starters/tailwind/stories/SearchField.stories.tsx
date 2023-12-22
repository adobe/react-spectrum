import { Form } from 'react-aria-components';
import {SearchField} from '../src/SearchField';

import type {Meta} from '@storybook/react';
import { Button } from '../src/Button';

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    label: 'Search'
  }
};

export default meta;

export const Example = (args: any) => <SearchField {...args} />;

export const Validation = (args) => (
  <Form className="flex flex-col gap-2 items-start">
    <SearchField {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
