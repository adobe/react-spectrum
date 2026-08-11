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

import {Attachment as AttachmentComponent, AttachmentList} from '../src/AttachmentList';
import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import {Content} from '@react-spectrum/s2/Content';
import FileTextIllustration from '../../s2/spectrum-illustrations/gradient/generic1/FileText';
import FileVideo from '@react-spectrum/s2/illustrations/gradient/generic1/FileVideo';
import FileZip from '@react-spectrum/s2/illustrations/gradient/generic1/FileZip';
import {Image} from '@react-spectrum/s2/Image';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';

const events = ['onRemove'];

const meta: Meta<typeof AttachmentList> = {
  component: AttachmentList,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}},
    isInvalid: {control: 'boolean'},
    uploadProgress: {control: 'number', min: 0, max: 100},
    size: {
      control: 'radio',
      options: ['XS', 'S', 'M', 'L', 'XL']
    }
  },
  args: {isInvalid: false, size: 'M', ...getActionArgs(events)},
  title: 'AI/AttachmentList'
};

export default meta;

type Story = StoryObj<typeof AttachmentList>;

function AttachmentListRender(args) {
  let {isInvalid, size, uploadProgress, ...listArgs} = args;
  return (
    <AttachmentList {...listArgs} styles={style({width: 500})}>
      <AttachmentComponent
        uploadProgress={uploadProgress}
        isInvalid={isInvalid}
        size={size}
        aria-label="Demo file.pdf">
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
      </AttachmentComponent>
      <AttachmentComponent
        uploadProgress={uploadProgress}
        isInvalid={isInvalid}
        size={size}
        aria-label="Alligator.pdf">
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
      </AttachmentComponent>
      <AttachmentComponent
        uploadProgress={uploadProgress}
        isInvalid={isInvalid}
        size={size}
        aria-label="Rules.pdf">
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
      </AttachmentComponent>
      <AttachmentComponent
        uploadProgress={uploadProgress}
        isInvalid={isInvalid}
        size={size}
        aria-label="Echidna.pdf">
        <Image
          slot="thumbnail"
          src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
        />
        <Content>
          <Text slot="title">Card title</Text>
          <Text slot="description">Card description.</Text>
        </Content>
      </AttachmentComponent>
    </AttachmentList>
  );
}

export const AIAttachmentList: Story = {
  render: args => <AttachmentListRender {...args} />
};

function NonImageAttachmentListRender(args) {
  let {isInvalid, size, uploadProgress, ...listArgs} = args;
  return (
    <AttachmentList {...listArgs} styles={style({width: 500})}>
      <AttachmentComponent
        uploadProgress={uploadProgress}
        isInvalid={isInvalid}
        size={size}
        aria-label="report.pdf">
        <FileTextIllustration slot="thumbnail" />
      </AttachmentComponent>
      <AttachmentComponent
        uploadProgress={uploadProgress}
        isInvalid={isInvalid}
        size={size}
        aria-label="notes.txt">
        <FileTextIllustration slot="thumbnail" />
        <Content>
          <Text slot="title">notes.txt</Text>
          <Text slot="description">Plain text document</Text>
        </Content>
      </AttachmentComponent>
      <AttachmentComponent
        uploadProgress={uploadProgress}
        isInvalid={isInvalid}
        size={size}
        aria-label="data.csv">
        <FileTextIllustration slot="thumbnail" />
        <Content>
          <Text slot="title">data.csv</Text>
        </Content>
      </AttachmentComponent>
    </AttachmentList>
  );
}

export const NonImageAttachments: Story = {
  render: args => <NonImageAttachmentListRender {...args} />
};

export const LongContents: Story = {
  name: 'Long contents',
  render: (args: any) => (
    <AttachmentList>
      <AttachmentComponent
        size={args.size}
        styles={style({maxWidth: 300})}
        aria-label="Very long file name that exceeds the container width.pdf">
        <Image
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

function MixedAttachments(args) {
  let {isInvalid, size, uploadProgress, ...listArgs} = args;

  return (
    <div className={style({flexDirection: 'column', display: 'flex', gap: 16})}>
      <AttachmentList {...listArgs}>
        <AttachmentComponent
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label="banner.png">
          <Image
            slot="thumbnail"
            src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
          />
        </AttachmentComponent>
        <AttachmentComponent
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label="notes.tsx">
          <FileTextIllustration slot="thumbnail" />
        </AttachmentComponent>
        <AttachmentComponent
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label="video.mp4">
          <FileVideo slot="thumbnail" />
        </AttachmentComponent>
        <AttachmentComponent
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label="debug.zip">
          <FileZip slot="thumbnail" />
        </AttachmentComponent>
      </AttachmentList>
      <AttachmentList {...listArgs}>
        <AttachmentComponent
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label="banner.png">
          <Image
            slot="thumbnail"
            src={new URL('../../s2/stories/assets/placeholder.png', import.meta.url).toString()}
          />
          <Content>
            <Text slot="title">banner.png</Text>
            <Text slot="description">PNG image</Text>
          </Content>
        </AttachmentComponent>
        <AttachmentComponent
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label="notes.txt">
          <FileTextIllustration slot="thumbnail" />
          <Content>
            <Text slot="title">notes.txt</Text>
            <Text slot="description">Plain text</Text>
          </Content>
        </AttachmentComponent>
        <AttachmentComponent
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label="video.mp4">
          <FileVideo slot="thumbnail" />
          <Content>
            <Text slot="title">video.mp4</Text>
            <Text slot="description">MP4</Text>
          </Content>
        </AttachmentComponent>
        <AttachmentComponent
          uploadProgress={uploadProgress}
          isInvalid={isInvalid}
          size={size}
          aria-label="debug.zip">
          <FileZip slot="thumbnail" />
          <Content>
            <Text slot="title">debug.zip</Text>
            <Text slot="description">ZIP</Text>
          </Content>
        </AttachmentComponent>
      </AttachmentList>
    </div>
  );
}

export const Mixed: Story = {
  name: 'Mixed attachements',
  render: args => <MixedAttachments {...args} />
};
