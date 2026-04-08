/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Color, parseColor} from 'react-stately/Color';

import {ColorField, ColorFieldProps} from '../src/ColorField';
import {FieldError} from '../src/FieldError';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {Meta, StoryObj} from '@storybook/react';
import {ProgressCircle} from 'vanilla-starter/ProgressCircle';
import React, {useState} from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/ColorField',
  argTypes: {
    colorSpace: {
      control: 'select',
      options: ['rgb', 'hsl', 'hsb']
    },
    channel: {
      control: 'select',
      options: [null, 'red', 'green', 'blue', 'hue', 'saturation', 'lightness', 'brightness']
    }
  },
  component: ColorField
} as Meta<typeof ColorField>;

export type ColorFieldStory = StoryObj<(props: ColorFieldProps & {label: string}) => ReturnType<typeof ColorField>>;

export const ColorFieldExample: ColorFieldStory = {
  render: (args) => (
    <ColorField {...args} validate={(v) => (v?.getChannelValue('red') === 0 ? 'Invalid value' : null)}>
      <Label>{args.label}</Label>
      <Input style={{display: 'block'}} />
      <FieldError />
    </ColorField>
  ),
  args: {
    label: 'Test',
    defaultValue: '#f00'
  }
};

let colorActionCache = new Map<string, Promise<void>>();

function ColorActionResults({colorKey}: {colorKey: string}) {
  let promise = colorActionCache.get(colorKey);
  if (!promise) {
    colorActionCache.clear();
    promise = new Promise<void>(resolve => setTimeout(resolve, 2000));
    colorActionCache.set(colorKey, promise);
  }
  React.use(promise);
  return <div>Results for: {colorKey || '(empty)'}</div>;
}

function ColorFieldReactActionExample(args) {
  let [color, setColor] = useState<Color | null>(() => parseColor('#ff0000'));
  let colorKey = color?.toString('hex') ?? '';
  return (
    <div>
      <ColorField
        {...args}
        value={color}
        changeAction={async c => {
          setColor(c);
        }}>
        {({isPending}) => (
          <>
            <Label>Color</Label>
            <Input style={{display: 'block'}} />
            {isPending && <ProgressCircle aria-label="Loading" isIndeterminate style={{display: 'inline-block'}} />}
          </>
        )}
      </ColorField>
      <React.Suspense fallback="Loading">
        <ColorActionResults colorKey={colorKey} />
      </React.Suspense>
    </div>
  );
}

export const ReactAction: ColorFieldStory = {
  render: (args) => <ColorFieldReactActionExample {...args} />,
  args: {
    label: 'Color'
  }
};
