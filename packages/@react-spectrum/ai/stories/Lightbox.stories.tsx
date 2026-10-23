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
import {Image} from '@react-spectrum/s2/Image';
import {
  LightboxCarousel,
  LightboxItem,
  LightboxItems,
  LightboxPicker,
  LightboxPickerItem,
  LightboxTrigger
} from '../src/Lightbox';
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

export const Basic: Story = {
  parameters: {
    layout: 'padded'
  },
  render: args => (
    <div
      role="region"
      aria-label="Photos"
      aria-roledescription="carousel"
      className={style({
        width: 600,
        height: 400,
        maxWidth: 'full',
        marginX: 'auto',
        maxHeight: 'calc(100dvh - 32px)',
        minWidth: 0,
        minHeight: 0
      })}>
      <LightboxCarousel {...args}>
        <LightboxPicker aria-label="Choose photo">
          <LightboxPickerItem id="amsterdam" aria-label="Amsterdam">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/amsterdamslide__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
          <LightboxPickerItem id="lands-end" aria-label="Land's End">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/lands-endslide__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
          <LightboxPickerItem id="trust" aria-label="Trust">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/trustslide-2__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
        </LightboxPicker>
        <LightboxItems>
          <LightboxItem id="amsterdam">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/amsterdamslide__800x600.jpg"
              alt="Amsterdam canal"
            />
          </LightboxItem>
          <LightboxItem id="lands-end">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/lands-endslide__800x600.jpg"
              alt="Land's End coastal landscape"
            />
          </LightboxItem>
          <LightboxItem id="trust">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/trustslide-2__800x600.jpg"
              alt="Trust television series promotion"
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
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/lands-endslide__800x600.jpg"
            />
          </Attachment>
          <Attachment id="trust" textValue="report.pdf">
            <AttachmentPreview
              mimeType="image/jpg"
              slot="thumbnail"
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/trustslide-2__800x600.jpg"
            />
          </Attachment>
        </AttachmentList>
      </div>
      <LightboxCarousel isInfinite>
        <LightboxPicker aria-label="Choose photo">
          <LightboxPickerItem id="amsterdam" aria-label="Amsterdam">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/amsterdamslide__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
          <LightboxPickerItem id="lands-end" aria-label="Land's End">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/lands-endslide__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
        </LightboxPicker>
        <LightboxItems>
          <LightboxItem id="amsterdam">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/amsterdamslide__800x600.jpg"
              alt="Amsterdam canal"
            />
          </LightboxItem>
          <LightboxItem id="lands-end">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/lands-endslide__800x600.jpg"
              alt="Land's End coastal landscape"
            />
          </LightboxItem>
          <LightboxItem id="trust">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/trustslide-2__800x600.jpg"
              alt="Trust television series promotion"
            />
          </LightboxItem>
        </LightboxItems>
      </LightboxCarousel>
    </LightboxTrigger>
  );
}

export const AttachmentDialog: Story = {
  render: () => <AttachmentDialogExample />
};
