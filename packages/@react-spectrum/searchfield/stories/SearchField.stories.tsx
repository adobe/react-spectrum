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
import {ActionButton} from '@react-spectrum/button';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import Refresh from '@spectrum-icons/workflow/Refresh';
import {SearchField} from '../';

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

export type SearchFieldStory = StoryFn<typeof SearchField>;

export const Default: SearchFieldStory = (args) => renderSearchLandmark(render(args));

Default.story = {
  parameters: {info}
};

export const DefaultValueUncontrolled: SearchFieldStory = (args) =>
  renderSearchLandmark(render({...args, defaultValue: 'React'}));

DefaultValueUncontrolled.story = {
  name: 'defaultValue (uncontrolled)',
  parameters: {info}
};

export const ValueControlled: SearchFieldStory = (args) => renderSearchLandmark(render({...args, value: 'React'}));

ValueControlled.story = {
  name: 'value (controlled)',
  parameters: {info}
};

export const IconRefresh: SearchFieldStory = (args) =>
  renderSearchLandmark(render({...args, defaultValue: 'React', icon: <Refresh />}));

IconRefresh.story = {
  name: 'icon: refresh',
  parameters: {info}
};

export const IconNull: SearchFieldStory = (args) =>
  renderSearchLandmark(render({...args, defaultValue: 'React', icon: null}));

IconNull.story = {
  name: 'icon: null',
  parameters: {info}
};

export const OnClear: SearchFieldStory = (args) =>
  renderSearchLandmark(render({...args, onClear: action('clear')}));

OnClear.story = {
  name: 'onClear',
  parameters: {info}
};

export const AutoFocus: SearchFieldStory = (args) => renderSearchLandmark(render({...args, autoFocus: true}));

AutoFocus.story = {
  name: 'autoFocus',
  parameters: {info}
};

export const NoVisibleLabel: SearchFieldStory = (args) =>
  render({...args, label: null, 'aria-label': 'Street address'});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const WithDescription: SearchFieldStory = (args) => render({...args, description: 'Enter a search term.'});

WithDescription.story = {
  name: 'with description'
};

export const WithErrorMessage: SearchFieldStory = (args) =>
  render({...args, errorMessage: 'Remove special characters.', validationState: 'invalid'});

WithErrorMessage.story = {
  name: 'with error message'
};

export const _ContextualHelp: SearchFieldStory = (args) =>
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
  });

_ContextualHelp.story = {
  name: 'contextual help'
};

export const CustomWidth: SearchFieldStory = (args) => render({...args, width: 300});

CustomWidth.story = {
  name: 'custom width'
};

export const CustomWidthAndNarrowContainer: SearchFieldStory = (args) => (
  <Flex direction="column" width="30px">
    {render({...args, defaultValue: 'React', validationState: 'valid'})}
    {render({...args, defaultValue: 'React', width: 30})}
    {render({...args, defaultValue: 'React', width: 30, validationState: 'valid'})}
  </Flex>
);

CustomWidthAndNarrowContainer.story = {
  name: 'custom width and narrow container'
};

export const WithinAPopover: SearchFieldStory = (args) => (
  <DialogTrigger type="popover">
    <ActionButton>Trigger</ActionButton>
    <Dialog>
      <Heading>The Heading</Heading>
      <Content>
        <SearchField
          label="Search"
          {...args}
          onChange={action('change')}
          onSubmit={action('submit')} />
      </Content>
    </Dialog>
  </DialogTrigger>
);

WithinAPopover.story = {
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
      onSubmit={action('submit')} />
  );
}
