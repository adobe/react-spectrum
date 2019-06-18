/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

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
