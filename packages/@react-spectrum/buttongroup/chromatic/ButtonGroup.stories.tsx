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

import {Button} from '@react-spectrum/button';
import {ButtonGroup, SpectrumButtonGroupProps} from '../';
import React, {JSX} from 'react';
import {StoryFn} from '@storybook/react';
import {View} from '@react-spectrum/view';

export default {
  title: 'ButtonGroup'
};

export type ButtonGroupStory = StoryFn<typeof ButtonGroup>;

export const Default: ButtonGroupStory = () => render({});

Default.story = {
  name: 'default'
};

export const AlignCenter: ButtonGroupStory = () => render({align: 'center'});

AlignCenter.story = {
  name: 'align: center'
};

export const AlignEnd: ButtonGroupStory = () => render({align: 'end'});

AlignEnd.story = {
  name: 'align: end'
};

export const OrientationVertical: ButtonGroupStory = () => render({orientation: 'vertical'});

OrientationVertical.story = {
  name: 'orientation: vertical'
};

export const OrientationVerticalAlignCenter: ButtonGroupStory = () =>
  render({orientation: 'vertical', align: 'center'});

OrientationVerticalAlignCenter.story = {
  name: 'orientation: vertical, align: center'
};

export const OrientationVerticalAlignEnd: ButtonGroupStory = () => render({orientation: 'vertical', align: 'end'});

OrientationVerticalAlignEnd.story = {
  name: 'orientation: vertical, align: end'
};

function render(props: Omit<SpectrumButtonGroupProps, 'children'>): JSX.Element {
  return (
    <>
      <View borderColor="static-blue-400" borderWidth="thin">
        <ButtonGroup width="size-4600" {...props}>
          <Button variant="primary">Button 1</Button>
          <Button variant="primary">Button 2</Button>
        </ButtonGroup>
      </View>
      <View borderColor="static-blue-400" borderWidth="thin">
        <ButtonGroup width="size-1700" {...props}>
          <Button variant="primary">Button 1</Button>
          <Button variant="primary">Button 2</Button>
        </ButtonGroup>
      </View>
    </>
  );
}
