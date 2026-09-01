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
  CommandMenuItem,
  InsertMenuButton,
  InsertTextMenuItem,
  InsertTokenMenuItem,
  PromptField,
  PromptFieldAttachment,
  PromptFieldAttachmentList,
  PromptFieldSubmitButton,
  PromptFieldTokenValue,
  PromptFieldToolbar,
  PromptFieldValue,
  PromptFieldVoiceButton,
  PromptToken,
  PromptTokenField
} from '../src/PromptField';
import {Attachment, AttachmentPreview} from '../src/AttachmentList';
import Brand from '@react-spectrum/s2/icons/Brand';
import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
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
import type {FocusableRefValue} from '@react-types/shared';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import LinkIcon from '@react-spectrum/s2/icons/Link';
import {MessageSuggestion, MessageSuggestionList} from '../src/MessageSuggestion';
import type {Meta, StoryObj} from '@storybook/react';
import Plugin from '@react-spectrum/s2/icons/Plugin';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import SocialNetwork from '@react-spectrum/s2/icons/SocialNetwork';
import {TokenFieldValue} from 'react-aria-components';
import {TokenSegment} from 'react-stately';
import {useRef, useState} from 'react';
import UserGroup from '@react-spectrum/s2/icons/UserGroup';

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
    brandColor: {
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
    },
    menuWidth: {
      control: 'number',
      table: {category: 'PromptTokenField'}
    }
  },
  args: {
    brandColor: 'rgb(236, 105, 255)',
    pixelLoader: 'aiLogo',
    attachmentVariant: 'thumbnail',
    attachmentInvalid: false,
    placeholder: undefined,
    menuWidth: undefined,
    ...getActionArgs(events)
  },
  title: 'AI/PromptField',
  decorators: [
    (Story, {args}) => (
      <div
        style={{
          width: args.size === 'S' ? '300px' : '800px',
          maxWidth: '90vw',
          margin: '0 auto'
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
    kind: 'skill',
    description: 'Explain an AEP audience in english'
  },
  {command: '/btw', kind: 'command', description: 'Ask a side question'},
  {command: '/clear', kind: 'command', description: 'Clear the context'},
  {command: '/compact', kind: 'command', description: 'Summarize conversation history'},
  {command: '/dataset-usage', kind: 'skill', description: 'Explain how to use a dataset'},
  {command: '/feedback', kind: 'command', description: 'Submit feedback'},
  {command: '/plan', kind: 'command', description: 'Create a plan before executing'},
  {command: '/visual-artifact', kind: 'skill', description: 'Generate a chart or graph'}
];

const icons = {
  command: <Prompt styles={iconStyle({size: 'XS'})} />,
  skill: <Plugin styles={iconStyle({size: 'XS'})} />,
  audience: <UserGroup styles={iconStyle({size: 'XS'})} />,
  campaign: <Brand styles={iconStyle({size: 'XS'})} />,
  journey: <SocialNetwork styles={iconStyle({size: 'XS'})} />,
  url: <LinkIcon styles={iconStyle({size: 'XS'})} />
} as const;

function getIcon(token: TokenSegment<PromptFieldTokenValue>) {
  switch (token.value?.type) {
    case 'placeholder':
      return token.value.placeholderType === 'token' && token.value.valueType
        ? icons[token.value.valueType]
        : null;
    case 'url':
      return icons.url;
    case 'custom':
      return icons[token.value.valueType];
  }
}

const objects = [
  {
    section: 'Audiences',
    type: 'audience',
    items: [
      {kind: 'audience', title: 'New Customers'},
      {kind: 'audience', title: 'Returning Customers'},
      {kind: 'audience', title: 'Loyal Customers'},
      {kind: 'audience', title: 'High-Value Customers'},
      {kind: 'audience', title: 'Low-Value Customers'}
    ]
  },
  {
    section: 'Campaigns',
    type: 'campaign',
    items: [
      {kind: 'campaign', title: 'Spring Launch 2026'},
      {kind: 'campaign', title: 'Holiday Cheer'},
      {kind: 'campaign', title: 'Back to School'},
      {kind: 'campaign', title: 'Summer Adventure'},
      {kind: 'campaign', title: 'Tech Trends Expo'}
    ]
  },
  {
    section: 'Journeys',
    type: 'journey',
    items: [
      {kind: 'journey', title: 'Welcome Flow'},
      {kind: 'journey', title: 'Abandoned Cart Recovery'},
      {kind: 'journey', title: 'Post-Purchase Follow-up'},
      {kind: 'journey', title: 'Re-engagement Campaign'},
      {kind: 'journey', title: 'Birthday Surprise Journey'}
    ]
  }
];

interface CompletionCallbacks {
  valueType?: string | null;
  onClear?: () => void;
  onCompact?: () => void;
}

function renderCompletions(filterValue: string, callbacks?: CompletionCallbacks) {
  if (filterValue.startsWith('/')) {
    return slashCommands
      .filter(
        item =>
          item.command.includes(filterValue.slice(1)) &&
          (callbacks?.valueType ? item.kind === callbacks.valueType : true)
      )
      .map(item =>
        item.command === '/clear' ? (
          <MenuItem key={item.command} id={item.command} onAction={callbacks?.onClear}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </MenuItem>
        ) : item.command === '/compact' ? (
          <CommandMenuItem key={item.command} id={item.command} onAction={callbacks?.onCompact}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </CommandMenuItem>
        ) : item.command === '/feedback' || item.command === '/btw' ? (
          // coworker doesn't seem to have any text insertion commands anymore, so I added these for testing
          <InsertTextMenuItem key={item.command} id={item.command} text={item.command}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </InsertTextMenuItem>
        ) : (
          <InsertTokenMenuItem
            key={item.command}
            id={item.command}
            token={{
              type: 'token',
              text: item.command,
              value: {type: 'custom', anchor: '/', valueType: item.kind, data: item}
            }}>
            {item.kind === 'skill' ? <Plugin /> : <Prompt />}
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </InsertTokenMenuItem>
        )
      );
  } else if (filterValue.startsWith('@')) {
    return objects
      .filter(section => (callbacks?.valueType ? section.type === callbacks.valueType : true))
      .map(section => {
        let matchingItems = section.items
          .filter(item => item.title.toLowerCase().includes(filterValue.slice(1).toLowerCase()))
          .map(item => (
            <InsertTokenMenuItem
              key={item.title}
              id={item.title}
              token={{
                type: 'token',
                text: item.title,
                value: {type: 'custom', anchor: '@', valueType: item.kind, data: item}
              }}>
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

function atEnd(v: PromptFieldValue) {
  let segs = v.segments;
  return {index: segs.length - 1, offset: segs[segs.length - 1].text.length};
}

let prompt1 = new PromptFieldValue([
  {type: 'text', text: 'Analyze '},
  {
    type: 'token',
    text: 'New Customers',
    value: {type: 'custom', anchor: '@', valueType: 'audience', data: {title: 'New Customers'}}
  },
  {type: 'text', text: ' and suggest targeting strategies'}
]);

let prompt2 = new PromptFieldValue([
  {type: 'text', text: 'Write a brief for '},
  {
    type: 'token',
    text: 'Spring Launch 2026',
    value: {type: 'custom', anchor: '@', valueType: 'campaign', data: {title: 'Spring Launch 2026'}}
  }
]);

let prompt3Base = new PromptFieldValue([
  {type: 'text', text: 'Summarize the '},
  {
    type: 'token',
    text: 'Welcome Flow',
    value: {type: 'custom', anchor: '@', valueType: 'journey', data: {title: 'Welcome Flow'}}
  }
]);

let prompt4 = new PromptFieldValue(
  [
    {type: 'text', text: 'Detect audiences in '},
    {
      type: 'token',
      text: 'Journey',
      value: {type: 'placeholder', placeholderType: 'token', anchor: '@', valueType: 'journey'}
    },
    {type: 'text', text: ' that changed significantly in the past '},
    {type: 'token', text: 'date', value: {type: 'placeholder', placeholderType: 'text'}}
  ]
  // {selectedRange: new TokenFieldValue.SelectedRange({index: 1, offset: 0}, {index: 1, offset: 1})}
);

let prompts = [
  prompt1.withSelectedRange(new PromptFieldValue.SelectedRange(atEnd(prompt1))),
  prompt2.withSelectedRange(new PromptFieldValue.SelectedRange(atEnd(prompt2))),
  prompt3Base.replaceRange(
    atEnd(prompt3Base),
    atEnd(prompt3Base),
    ' journey performance from test.com '
  ),
  prompt4
];

function EverythingRender(args) {
  let {placeholder, menuWidth, ...otherArgs} = args;
  let [value, setValue] = useState<TokenFieldValue>(() => new PromptFieldValue([]));
  let promptFieldRef = useRef<FocusableRefValue<HTMLDivElement>>(null);
  let [attachments, setAttachments] = useState<PromptFieldAttachment[]>([]);
  let [attachmentState, setAttachmentState] = useState<Map<string, UploadState>>(new Map());
  let historyRef = useRef<TokenFieldValue[]>([]);
  let historyIndexRef = useRef(-1);
  let isHistoryNavigating = useRef(false);

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

  let handleChange = (newValue: TokenFieldValue) => {
    if (!isHistoryNavigating.current) {
      // if user edits the field, then we want to reset the index so up arrow starts from latest prompt again
      historyIndexRef.current = -1;
    }
    isHistoryNavigating.current = false;
    setValue(newValue);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
      <MessageSuggestionList title="Suggestions">
        {prompts.map((prompt, i) => (
          <MessageSuggestion
            key={i}
            onPress={() => {
              setValue(prompt);
              promptFieldRef.current?.focus();
            }}>
            {prompt.segments.map((s, i) =>
              s.type === 'token' ? (
                <span
                  key={i}
                  className={style({
                    outlineStyle: {
                      default: 'solid',
                      isPlaceholder: 'dashed'
                    },
                    outlineWidth: 1,
                    outlineColor: {
                      default: 'transparent-overlay-1000/20',
                      isPlaceholder: 'transparent-overlay-1000/40'
                    },
                    outlineOffset: -1,
                    borderRadius: 'pill',
                    paddingX: 8,
                    paddingY: 0,
                    fontSize: 'ui',
                    display: 'inline-flex',
                    alignItems: 'baseline',
                    gap: 4,
                    verticalAlign: 'baseline'
                  })({isPlaceholder: s.value?.type === 'placeholder'})}>
                  {getIcon(s) && <CenterBaseline>{getIcon(s)}</CenterBaseline>}
                  {s.text}
                </span>
              ) : (
                s.text
              )
            )}
          </MessageSuggestion>
        ))}
      </MessageSuggestionList>
      <PromptField
        {...otherArgs}
        ref={promptFieldRef}
        value={value}
        onChange={handleChange}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        onSubmit={prompt => {
          action('onSubmit')(prompt.toString());
          historyRef.current = [...historyRef.current, prompt];
          historyIndexRef.current = -1;
          setValue(new PromptFieldValue([]));
          setAttachments([]);
          setAttachmentState(new Map());
        }}
        acceptedAttachmentTypes={['*/*']}
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
                <AttachmentPreview mimeType={attachment.file.type} src={attachment.image} />
                {args.attachmentVariant === 'card' && (
                  <Content>
                    <Text slot="title">{attachment.file.name}</Text>
                    <Text slot="description">
                      {attachment.file.type.split('/').pop()?.toUpperCase()}
                    </Text>
                  </Content>
                )}
              </Attachment>
            );
          }}
        </PromptFieldAttachmentList>
        <PromptTokenField
          completionTrigger={/(?<=^|\s)[@/]/}
          renderCompletions={(filterValue, valueType) => {
            return renderCompletions(filterValue, {
              valueType,
              onClear: () => {
                setValue(new PromptFieldValue([]));
                setAttachments([]);
              },
              onCompact: action('onCompact')
            });
          }}
          pixelLoader={data[args.pixelLoader]}
          shouldAnimatePixelLoader
          placeholder={placeholder}
          menuWidth={menuWidth}>
          {token => (
            <PromptToken token={token}>
              {getIcon(token)}
              {token.text}
            </PromptToken>
          )}
        </PromptTokenField>
        <PromptFieldToolbar>
          <div className={style({display: 'flex', gap: 8, alignItems: 'center'})}>
            <InsertMenuButton>
              <AttachFileMenuItem />
              <SubmenuTrigger>
                <MenuItem>
                  <Prompt />
                  <Text>Commands</Text>
                </MenuItem>
                <Menu items={slashCommands.filter(item => item.kind === 'command')}>
                  {item =>
                    item.command === '/clear' ? (
                      <MenuItem
                        id={item.command}
                        onAction={() => {
                          setValue(new PromptFieldValue([]));
                          setAttachments([]);
                        }}>
                        <Text slot="label">{item.command}</Text>
                        <Text slot="description">{item.description}</Text>
                      </MenuItem>
                    ) : item.command === '/compact' ? (
                      <MenuItem id={item.command} onAction={action('onCompact')}>
                        <Text slot="label">{item.command}</Text>
                        <Text slot="description">{item.description}</Text>
                      </MenuItem>
                    ) : item.command === '/feedback' || item.command === '/btw' ? (
                      <InsertTextMenuItem id={item.command} text={item.command}>
                        <Text slot="label">{item.command}</Text>
                        <Text slot="description">{item.description}</Text>
                      </InsertTextMenuItem>
                    ) : (
                      <InsertTokenMenuItem
                        id={item.command}
                        token={{
                          type: 'token',
                          text: item.command,
                          value: {type: 'custom', anchor: '/', valueType: item.kind, data: item}
                        }}>
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
                <Menu items={slashCommands.filter(item => item.kind === 'skill')}>
                  {item => (
                    <InsertTokenMenuItem
                      id={item.command}
                      token={{
                        type: 'token',
                        text: item.command,
                        value: {type: 'custom', anchor: '/', valueType: item.kind, data: item}
                      }}>
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
                          <InsertTokenMenuItem
                            id={item.title}
                            token={{
                              type: 'token',
                              text: item.title,
                              value: {type: 'custom', anchor: '@', valueType: item.kind, data: item}
                            }}>
                            {item.title}
                          </InsertTokenMenuItem>
                        )}
                      </Collection>
                    </MenuSection>
                  )}
                </Menu>
              </SubmenuTrigger>
            </InsertMenuButton>
          </div>
          {/* TODO is this kind of styling expected from the user? Or should we have a slot that places the mic button next to the submit button? */}
          <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            <PromptFieldVoiceButton onToggle={action('onToggle')} />
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
        <PromptTokenField placeholder={placeholder} shouldAnimatePixelLoader />
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
        shouldAnimatePixelLoader
        completionTrigger={/(?<=^|\s)[@/]/}
        renderCompletions={async filterValue => {
          await new Promise(resolve => setTimeout(resolve, 500));
          return renderCompletions(filterValue);
        }}>
        {token => (
          <PromptToken token={token}>
            {getIcon(token)}
            {token.text}
          </PromptToken>
        )}
      </PromptTokenField>
      <PromptFieldSubmitButton />
    </div>
  </PromptField>
);
