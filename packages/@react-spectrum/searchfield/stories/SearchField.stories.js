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
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import React from 'react';
import Refresh from '@spectrum-icons/workflow/Refresh';
import {SearchField} from '../';
import {storiesOf} from '@storybook/react';

const info = 'A containing element with `role="search"` has been added to define a **search** landmark region.';

storiesOf('SearchField', module)
  .addParameters({
    providerSwitcher: {status: 'positive'},
    args: {
      label: 'Search',
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
  })
  .add(
    'Default',
    args => renderSearchLandmark(render(args)),
    {info}
  )
  .add(
    'defaultValue (uncontrolled)',
    args => renderSearchLandmark(render({...args, defaultValue: 'React'})),
    {info}
  )
  .add(
    'value (controlled)',
    args => renderSearchLandmark(render({...args, value: 'React'})),
    {info}
  )
  .add(
    'icon: refresh',
    args => renderSearchLandmark(render({...args, defaultValue: 'React', icon: <Refresh />})),
    {info}
  )
  .add(
    'icon: null',
    args => renderSearchLandmark(render({...args, defaultValue: 'React', icon: null})),
    {info}
  )
  .add(
    'onClear',
    args => renderSearchLandmark(render({...args, onClear: action('clear')})),
    {info}
  )
  .add(
    'autoFocus',
    args => renderSearchLandmark(render({...args, autoFocus: true})),
    {info}
  )
  .add(
    'no visible label',
    args => render({...args, label: null, 'aria-label': 'Street address'})
  )
  .add('with description',
    args => render({...args, description: 'Enter a search term.'})
  )
  .add('with error message',
    args => render({...args, errorMessage: 'Remove special characters.', validationState: 'invalid'})
  )
  .add(
    'contextual help',
    args => render({...args, contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )})
  )
  .add('custom width',
    args => render({...args, width: 300})
  )
  .add('custom width and narrow container',
    args => (
      <Flex direction="column" width="30px">
        {render({...args, defaultValue: 'React', validationState: 'valid'})}
        {render({...args, defaultValue: 'React', width: 30})}
        {render({...args, defaultValue: 'React', width: 30, validationState: 'valid'})}
      </Flex>
    )
  );

function renderSearchLandmark(child) {
  return <div role="search">{child}</div>;
}

function render(props = {}) {
  return (
    <SearchField
      UNSAFE_className="custom_classname"
      label="Search"
      {...props}
      onChange={action('change')}
      onSubmit={action('submit')} />
  );
}
