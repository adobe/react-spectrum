/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {Button, Content, Flex, Footer, Heading, Link, Text} from '@adobe/react-spectrum';
import {ContextualHelp} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('ContextualHelp', module)
.add(
  'default',
  () => render({heading: 'Help title', description: helpText()})
)
.add(
  'type: info',
  () => render({heading: 'Help title', description: helpText(), variant: 'info'})
)
.add(
  'with link',
  () => render({heading: 'Help title', description: helpText(), link: <Link>Learn more</Link>})
)
.add(
  'with button',
  () => (<Flex alignItems="center">
    <Button variant="primary" isDisabled>Create</Button>
    <ContextualHelp marginStart="size-100">
      <Heading>Help title</Heading>
      <Content>{helpText()}</Content>
    </ContextualHelp>
  </Flex>)
)
.add(
  'trigger events',
  () => render({heading: 'Help title', description: helpText(), onOpenChange: action('open change')})
)
.add(
  'placement: bottom',
  () => render({heading: 'Help title', description: helpText(), placement: 'bottom'})
)
.add(
  'placement: bottom start',
  () => render({heading: 'Help title', description: helpText(), placement: 'bottom start'})
);

const helpText = () => <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem.</Text>;

function render(props: any = {}) {
  let {heading, description, link, ...otherProps} = props;

  return (
    <ContextualHelp {...otherProps}>
      {heading && <Heading>{heading}</Heading>}
      {description && <Content>{description}</Content>}
      {link && <Footer>{link}</Footer>}
    </ContextualHelp>
  );
}
