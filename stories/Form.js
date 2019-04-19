import Checkbox from '../src/Checkbox';
import {Form, FormItem} from '../src/Form';
import Link from '../src/Link';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textarea from '../src/Textarea';
import Textfield from '../src/Textfield';

storiesOf('Form', module)
  .add(
    'Default',
    () => (
      <Form>
        <FormItem label="Company Title">
          <Textfield placeholder="Company Title" />
        </FormItem>
        <FormItem label="Life Story">
          <Textarea placeholder="Life Story" />
        </FormItem>
        <FormItem>
          <Checkbox
            name="agreeToTerms"
            label={<span>I agree to the <Link href="#" target="_self" style={{position: 'relative', zIndex: 1}}>terms and conditions </Link>.</span>} />
        </FormItem>
      </Form>
    )
  )
  .add(
    'Label Right',
    () => (
      <Form>
        <FormItem label="Company Title" labelAlign="right">
          <Textfield placeholder="Company Title" />
        </FormItem>
        <FormItem label="Life Story" labelAlign="right">
          <Textarea placeholder="Life Story" />
        </FormItem>
        <FormItem>
          <Checkbox
            name="agreeToTerms"
            label={<span>I agree to the <Link href="#" target="_self" style={{position: 'relative', zIndex: 1}}>terms and conditions </Link>.</span>} />
        </FormItem>
      </Form>
    )
  );
