import Checkbox from '../src/Checkbox';
import {Form, FormItem} from '../src/Form';
import Link from '../src/Link';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textarea from '../src/Textarea';
import Textfield from '../src/Textfield';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Form', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <Form>
        <FormItem label="Company Title">
          <Textfield placeholder="Company Title" />
        </FormItem>
        <FormItem label="Life Story">
          <Textarea placeholder="Life Story" />
        </FormItem>
        <FormItem label={<Link href="#">Terms</Link>}>
          <Checkbox label="I Agree" />
        </FormItem>
      </Form>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Label Right',
    () => (
      <Form>
        <FormItem label="Company Title" labelAlign="right">
          <Textfield placeholder="Company Title" />
        </FormItem>
        <FormItem label="Life Story" labelAlign="right">
          <Textarea placeholder="Life Story" />
        </FormItem>
        <FormItem label={<Link href="#">Terms</Link>} labelAlign="right">
          <Checkbox label="I Agree" />
        </FormItem>
      </Form>
    ),
    {inline: true}
  );
