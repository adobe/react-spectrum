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

import {action} from 'storybook/actions';
import {ActionButton} from '../../src/button/ActionButton';
import {Content} from '../../src/view/Content';
import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {Dialog} from '../../src/dialog/Dialog';
import {DialogTrigger} from '../../src/dialog/DialogTrigger';
import {Flex} from '../../src/layout/Flex';
import {Heading} from '../../src/text/Heading';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import Refresh from '@spectrum-icons/workflow/Refresh';
import {SearchField} from '../../src/searchfield/SearchField';

const info =
  'A containing element with `role="search"` has been added to define a **search** landmark region.';

export default {
  title: 'SearchField',
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
    validationState: undefined
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
} as Meta<typeof SearchField>;

export type SearchFieldStory = StoryObj<typeof SearchField>;

export const Default: SearchFieldStory = {
  render: args => renderSearchLandmark(render(args)),
  parameters: {info}
};

export const DefaultValueUncontrolled: SearchFieldStory = {
  render: args => renderSearchLandmark(render({...args, defaultValue: 'React'})),
  name: 'defaultValue (uncontrolled)',
  parameters: {info}
};

export const ValueControlled: SearchFieldStory = {
  render: args => renderSearchLandmark(render({...args, value: 'React'})),
  name: 'value (controlled)',
  parameters: {info}
};

export const IconRefresh: SearchFieldStory = {
  render: args => renderSearchLandmark(render({...args, defaultValue: 'React', icon: <Refresh />})),
  name: 'icon: refresh',
  parameters: {info}
};

export const IconNull: SearchFieldStory = {
  render: args => renderSearchLandmark(render({...args, defaultValue: 'React', icon: null})),
  name: 'icon: null',
  parameters: {info}
};

export const OnClear: SearchFieldStory = {
  render: args => renderSearchLandmark(render({...args, onClear: action('clear')})),
  name: 'onClear',
  parameters: {info}
};

export const AutoFocus: SearchFieldStory = {
  render: args => renderSearchLandmark(render({...args, autoFocus: true})),
  name: 'autoFocus',
  parameters: {info}
};

export const NoVisibleLabel: SearchFieldStory = {
  render: args => render({...args, label: null, 'aria-label': 'Street address'}),
  name: 'no visible label'
};

export const WithDescription: SearchFieldStory = {
  render: args => render({...args, description: 'Enter a search term.'}),
  name: 'with description'
};

export const WithErrorMessage: SearchFieldStory = {
  render: args =>
    render({...args, errorMessage: 'Remove special characters.', validationState: 'invalid'}),
  name: 'with error message'
};

export const _ContextualHelp: SearchFieldStory = {
  render: args =>
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
    }),
  name: 'contextual help'
};

export const CustomWidth: SearchFieldStory = {
  render: args => render({...args, width: 300}),
  name: 'custom width'
};

export const CustomWidthAndNarrowContainer: SearchFieldStory = {
  render: args => (
    <Flex direction="column" width="30px">
      {render({...args, defaultValue: 'React', validationState: 'valid'})}
      {render({...args, defaultValue: 'React', width: 30})}
      {render({...args, defaultValue: 'React', width: 30, validationState: 'valid'})}
    </Flex>
  ),
  name: 'custom width and narrow container'
};

export const WithinAPopover: SearchFieldStory = {
  render: args => (
    <DialogTrigger type="popover">
      <ActionButton>Trigger</ActionButton>
      <Dialog>
        <Heading>The Heading</Heading>
        <Content>
          <SearchField
            label="Search"
            {...args}
            onChange={action('change')}
            onSubmit={action('submit')}
          />
        </Content>
      </Dialog>
    </DialogTrigger>
  ),
  name: 'within a popover'
};

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
      onSubmit={action('submit')}
    />
  );
}
