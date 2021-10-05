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
import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '../';
import {Flex} from '@react-spectrum/layout';
import React, {ElementType} from 'react';
import {SpectrumButtonProps} from '@react-types/button';
import {Text} from '@react-spectrum/text';

export default {
  title: 'Button',

  parameters: {
    providerSwitcher: {status: 'positive'}
  }
};

export const VariantCta = () => render({variant: 'cta'});

VariantCta.story = {
  name: 'variant: cta'
};

export const WithIcon = () => (
  <Flex gap="size-200">
    <Button
      onPress={action('press')}
      onPressStart={action('pressstart')}
      onPressEnd={action('pressend')}
      variant="primary">
      <Bell />
      <Text>Default</Text>
    </Button>
    <Button
      onPress={action('press')}
      onPressStart={action('pressstart')}
      onPressEnd={action('pressend')}
      isDisabled
      variant="primary">
      <Text>Disabled</Text>
      <Bell />
    </Button>
    <Button
      onPress={action('press')}
      onPressStart={action('pressstart')}
      onPressEnd={action('pressend')}
      isQuiet
      variant="primary">
      <Bell />
      <Text>Quiet</Text>
    </Button>
  </Flex>
);

WithIcon.story = {
  name: 'with icon'
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

export const ElementAHrefExampleComTargetSelf = () =>
  render({
    elementType: 'a',
    href: '//example.com',
    target: '_self',
    variant: 'primary'
  });

ElementAHrefExampleComTargetSelf.story = {
  name: "element: a, href: '//example.com', target: '_self'"
};

export const ElementARelNoopenerNoreferrer = () =>
  render({
    elementType: 'a',
    href: '//example.com',
    rel: 'noopener noreferrer',
    variant: 'primary'
  });

ElementARelNoopenerNoreferrer.story = {
  name: "element: a, rel: 'noopener noreferrer'"
};

function render<T extends ElementType = 'button'>(
  props: SpectrumButtonProps<T> = {variant: 'primary'}
) {
  return (
    <Flex gap="size-200">
      <Button
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        {...props}>
        Default
      </Button>
      <Button
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        isDisabled
        {...props}>
        Disabled
      </Button>
      {props.variant !== 'cta' && (
        <Button
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          isQuiet
          {...props}>
          Quiet
        </Button>
      )}
    </Flex>
  );
}
