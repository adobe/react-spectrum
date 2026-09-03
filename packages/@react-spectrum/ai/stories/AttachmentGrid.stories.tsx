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

import {AttachmentGrid, AttachmentGridItem, AttachmentGridItemProps} from '../src/AttachmentGrid';
import {AttachmentPreview} from '../src/AttachmentList';
import {Content} from '@react-spectrum/s2/Content';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';

interface AttachmentGridDemoProps extends Pick<
  AttachmentGridItemProps,
  'isInvalid' | 'uploadProgress' | 'size'
> {
  /** Number of demo attachments to render. */
  count: number;
  /** Whether to show title/description content below the thumbnail. */
  showCardContent?: boolean;
}

function AttachmentGridDemo({
  count,
  isInvalid,
  uploadProgress,
  size,
  showCardContent
}: AttachmentGridDemoProps) {
  return (
    <AttachmentGrid aria-label="Uploaded files" styles={style({width: 'full'})}>
      {Array.from({length: count}, (_, i) => (
        <AttachmentGridItem
          key={i}
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label={`file-${i + 1}.pdf`}>
          <AttachmentPreview
            mimeType="application/pdf"
            slot="thumbnail"
            src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
          />
          {showCardContent && (
            <Content>
              <Text slot="title">{`file-${i + 1}.pdf`}</Text>
              <Text slot="description">PDF</Text>
            </Content>
          )}
        </AttachmentGridItem>
      ))}
    </AttachmentGrid>
  );
}

const meta: Meta<typeof AttachmentGridDemo> = {
  component: AttachmentGridDemo,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    count: {table: {disable: true}},
    isInvalid: {control: 'boolean'},
    uploadProgress: {control: 'number', min: 0, max: 100},
    size: {
      control: 'radio',
      options: ['XS', 'S', 'M', 'L', 'XL']
    },
    showCardContent: {control: 'boolean'}
  },
  args: {isInvalid: false, size: 'M', showCardContent: false},
  title: 'AI/AttachmentGrid'
};

export default meta;

type Story = StoryObj<typeof AttachmentGridDemo>;

export const AIAttachmentGrid: Story = {
  render: args => (
    <div style={{width: 320}}>
      <AttachmentGridDemo {...args} count={5} />
    </div>
  )
};

export const Overflow: Story = {
  name: 'Overflow (vertical scroll fade)',
  render: args => (
    <div style={{width: 320, resize: 'horizontal', overflow: 'hidden'}}>
      <AttachmentGridDemo {...args} count={20} />
    </div>
  )
};
