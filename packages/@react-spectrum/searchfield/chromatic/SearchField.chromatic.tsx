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

import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import React from 'react';
import Refresh from '@spectrum-icons/workflow/Refresh';
import {SearchField} from '../';

const info =
  'A containing element with `role="search"` has been added to define a **search** landmark region.';

export default {
  title: 'SearchField'
};

export const Default = () => renderSearchLandmark(render());

Default.story = {
  parameters: {info}
};

export const Value = () => renderSearchLandmark(render({value: 'React'}));

Value.story = {
  name: 'value',
  parameters: {info}
};

export const IsDisabled = () => renderSearchLandmark(render({value: 'React', isDisabled: true}));

IsDisabled.story = {
  name: 'isDisabled',
  parameters: {info}
};

export const IsReadOnly = () => renderSearchLandmark(render({value: 'React', isReadOnly: true}));

IsReadOnly.story = {
  name: 'isReadOnly',
  parameters: {info}
};

export const IconRefresh = () =>
  renderSearchLandmark(render({defaultValue: 'React', icon: <Refresh />}));

IconRefresh.story = {
  name: 'icon: refresh',
  parameters: {info}
};

export const IconNull = () => renderSearchLandmark(render({defaultValue: 'React', icon: null}));

IconNull.story = {
  name: 'icon: null',
  parameters: {info}
};

export const CustomWidth = () => render({defaultValue: 'React', width: 275});

CustomWidth.story = {
  name: 'custom width'
};

export const _ContextualHelp = (args) =>
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

function renderSearchLandmark(child) {
  return <div role="search">{child}</div>;
}

function render(props = {}) {
  return (
    <Flex gap="size-100">
      <SearchField label="Default" placeholder="React" {...props} />
      <SearchField label="Quiet" placeholder="React" isQuiet {...props} />
      <SearchField label="Disabled" placeholder="React" isDisabled {...props} />
      <SearchField label="Quiet + Disabled" placeholder="React" isQuiet isDisabled {...props} />
    </Flex>
  );
}
