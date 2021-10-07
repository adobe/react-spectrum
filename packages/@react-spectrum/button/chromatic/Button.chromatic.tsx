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

import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '../';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {Text} from '@react-spectrum/text';

export default {
  title: 'Button',
  parameters: {
    chromaticProvider: {locales: ['en-US', 'ar-AE', 'zh-TW']}
  }
};

export const VariantCta = () => render({variant: 'cta'});

VariantCta.story = {
  name: 'variant: cta'
};

export const WithIcon = () => (
  <Flex gap="size-200">
    <Button variant="primary">
      <Bell />
      <Text>Default</Text>
    </Button>
    <Button isDisabled variant="primary">
      <Text>Disabled</Text>
      <Bell />
    </Button>
    <Button isQuiet variant="primary">
      <Bell />
      <Text>Quiet</Text>
    </Button>
    <Button isQuiet variant="primary">
      <Bell />
      <Text>هادئ</Text>
    </Button>
  </Flex>
);

WithIcon.story = {
  name: 'with icon'
};

export const DoubleTextNode = () => (
  <Flex gap="size-200">
    <Button variant="primary">{0} Dogs</Button>
    <Button isDisabled variant="primary">
      {0} Dogs
    </Button>
    <Button isQuiet variant="primary">
      {0} Dogs
    </Button>
  </Flex>
);

DoubleTextNode.story = {
  name: 'double text node'
};

export const VariantOverBackground = () => (
  <div
    style={{
      backgroundColor: 'rgb(15, 121, 125)',
      color: 'rgb(15, 121, 125)',
      padding: '15px 20px',
      display: 'inline-block'
    }}>
    {render({variant: 'overBackground'})}
  </div>
);

VariantOverBackground.story = {
  name: 'variant: overBackground'
};

export const VariantPrimary = () => render({variant: 'primary'});

VariantPrimary.story = {
  name: 'variant: primary'
};

export const VariantSecondary = () => render({variant: 'secondary'});

VariantSecondary.story = {
  name: 'variant: secondary'
};

export const VariantNegative = () => render({variant: 'negative'});

VariantNegative.story = {
  name: 'variant: negative'
};

export const ElementA = () => render({elementType: 'a', variant: 'primary'});

ElementA.story = {
  name: 'element: a'
};

function render(props: any = {}) {
  return (
    <Flex gap="size-200">
      <Button {...props}>Default</Button>
      <Button isDisabled {...props}>
        Disabled
      </Button>
      {props.variant !== 'cta' && (
        <Button isQuiet {...props}>
          Quiet
        </Button>
      )}
      <Button {...props}>默認</Button>
    </Flex>
  );
}
