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

import {Attachment, AttachmentList, AttachmentPreview} from '../src/AttachmentList';
import {Button as AriaButton} from 'react-aria-components/Button';
import {Button} from '@react-spectrum/s2/Button';
import {Content} from '@react-spectrum/s2/Content';
import {Dialog} from 'react-aria-components/Dialog';
import {Heading} from 'react-aria-components/Heading';
import {
  LightboxCarousel,
  LightboxItem,
  LightboxItems,
  LightboxPicker,
  LightboxPickerItem,
  LightboxTrigger
} from '../src/Lightbox';
import type {Meta, StoryObj} from '@storybook/react';
import {Modal, ModalOverlay} from 'react-aria-components/Modal';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';
import {useState} from 'react';

const meta: Meta<typeof LightboxCarousel> = {
  title: 'AI/Lightbox',
  component: LightboxCarousel,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type Story = StoryObj<typeof LightboxCarousel>;

// TODO: how to style the images so they all have the same aspect ratio, should probably be built in. Look at how Cards handles it?
const imageStyles = style({
  display: 'block',
  width: 'full'
  // aspectRatio: '4/3',
  // objectFit: 'contain'
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

function AttachmentDialogExample() {

  return (
    <LightboxTrigger>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 16, width: 400})}>
        <AttachmentList aria-label="Attachments">
          <Attachment id="amsterdam" textValue="photo.png">
            <AttachmentPreview
              mimeType="image/jpg"
              slot="thumbnail"
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/amsterdamslide__800x600.jpg"
            />
          </Attachment>
          <Attachment id="lands-end" textValue="report.pdf">
            <AttachmentPreview 
              mimeType="image/jpg" 
              slot="thumbnail"
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/lands-endslide__800x600.jpg" />
          </Attachment>
        </AttachmentList>
        
      </div>
      <LightboxCarousel isInfinite>
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
          {/* <LightboxItem id="trust">
            <img
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/trustslide-2__800x600.jpg"
              alt="Trust television series promotion"
              className={imageStyles}
            />
          </LightboxItem> */}
        </LightboxItems>
      </LightboxCarousel>
    </LightboxTrigger>
  );
}

export const AttachmentDialog: Story = {
  render: () => <AttachmentDialogExample />
};
