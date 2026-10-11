/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {LightboxCarousel, LightboxItem, LightboxPicker, LightboxPickerItem, LightboxItems} from '../src/Lightbox';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const meta: Meta<typeof LightboxCarousel> = {
  title: 'AI/Lightbox',
  component: LightboxCarousel,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type Story = StoryObj<typeof LightboxCarousel>;

const imageStyles = style({
  display: 'block',
  width: 'full',
  aspectRatio: '4/3',
  objectFit: 'contain'
});

export const Basic: Story = {
  render: args => (
    <div
      role="region"
      aria-label="Photos"
      aria-roledescription="carousel"
      className={style({width: 400, maxWidth: 'full'})}>
      <LightboxCarousel {...args}>
        <LightboxPicker aria-label="Choose photo">
          <LightboxPickerItem id="amsterdam" aria-label="Amsterdam" />
          <LightboxPickerItem id="lands-end" aria-label="Land's End" />
          <LightboxPickerItem id="trust" aria-label="Trust" />
        </LightboxPicker>
        <LightboxItems>
          <LightboxItem id="amsterdam">
            <img
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/amsterdamslide__800x600.jpg"
              alt="Amsterdam canal"
              className={imageStyles}
            />
          </LightboxItem>
          <LightboxItem id="lands-end">
            <img
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/lands-endslide__800x600.jpg"
              alt="Land's End coastal landscape"
              className={imageStyles}
            />
          </LightboxItem>
          <LightboxItem id="trust">
            <img
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/trustslide-2__800x600.jpg"
              alt="Trust television series promotion"
              className={imageStyles}
            />
          </LightboxItem>
        </LightboxItems>
      </LightboxCarousel>
    </div>
  ),
  args: {
    defaultSelectedKey: 'amsterdam'
  }
};
