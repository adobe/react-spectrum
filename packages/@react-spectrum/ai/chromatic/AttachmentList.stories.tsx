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

import {
  Attachment as AttachmentComponent,
  AttachmentList,
  AttachmentPreview
} from '../src/AttachmentList';
import {Content} from '@react-spectrum/s2/Content';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';

const meta: Meta = {
  parameters: {
    chromaticProvider: {
      disableAnimations: true,
      colorSchemes: ['light', 'dark'],
      locales: ['en-US']
    }
  },
  title: 'AI Chromatic/AttachmentList'
};

export default meta;

type Story = StoryObj<typeof meta>;

export const attachmentVariants: Story = {
  render: () => (
    <div
      className={style({
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 500,
        maxWidth: '90vw'
      })}>
      <AttachmentList aria-label="Thumbnail attachments">
        <AttachmentComponent aria-label="report.pdf">
          <AttachmentPreview
            slot="thumbnail"
            mimeType="image/png"
            src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
          />
        </AttachmentComponent>
        <AttachmentComponent aria-label="notes.txt">
          <AttachmentPreview
            slot="thumbnail"
            mimeType="image/png"
            src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
          />
        </AttachmentComponent>
      </AttachmentList>
      <AttachmentList aria-label="Card attachments">
        <AttachmentComponent>
          <AttachmentPreview
            slot="thumbnail"
            mimeType="image/png"
            src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
          />
          <Content>
            <Text slot="title">Design review.pdf</Text>
            <Text slot="description">PDF document</Text>
          </Content>
        </AttachmentComponent>
        <AttachmentComponent aria-label="data.csv">
          <AttachmentPreview mimeType="text/csv" />
          <Content>
            <Text slot="title">data.csv</Text>
          </Content>
        </AttachmentComponent>
      </AttachmentList>
    </div>
  )
};

export const LongContents: Story = {
  name: 'Long contents',
  render: () => (
    <AttachmentList aria-label="Long attachment contents">
      <AttachmentComponent
        aria-label="Very long file name that exceeds the container width.pdf"
        styles={style({maxWidth: 300})}>
        <AttachmentPreview
          mimeType="application/pdf"
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
        <Content>
          <Text slot="title">Very long file name that exceeds the container width.pdf</Text>
          <Text slot="description">
            Long long long long long long long long long long description.
          </Text>
        </Content>
      </AttachmentComponent>
    </AttachmentList>
  )
};

export const MixedAttachments: Story = {
  name: 'Mixed attachments',
  render: () => (
    <div
      className={style({
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 500,
        maxWidth: '90vw'
      })}>
      <AttachmentList aria-label="Thumbnail attachments">
        <AttachmentComponent aria-label="banner.png">
          <AttachmentPreview
            slot="thumbnail"
            mimeType="image/png"
            src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
          />
        </AttachmentComponent>
        <AttachmentComponent aria-label="notes.tsx">
          <AttachmentPreview mimeType="text/typescript" />
        </AttachmentComponent>
        <AttachmentComponent aria-label="video.mp4">
          <AttachmentPreview mimeType="video/mp4" />
        </AttachmentComponent>
        <AttachmentComponent aria-label="debug.zip">
          <AttachmentPreview mimeType="application/zip" />
        </AttachmentComponent>
      </AttachmentList>
      <AttachmentList aria-label="Card attachments">
        <AttachmentComponent aria-label="banner.png">
          <AttachmentPreview
            slot="thumbnail"
            mimeType="image/png"
            src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
          />
          <Content>
            <Text slot="title">banner.png</Text>
            <Text slot="description">PNG image</Text>
          </Content>
        </AttachmentComponent>
        <AttachmentComponent aria-label="notes.txt">
          <AttachmentPreview slot="thumbnail" mimeType="text/plain" />
          <Content>
            <Text slot="title">notes.txt</Text>
            <Text slot="description">Plain text</Text>
          </Content>
        </AttachmentComponent>
        <AttachmentComponent aria-label="video.mp4">
          <AttachmentPreview slot="thumbnail" mimeType="video/mp4" />
          <Content>
            <Text slot="title">video.mp4</Text>
            <Text slot="description">MP4</Text>
          </Content>
        </AttachmentComponent>
        <AttachmentComponent aria-label="debug.zip">
          <AttachmentPreview slot="thumbnail" mimeType="application/zip" />
          <Content>
            <Text slot="title">debug.zip</Text>
            <Text slot="description">ZIP</Text>
          </Content>
        </AttachmentComponent>
      </AttachmentList>
    </div>
  )
};

export const Carousels: Story = {
  name: 'Carousels',
  render: () => (
    <div
      className={style({
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 500,
        maxWidth: '90vw'
      })}>
      <AttachmentList aria-label="Thumbnail attachment carousel">
        {Array.from({length: 8}, (_, i) => (
          <AttachmentComponent key={i} aria-label={`file-${i + 1}.pdf`}>
            <AttachmentPreview
              mimeType="application/pdf"
              slot="thumbnail"
              src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
            />
          </AttachmentComponent>
        ))}
      </AttachmentList>
      <AttachmentList aria-label="Card attachment carousel">
        {Array.from({length: 6}, (_, i) => (
          <AttachmentComponent key={i} aria-label={`Card file ${i + 1}.pdf`}>
            <AttachmentPreview
              mimeType="application/pdf"
              slot="thumbnail"
              src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
            />
            <Content>
              <Text slot="title">{`Card file ${i + 1}.pdf`}</Text>
              <Text slot="description">PDF</Text>
            </Content>
          </AttachmentComponent>
        ))}
      </AttachmentList>
    </div>
  )
};
