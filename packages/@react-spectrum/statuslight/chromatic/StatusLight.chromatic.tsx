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

import React from 'react';
import {StatusLight} from '../';
import {storiesOf} from '@storybook/react';
import {Flex} from "@react-spectrum/layout";
import {SpectrumStatusLightProps} from "@react-types/statuslight";
import {View} from "@react-spectrum/view";
import {Switch} from "@react-spectrum/switch";

let variants = ['celery', 'yellow', 'fuchsia', 'indigo', 'seafoam', 'chartreuse', 'magenta', 'purple', 'neutral', 'info', 'positive', 'notice', 'negative', 'positive'];

storiesOf('StatusLight', module)
  .add(
    'all variants',
    () => render()
  )
  .add(
    'multiline',
    () => (
      <View width="size-3000">
        <StatusLight variant="celery">Super long status light label. Sample text. Arma virumque cano, Troiae qui primus ab oris.</StatusLight>
      </View>
    )
  );

function render() {
  return (
    <Flex wrap>
      {variants.map((variant: SpectrumStatusLightProps['variant']) => (
        <>
          <StatusLight variant={variant}>Status light {variant}</StatusLight>
          <StatusLight variant={variant} isDisabled>Disabled {variant}</StatusLight>
        </>
      ))}
    </Flex>
  );
}
