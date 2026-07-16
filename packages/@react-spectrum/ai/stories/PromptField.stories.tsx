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

import {action} from 'storybook/actions';
import {
  AttachFileMenuItem,
  AutoLinkingSegmentList,
  InsertCallbackMenuItem,
  InsertMenuButton,
  InsertTextMenuItem,
  InsertTokenMenuItem,
  PromptField,
  PromptFieldAttachment,
  PromptFieldAttachmentList,
  PromptFieldSubmitButton,
  PromptFieldToolbar,
  PromptFieldVoiceButton,
  PromptToken,
  PromptTokenField
} from '../src/PromptField';
import {TokenSegmentList} from '../src/TokenSegmentList';
import {ActionButton} from '@react-spectrum/s2/ActionButton';
import {Attachment} from '../src/AttachmentList';
import Brand from '@react-spectrum/s2/icons/Brand';
import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import {
  Collection,
  Header,
  Heading,
  Menu,
  MenuItem,
  MenuSection,
  SubmenuTrigger,
  Text
} from '@react-spectrum/s2/Menu';
import {Content} from '@react-spectrum/s2/Content';
import Data from '@react-spectrum/s2/icons/Data';
import * as data from '../src/loader/data';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Image} from '@react-spectrum/s2/Image';
import LinkIcon from '@react-spectrum/s2/icons/Link';
import type {Meta, StoryObj} from '@storybook/react';
import Plugin from '@react-spectrum/s2/icons/Plugin';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import SocialNetwork from '@react-spectrum/s2/icons/SocialNetwork';
import UserGroup from '@react-spectrum/s2/icons/UserGroup';
import {useState} from 'react';

const events = ['onSubmit', 'onStop', 'onAddAttachments', 'onRemoveAttachments'];

const meta: Meta<typeof PromptField> = {
  component: PromptField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}},
    brand: {
      control: 'color',
      description:
        'Sets the --brand custom property to retheme the PromptField. Only the hue is used; lightness and chroma come from the design tokens.',
      table: {category: 'Theming'}
    },
    pixelLoader: {
      control: 'select',
      options: Object.keys(data),
      description: 'Sets the icon to use for the pixel loader.',
      table: {category: 'Theming'}
    },
    attachmentVariant: {
      control: 'radio',
      options: ['thumbnail', 'card']
    },
    attachmentInvalid: {
      control: 'boolean',
      description: 'Sets attachments to an invalid state.'
    },
    placeholder: {
      control: 'text',
      table: {category: 'PromptTokenField'}
    }
  },
  args: {
    brand: 'rgb(236, 105, 255)',
    pixelLoader: 'aiLogo',
    attachmentVariant: 'thumbnail',
    attachmentInvalid: false,
    placeholder: undefined,
    ...getActionArgs(events)
  },
  title: 'AI/PromptField',
  decorators: [
    (Story, {args}) => (
      <div
        style={{
          width: '800px',
          maxWidth: '90vw',
          margin: '0 auto',
          // @ts-ignore
          '--brand': args.brand
        }}>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof PromptField>;

const slashCommands = [
  {
    command: '/audience-explainer',
    type: 'skill',
    description: 'Explain an AEP audience in english'
  },
  {command: '/btw', type: 'command', description: 'Ask a side question'},
  {command: '/clear', type: 'command', description: 'Clear the context'},
  {command: '/compact', type: 'command', description: 'Summarize conversation history'},
  {command: '/dataset-usage', type: 'skill', description: 'Explain how to use a dataset'},
  {command: '/feedback', type: 'command', description: 'Submit feedback'},
  {command: '/plan', type: 'command', description: 'Create a plan before executing'},
  {command: '/visual-artifact', type: 'skill', description: 'Generate a chart or graph'}
];

const icons = {
  command: <Prompt styles={iconStyle({size: 'S'})} />,
  skill: <Plugin styles={iconStyle({size: 'S'})} />,
  audience: <UserGroup styles={iconStyle({size: 'S'})} />,
  campaign: <Brand styles={iconStyle({size: 'S'})} />,
  journey: <SocialNetwork styles={iconStyle({size: 'S'})} />,
  url: <LinkIcon styles={iconStyle({size: 'S'})} />
} as const;

const objects = [
  {
    section: 'Audiences',
    items: [
      {type: 'audience', title: 'New Customers'},
      {type: 'audience', title: 'Returning Customers'},
      {type: 'audience', title: 'Loyal Customers'},
      {type: 'audience', title: 'High-Value Customers'},
      {type: 'audience', title: 'Low-Value Customers'}
    ]
  },
  {
    section: 'Campaigns',
    items: [
      {type: 'campaign', title: 'Spring Launch 2026'},
      {type: 'campaign', title: 'Holiday Cheer'},
      {type: 'campaign', title: 'Back to School'},
      {type: 'campaign', title: 'Summer Adventure'},
      {type: 'campaign', title: 'Tech Trends Expo'}
    ]
  },
  {
    section: 'Journeys',
    items: [
      {type: 'journey', title: 'Welcome Flow'},
      {type: 'journey', title: 'Abandoned Cart Recovery'},
      {type: 'journey', title: 'Post-Purchase Follow-up'},
      {type: 'journey', title: 'Re-engagement Campaign'},
      {type: 'journey', title: 'Birthday Surprise Journey'}
    ]
  }
];

interface CompletionCallbacks {
  onClear?: () => void;
  onCompact?: () => void;
}

function renderCompletions(filterValue: string, callbacks?: CompletionCallbacks) {
  if (filterValue.startsWith('/')) {
    return slashCommands
      .filter(item => item.command.includes(filterValue.slice(1)))
      .map(item =>
        item.command === '/clear' ? (
          <MenuItem key={item.command} id={item.command} onAction={callbacks?.onClear}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </MenuItem>
        ) : item.command === '/compact' ? (
          <InsertCallbackMenuItem
            key={item.command}
            id={item.command}
            onAction={callbacks?.onCompact}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </InsertCallbackMenuItem>
        ) : item.command === '/feedback' || item.command === '/btw' ? (
          // coworker doesn't seem to have any text insertion commands anymore, so I added these for testing
          <InsertTextMenuItem key={item.command} id={item.command} value={item}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </InsertTextMenuItem>
        ) : (
          <InsertTokenMenuItem key={item.command} id={item.command} value={item}>
            {item.type === 'skill' ? <Plugin /> : <Prompt />}
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </InsertTokenMenuItem>
        )
      );
  } else if (filterValue.startsWith('@')) {
    return objects
      .map(section => {
        let matchingItems = section.items
          .filter(item => item.title.toLowerCase().includes(filterValue.slice(1).toLowerCase()))
          .map(item => (
            <InsertTokenMenuItem key={item.title} id={item.title} value={item}>
              {item.title}
            </InsertTokenMenuItem>
          ));

        if (matchingItems.length > 0) {
          return (
            <MenuSection key={section.section} id={section.section}>
              <Header>
                <Heading>{section.section}</Heading>
              </Header>
              {matchingItems}
            </MenuSection>
          );
        } else {
          return null;
        }
      })
      .filter(v => v != null);
  }
  return null;
}

interface UploadState {
  status: 'uploading' | 'completed';
  progress?: number;
}

let prompts = [
  new AutoLinkingSegmentList([
    {type: 'text', text: 'Analyze '},
    {type: 'token', text: 'New Customers', value: {type: 'audience', title: 'New Customers'}},
    {type: 'text', text: ' and suggest targeting strategies'}
  ]),
  new AutoLinkingSegmentList([
    {type: 'text', text: 'Write a brief for '},
    {
      type: 'token',
      text: 'Spring Launch 2026',
      value: {type: 'campaign', title: 'Spring Launch 2026'}
    }
  ]),
  new AutoLinkingSegmentList([
    {type: 'text', text: 'Summarize the '},
    {type: 'token', text: 'Welcome Flow', value: {type: 'journey', title: 'Welcome Flow'}},
    // TODO: note this needs a space after test.com for it to be autotokenized
    {type: 'text', text: ' journey performance from test.com '}
  ])
];

function EverythingRender(args) {
  let {placeholder, ...otherArgs} = args;
  let [value, setValue] = useState<TokenSegmentList>(() => new AutoLinkingSegmentList([]));
  let [attachments, setAttachments] = useState<PromptFieldAttachment[]>([]);
  let [attachmentState, setAttachmentState] = useState<Map<string, UploadState>>(new Map());

  let mockUpload = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
    setAttachmentState(prev => {
      let item = prev.get(id);
      if (!item || item.status === 'completed') {
        return prev;
      }
      let newState = new Map(prev);
      let progress = (item.progress ?? 0) + 1;
      if (progress >= 100) {
        newState.set(id, {status: 'completed'});
      } else {
        newState.set(id, {status: 'uploading', progress});
        mockUpload(id);
      }
      return newState;
    });
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
        {prompts.map((prompt, i) => (
          <ActionButton key={i} onPress={() => setValue(prompt)}>
            {prompt.toString()}
          </ActionButton>
        ))}
      </div>
      <PromptField
        {...otherArgs}
        value={value}
        onChange={setValue}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        onSubmit={prompt => {
          action('onSubmit')(prompt.toString());
          setValue(new AutoLinkingSegmentList([]));
          setAttachments([]);
          setAttachmentState(new Map());
        }}
        acceptedAttachmentTypes={['image/*']}
        onAddAttachments={newAttachments => {
          setAttachmentState(prev => {
            let newState = new Map(prev);
            newAttachments.forEach(attachment => {
              newState.set(attachment.id, {status: 'uploading', progress: 0});
              mockUpload(attachment.id);
            });
            return newState;
          });
        }}
        onRemoveAttachments={removedAttachments => {
          setAttachmentState(prev => {
            let newState = new Map(prev);
            removedAttachments.forEach(attachment => {
              newState.delete(attachment.id);
            });
            return newState;
          });
        }}>
        <PromptFieldAttachmentList
          dependencies={[attachmentState, args.attachmentVariant, args.attachmentInvalid]}>
          {attachment => {
            let state = attachmentState.get(attachment.id);
            return (
              <Attachment
                isInvalid={args.attachmentInvalid}
                uploadProgress={state?.status === 'uploading' ? state?.progress : undefined}>
                {/* TODO: what about non-image attachments? */}
                {attachment.image && <Image src={attachment.image} slot="thumbnail" />}
                {args.attachmentVariant === 'card' && (
                  <Content>
                    <Text slot="title">{attachment.file.name}</Text>
                    <Text slot="description">{attachment.file.type}</Text>
                  </Content>
                )}
              </Attachment>
            );
          }}
        </PromptFieldAttachmentList>
        <PromptTokenField
          completionTrigger={/(?<=^|\s)[@/]/}
          renderCompletions={filterValue =>
            renderCompletions(filterValue, {
              onClear: () => {
                setValue(new AutoLinkingSegmentList([]));
                setAttachments([]);
              },
              onCompact: action('onCompact')
            })
          }
          pixelLoader={data[args.pixelLoader]}
          placeholder={placeholder}>
          {segment => (
            <PromptToken>
              {icons[segment.value?.type]}
              {segment.text}
            </PromptToken>
          )}
        </PromptTokenField>
        <PromptFieldToolbar>
          <InsertMenuButton>
            <AttachFileMenuItem />
            <SubmenuTrigger>
              <MenuItem>
                <Prompt />
                <Text>Commands</Text>
              </MenuItem>
              <Menu items={slashCommands.filter(item => item.type === 'command')}>
                {item =>
                  item.command === '/clear' ? (
                    <MenuItem
                      id={item.command}
                      onAction={() => {
                        setValue(new AutoLinkingSegmentList([]));
                        setAttachments([]);
                      }}>
                      <Text slot="label">{item.command}</Text>
                      <Text slot="description">{item.description}</Text>
                    </MenuItem>
                  ) : item.command === '/compact' ? (
                    // TODO: technically can be a standard menu item since triggering this action
                    // from the + menu means no partial text to clear, but maybe we can just standardize
                    // InsertCallbackMenuItem as the "basic" menu item for prompt field
                    <MenuItem id={item.command} onAction={action('onCompact')}>
                      <Text slot="label">{item.command}</Text>
                      <Text slot="description">{item.description}</Text>
                    </MenuItem>
                  ) : item.command === '/feedback' || item.command === '/btw' ? (
                    <InsertTextMenuItem id={item.command} value={item}>
                      <Text slot="label">{item.command}</Text>
                      <Text slot="description">{item.description}</Text>
                    </InsertTextMenuItem>
                  ) : (
                    <InsertTokenMenuItem id={item.command} value={item}>
                      <Text slot="label">{item.command}</Text>
                      <Text slot="description">{item.description}</Text>
                    </InsertTokenMenuItem>
                  )
                }
              </Menu>
            </SubmenuTrigger>
            <SubmenuTrigger>
              <MenuItem>
                <Plugin />
                <Text>Skills</Text>
              </MenuItem>
              <Menu items={slashCommands.filter(item => item.type === 'skill')}>
                {item => (
                  <InsertTokenMenuItem id={item.command} value={item}>
                    <Text slot="label">{item.command}</Text>
                    <Text slot="description">{item.description}</Text>
                  </InsertTokenMenuItem>
                )}
              </Menu>
            </SubmenuTrigger>
            <SubmenuTrigger>
              <MenuItem>
                <Data />
                <Text>Reference an object</Text>
              </MenuItem>
              <Menu items={objects}>
                {item => (
                  <MenuSection>
                    <Header>
                      <Heading>{item.section}</Heading>
                    </Header>
                    <Collection items={item.items}>
                      {item => (
                        <InsertTokenMenuItem id={item.title}>{item.title}</InsertTokenMenuItem>
                      )}
                    </Collection>
                  </MenuSection>
                )}
              </Menu>
            </SubmenuTrigger>
          </InsertMenuButton>
          {/* TODO is this kind of styling expected from the user? Or should we have a slot that places the mic button next to the submit button? */}
          <div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
            <PromptFieldVoiceButton />
            <PromptFieldSubmitButton />
          </div>
        </PromptFieldToolbar>
      </PromptField>
    </div>
  );
}

export const Everything: Story = {
  render: args => <EverythingRender {...args} />
};

function BasicRender({placeholder, ...args}: any) {
  return (
    <PromptField {...args}>
      <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
        <PromptTokenField placeholder={placeholder} />
        <PromptFieldSubmitButton />
      </div>
    </PromptField>
  );
}

export const Basic: Story = {
  render: args => <BasicRender {...args} />
};

export const AsyncCompletions = () => (
  <PromptField>
    <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
      <PromptTokenField
        completionTrigger={/(?<=^|\s)[@/]/}
        renderCompletions={async filterValue => {
          await new Promise(resolve => setTimeout(resolve, 500));
          return renderCompletions(filterValue);
        }}>
        {segment => (
          <PromptToken>
            {icons[segment.value?.type]}
            {segment.text}
          </PromptToken>
        )}
      </PromptTokenField>
      <PromptFieldSubmitButton />
    </div>
  </PromptField>
);
