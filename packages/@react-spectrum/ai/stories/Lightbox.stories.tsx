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
import {AttachmentGrid, AttachmentGridItem} from '../src/AttachmentGrid';
import {Content} from '@react-spectrum/s2/Content';
import {Image} from '@react-spectrum/s2/Image';
import {
  LightboxCarousel,
  LightboxItem,
  LightboxItems,
  LightboxPicker,
  LightboxPickerItem
} from '../src/Lightbox';
import {LightboxTrigger} from '../src/LightboxTrigger';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';

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
      className={style({
        width: 600,
        height: 400,
        maxWidth: 'full',
        marginX: 'auto',
        maxHeight: 'calc(100dvh - 32px)',
        minWidth: 0,
        minHeight: 0
      })}>
      <LightboxCarousel {...args} aria-label="Photos">
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
          <LightboxPickerItem id="foyles-war" aria-label="Foyle's War">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/foyleswarslide__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
          <LightboxPickerItem id="great-britain-vote" aria-label="Great Britain Vote">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/britcomdavidslide__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
          <LightboxPickerItem id="mid-american-gardener" aria-label="Mid-American Gardener">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/mag800-2__800x600.jpg"
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
          <LightboxItem id="foyles-war">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/foyleswarslide__800x600.jpg"
              alt="A man in a suit and fedora and a woman with coiffed hair look sternly into the camera."
            />
          </LightboxItem>
          <LightboxItem id="great-britain-vote">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/britcomdavidslide__800x600.jpg"
              alt="British flag with WILL-TV host David Thiel."
            />
          </LightboxItem>
          <LightboxItem id="mid-american-gardener">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/mag800-2__800x600.jpg"
              alt="Mid-American Gardener panelists on the set"
            />
          </LightboxItem>
        </LightboxItems>
      </LightboxCarousel>
    </div>
  )
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
          <Attachment id="foyles-war" textValue="foyles-war.jpg">
            <AttachmentPreview
              mimeType="image/jpg"
              slot="thumbnail"
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/foyleswarslide__800x600.jpg"
            />
          </Attachment>
          <Attachment id="great-britain-vote" textValue="great-britain-vote.jpg">
            <AttachmentPreview
              mimeType="image/jpg"
              slot="thumbnail"
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/britcomdavidslide__800x600.jpg"
            />
          </Attachment>
          <Attachment id="mid-american-gardener" textValue="mid-american-gardener.jpg">
            <AttachmentPreview
              mimeType="image/jpg"
              slot="thumbnail"
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/mag800-2__800x600.jpg"
            />
          </Attachment>
        </AttachmentList>
      </div>
      <LightboxCarousel>
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
          <LightboxPickerItem id="foyles-war" aria-label="Foyle's War">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/foyleswarslide__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
          <LightboxPickerItem id="great-britain-vote" aria-label="Great Britain Vote">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/britcomdavidslide__800x600.jpg"
              alt=""
            />
          </LightboxPickerItem>
          <LightboxPickerItem id="mid-american-gardener" aria-label="Mid-American Gardener">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/mag800-2__800x600.jpg"
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
          <LightboxItem id="foyles-war">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/foyleswarslide__800x600.jpg"
              alt="A man in a suit and fedora and a woman with coiffed hair look sternly into the camera."
            />
          </LightboxItem>
          <LightboxItem id="great-britain-vote">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/britcomdavidslide__800x600.jpg"
              alt="British flag with WILL-TV host David Thiel."
            />
          </LightboxItem>
          <LightboxItem id="mid-american-gardener">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/mag800-2__800x600.jpg"
              alt="Mid-American Gardener panelists on the set"
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

function AttachmentGridDialogExample({showCardContent}: {showCardContent: boolean}) {
  let attachments = [
    {
      id: 'amsterdam',
      name: 'Amsterdam',
      src: 'https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/amsterdamslide__800x600.jpg',
      alt: 'Amsterdam canal'
    },
    {
      id: 'lands-end',
      name: "Land's End",
      src: 'https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/lands-endslide__800x600.jpg',
      alt: "Land's End coastal landscape"
    },
    {
      id: 'trust',
      name: 'Trust',
      src: 'https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/trustslide-2__800x600.jpg',
      alt: 'Trust television series promotion'
    },
    {
      id: 'foyles-war',
      name: "Foyle's War",
      src: 'https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/foyleswarslide__800x600.jpg',
      alt: 'A man in a suit and fedora and a woman with coiffed hair'
    },
    {
      id: 'great-britain-vote',
      name: 'Great Britain Vote',
      src: 'https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/britcomdavidslide__800x600.jpg',
      alt: 'British flag with WILL-TV host David Thiel'
    },
    {
      id: 'mid-american-gardener',
      name: 'Mid-American Gardener',
      src: 'https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/mag800-2__800x600.jpg',
      alt: 'Mid-American Gardener panelists on the set'
    }
  ];

  return (
    <LightboxTrigger>
      <AttachmentGrid
        aria-label="Attachments"
        items={attachments}
        dependencies={[showCardContent]}
        styles={style({width: 300})}>
        {attachment => (
          <AttachmentGridItem id={attachment.id} textValue={attachment.name}>
            <AttachmentPreview mimeType="image/jpeg" slot="thumbnail" src={attachment.src} />
            {showCardContent && (
              <Content>
                <Text slot="title">{attachment.name}</Text>
                <Text slot="description">JPEG image</Text>
              </Content>
            )}
          </AttachmentGridItem>
        )}
      </AttachmentGrid>
      <LightboxCarousel>
        <LightboxPicker aria-label="Choose photo" items={attachments}>
          {attachment => (
            <LightboxPickerItem id={attachment.id} aria-label={attachment.name}>
              <Image src={attachment.src} alt="" />
            </LightboxPickerItem>
          )}
        </LightboxPicker>
        <LightboxItems>
          {attachments.map(attachment => (
            <LightboxItem key={attachment.id} id={attachment.id}>
              <Image src={attachment.src} alt={attachment.alt} />
            </LightboxItem>
          ))}
        </LightboxItems>
      </LightboxCarousel>
    </LightboxTrigger>
  );
}

export const AttachmentGridDialog: StoryObj<typeof AttachmentGridDialogExample> = {
  render: args => <AttachmentGridDialogExample {...args} />,
  args: {
    showCardContent: false
  },
  argTypes: {
    showCardContent: {control: 'boolean'}
  }
};

export const SingleItemDialog: Story = {
  render: () => (
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
        </AttachmentList>
      </div>
      <LightboxCarousel>
        <LightboxPicker aria-label="Choose photo">
          <LightboxPickerItem id="amsterdam" aria-label="Amsterdam">
            <Image
              src="https://www.w3.org/WAI/content-images/wai-aria-practices/patterns/carousel/examples/images/amsterdamslide__800x600.jpg"
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
        </LightboxItems>
      </LightboxCarousel>
    </LightboxTrigger>
  )
};
