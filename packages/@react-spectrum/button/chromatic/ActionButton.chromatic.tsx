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

import {ActionButton} from '../';
import Add from '@spectrum-icons/workflow/Add';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';

storiesOf('Button/ActionButton', module)
  .add(
    'text',
    () => (
      <Flex gap="size-100">
        <ActionButton>
          Default
        </ActionButton>
        <ActionButton isQuiet>
          Quiet
        </ActionButton>
        <ActionButton isDisabled>
          Disabled
        </ActionButton>
      </Flex>
    )
  )
  .add(
    'icon + text',
    () => (
      <Flex gap="size-100">
        <ActionButton>
          <Add />
          <Text>Default</Text>
        </ActionButton>
        <ActionButton isQuiet>
          <Add />
          <Text>Quiet</Text>
        </ActionButton>
        <ActionButton isDisabled>
          <Text>Disabled</Text>
          <Add />
        </ActionButton>
      </Flex>
    )
  )
  .add(
    'icon only',
    () => (
      <Flex gap="size-100">
        <ActionButton>
          <Add />
        </ActionButton>
        <ActionButton isQuiet>
          <Add />
        </ActionButton>
        <ActionButton isDisabled>
          <Add />
        </ActionButton>
      </Flex>
    )
  );
