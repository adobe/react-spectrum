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

import {ActionButton} from '@react-spectrum/s2/ActionButton';
import {ActionMenu} from '@react-spectrum/s2/ActionMenu';
import {AssetCard, Card, CardPreview} from '@react-spectrum/s2/Card';
import {baseColor, css, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button} from '@react-spectrum/s2/Button';
import {
  ButtonContext,
  GridList,
  Group,
  isFileDropItem,
  Label,
  Tag,
  TagGroup,
  TagList,
  TextArea,
  TextField,
  useDrop
} from 'react-aria-components';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import ChevronDown from '@react-spectrum/s2/icons/ChevronDown';
import ChevronRight from '@react-spectrum/s2/icons/ArrowCurved';
import {CloseButton} from '@react-spectrum/s2/CloseButton';
import {Content} from '@react-spectrum/s2/Content';
import {
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTitle
} from '@react-spectrum/s2/Disclosure';
import {Image} from '@react-spectrum/s2/Image';
import {Link, LinkProps} from '@react-spectrum/s2/Link';
import {ListLayout} from 'react-stately/useVirtualizerState';
import {MenuItem} from '@react-spectrum/s2/Menu';
import type {Meta} from '@storybook/react';
import Plus from '@react-spectrum/s2/icons/Add';
import {ProgressCircle} from '@react-spectrum/s2/ProgressCircle';
import {ReactNode, useRef, useState} from 'react';
import Send from '@react-spectrum/s2/icons/ArrowUpSend';
import {Text} from '@react-spectrum/s2/Text';
import {Thread, ThreadItem, ThreadList, ThreadScrollButton} from '../src/Thread';
import ThumbDown from '@react-spectrum/s2/icons/ThumbDown';
import ThumbUp from '@react-spectrum/s2/icons/ThumbUp';
import {ToggleButton} from '@react-spectrum/s2/ToggleButton';
import {ToggleButtonGroup} from '@react-spectrum/s2/ToggleButtonGroup';
import {Virtualizer} from 'react-aria-components/Virtualizer';

const meta: Meta<typeof Thread> = {
  component: Thread,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'S2-AI/Thread',
  decorators: [
    Story => (
      <div style={{width: '800px', height: '700px'}}>
        <Story />
      </div>
    )
  ]
};

export default meta;

export function StaticThread() {
  // TODO: problem with this is that we are applying column reverse so tabbing into the collection brings you to the "bottom" item
  // but in the static case we would need to flip the order of the static children as well. Maybe unrealistic for a static case to be
  // used, but maybe people will do a .map?
  // the dynamic case is fine cuz we can flip the order of the items inside Thread
  return (
    <div
      className={style({
        margin: 0,
        marginX: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        height: '100%'
      })}>
      <Thread
        className={style({
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexGrow: 1
        })}>
        <ThreadList
          aria-label="Chat thread"
          className={style({
            flexGrow: 1,
            overflow: 'auto',
            padding: 8,
            rowGap: 16,
            alignItems: 'start'
          })}>
          <SystemMessage>
            <h3 className={style({font: 'title-lg'})}>What would you like to do next?</h3>
            <div className={style({display: 'flex', flexWrap: 'wrap', gap: 8})}>
              <Button variant="secondary">
                <ChevronRight />
                <Text>Create a year-over-year growth chart for the next decade</Text>
              </Button>
              <Button variant="secondary">
                <ChevronRight />
                <Text>Generate a congratulatory poster</Text>
              </Button>
              <Button variant="secondary">
                <ChevronRight />
                <Text>Summarize Development pipeline</Text>
              </Button>
            </div>
          </SystemMessage>
          <ResponseStatus status="pending" />
          <UserMessage>
            Can you help me create a 45-minute presentation, with animations, for an executive
            update?
          </UserMessage>
          <SystemMessage>
            <div role="document">
              <h3 className={style({font: 'heading-sm'})}>
                Big idea/core narrative: The warmth of welcome
              </h3>
              <p className={style({font: 'body'})}>
                Hospitality begins the moment our customers set foot off their plane. We are more
                than accommodation, and we service a diverse base. We hope to be the anchor and
                bounce board for all who stay with us.{' '}
              </p>
              <h4 className={style({font: 'heading-xs'})}>Belonging happens at Hilton</h4>
              <p className={style({font: 'body'})}>
                We strive to be familiar but exceed expectations. These assets highlight how
                belonging is personified.
              </p>
              <h4 className={style({font: 'heading-xs'})}>We are more than accommodation</h4>
              <ul className={style({font: 'body'})}>
                <li>Airport pick up service</li>
                <li>Local recommendations</li>
                <li>Everyday excursions</li>
                <li>Customizable experience</li>
              </ul>
            </div>
            <MessageFeedback />
            <Sources>
              <SourceList>
                <SourceListItem href="#">Hilton brand email — Q1 campaign 2026</SourceListItem>
                <SourceListItem href="#">Market research — hospitality trends 2025</SourceListItem>
                <SourceListItem href="#">User research — loyalty programme survey</SourceListItem>
              </SourceList>
            </Sources>
          </SystemMessage>
          <ResponseStatus
            status="complete"
            thinking="The user said make a presentation deck but didn't specify duration of deck. Assumption is a brief presentation. I should check previous Hilton executive presentation decks and extract the structure."
          />
          <UserMessage>
            Can you help me create a 45-minute presentation, with animations, for an executive
            update?
          </UserMessage>
          <SystemMessage>
            <AssetCard>
              <CardPreview>
                <Image src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
              </CardPreview>
              <Content>
                <Text slot="title">Desert Sunset</Text>
                <ActionMenu>
                  <MenuItem>Edit</MenuItem>
                  <MenuItem>Share</MenuItem>
                  <MenuItem>Delete</MenuItem>
                </ActionMenu>
                <Text slot="description">PNG • 2/3/2024</Text>
              </Content>
            </AssetCard>
          </SystemMessage>
          <UserMessage>
            Can you help me create a 45-minute presentation, with animations, for an executive
            update?
          </UserMessage>
          <UserMessage>
            <Card variant="quiet">
              <CardPreview>
                <Image src="https://react-spectrum.adobe.com/preview.c3b340d3.png" />
              </CardPreview>
              <Content>
                <Text slot="title">Hilton commercial assets</Text>
                <ActionMenu>
                  <MenuItem>Edit</MenuItem>
                  <MenuItem>Share</MenuItem>
                  <MenuItem>Delete</MenuItem>
                </ActionMenu>
                <Text slot="description">2026</Text>
              </Content>
            </Card>
          </UserMessage>
        </ThreadList>
        <PromptField />
      </Thread>
    </div>
  );
}

let dummyResponses = [
  "Sure! Here's a summary of the key points based on the assets you shared. The main themes revolve around brand consistency, audience engagement, and clear calls to action across all touchpoints.",
  'Great question. Based on the context provided, I recommend focusing on the narrative arc first, then layering in supporting visuals and data to reinforce the core message.',
  "I've analyzed the content and identified three main opportunities: improving visual hierarchy, strengthening the headline, and adding a clearer value proposition in the opening section."
];

type Message =
  | {id: number; type: 'user' | 'system'; content: string}
  | {id: number; type: 'status'; status: 'pending' | 'complete'};

let initialResponses = [
  {id: 0, type: 'user', content: 'prompt 1'},
  {id: 1, type: 'system', content: dummyResponses[0]},
  {id: 2, type: 'user', content: 'prompt 2'},
  {id: 3, type: 'system', content: dummyResponses[1]},
  {id: 4, type: 'user', content: 'prompt 3'},
  {id: 5, type: 'system', content: dummyResponses[2]},
  {id: 6, type: 'user', content: 'prompt 4'},
  {id: 7, type: 'system', content: dummyResponses[0]},
  {id: 8, type: 'user', content: 'prompt 5'},
  {id: 9, type: 'system', content: dummyResponses[1]},
  {id: 10, type: 'user', content: 'prompt 6'},
  {id: 11, type: 'system', content: dummyResponses[2]}
] as Message[];

export function DynamicThread() {
  let [messages, setMessages] = useState<Message[]>(initialResponses);
  let nextId = useRef(initialResponses.length);
  let lastMessage = messages.at(-1);
  let isPending = lastMessage?.type === 'status' && lastMessage.status === 'pending';

  // TODO: test announcements here since we aren't setting isStreaming here
  // maybe the items should announce on mount, but not for initial mount of the whole chat
  function handleSend(text: string) {
    if (!text.trim()) {
      return;
    }
    setMessages(prev => [
      ...prev,
      {id: nextId.current++, type: 'user', content: text},
      {id: nextId.current++, type: 'status', status: 'pending'}
    ]);
    setTimeout(() => {
      let response = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
      setMessages(prev => [
        ...prev.slice(0, -1),
        {id: nextId.current++, type: 'system', content: response}
      ]);
    }, 1500);
  }

  return (
    <div
      className={style({
        margin: 0,
        marginX: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        height: '100%'
      })}>
      <Thread
        className={style({
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexGrow: 1,
          gap: 16,
          paddingX: 16
        })}>
        <div
          className={style({
            position: 'relative',
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          })}>
          <div
            className={style({
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1
            })}>
            <ThreadScrollButton>
              <ActionButton slot="scroll" aria-label="Scroll to bottom">
                <ChevronDown />
              </ActionButton>
            </ThreadScrollButton>
          </div>
          <ThreadList
            items={[...messages].reverse()}
            focusOnEntry="first"
            aria-label="Chat thread"
            className={style({
              flexGrow: 1,
              overflow: 'auto',
              padding: 8,
              scrollPadding: 8,
              rowGap: 16,
              alignItems: 'start'
            })}>
            {msg => {
              if (msg.type === 'user') {
                return <UserMessage textValue={msg.content}>{msg.content}</UserMessage>;
              }
              if (msg.type === 'status') {
                return <ResponseStatus status={msg.status} />;
              }
              return (
                <SystemMessage textValue={msg.content}>
                  <div role="document">
                    <p className={style({font: 'body'})}>{msg.content}</p>
                  </div>
                  <MessageFeedback />
                </SystemMessage>
              );
            }}
          </ThreadList>
        </div>
        <PromptField onSend={handleSend} isDisabled={isPending} />
      </Thread>
    </div>
  );
}

export function VirtualizedThread() {
  let [messages, setMessages] = useState<Message[]>(initialResponses);
  let nextId = useRef(initialResponses.length);
  let lastMessage = messages.at(-1);
  let isPending = lastMessage?.type === 'status' && lastMessage.status === 'pending';
  function handleSend(text: string) {
    if (!text.trim()) {
      return;
    }
    setMessages(prev => [
      ...prev,
      {id: nextId.current++, type: 'user', content: text},
      {id: nextId.current++, type: 'status', status: 'pending'}
    ]);
    setTimeout(() => {
      let response = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
      setMessages(prev => [
        ...prev.slice(0, -1),
        {id: nextId.current++, type: 'system', content: response}
      ]);
    }, 1500);
  }

  return (
    <div
      className={style({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexGrow: 1
      })}>
      {/* TODO: move this Virtualizer into the Thread component eventually when we get column reverse support */}
      <Virtualizer layout={ListLayout} layoutOptions={{estimatedRowHeight: 100}}>
        <GridList
          aria-label="Chat thread"
          // TODO: try this, but it most likely won't work
          // replace with LiveAnnouncer or an aria-live region populated with just the new items (remove the items once the announcement finishes)?
          // aria-live="polite"
          // aria-relevant="additions"
          keyboardNavigationBehavior="tab"
          focusOnEntry="last"
          items={messages}
          className={style({
            height: 400,
            paddingX: 4,
            overflow: 'auto',
            marginBottom: 8
          })}>
          {/* TODO style these so that they don't become full width in a virtualizer (or at least dont appear visually to be full width) */}
          {msg => {
            if (msg.type === 'user') {
              return <UserMessage textValue={msg.content}>{msg.content}</UserMessage>;
            }
            if (msg.type === 'status') {
              return <ResponseStatus status={msg.status} />;
            }
            return (
              <SystemMessage textValue={msg.content}>
                <div role="document">
                  <p className={style({font: 'body'})}>{msg.content}</p>
                </div>
                <MessageFeedback />
              </SystemMessage>
            );
          }}
        </GridList>
      </Virtualizer>
      <PromptField onSend={handleSend} isDisabled={isPending} />
    </div>
  );
}

type StreamingMessage =
  | {id: number; type: 'user'; content: string}
  | {id: number; type: 'system'; content: string; isStreaming?: boolean}
  | {id: number; type: 'tool-call'; label: string; isStreaming: boolean}
  | {id: number; type: 'sources'; items: string[]}
  | {id: number; type: 'card'; title: string; description: string; imageUrl: string}
  | {id: number; type: 'status'; status: 'pending' | 'complete'; thinking?: string};

let MOCK_SOURCES = [
  'Hilton brand email — Q1 campaign 2026',
  'Market research — hospitality trends 2025',
  'User research — loyalty programme survey'
];

let MOCK_CARD = {
  title: 'Desert Sunset',
  description: 'PNG • 2/3/2024',
  imageUrl:
    'https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

function ToolCallStatus({label, isStreaming}: {label: string; isStreaming: boolean}) {
  let textValue = isStreaming ? `${label}…` : `${label} complete`;
  return (
    <ThreadItem
      textValue={textValue}
      isStreaming={isStreaming}
      shouldAnnounceOnMount
      className={style({
        ...focusRing(),
        borderRadius: 'sm',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      })}>
      {isStreaming ? (
        <ProgressCircle isIndeterminate size="S" aria-label={label} />
      ) : (
        <CheckmarkCircle />
      )}
      <span className={style({font: 'ui', color: 'neutral-subdued'})}>{textValue}</span>
    </ThreadItem>
  );
}

function SourcesMessage({items: sourceItems}: {items: string[]}) {
  let textValue = `Found ${sourceItems.length} source${sourceItems.length !== 1 ? 's' : ''}`;
  return (
    <ThreadItem textValue={textValue} className={style({...focusRing(), borderRadius: 'default'})}>
      <Sources>
        <SourceList>
          {sourceItems.map((s, i) => (
            <SourceListItem key={i} href="#">
              {s}
            </SourceListItem>
          ))}
        </SourceList>
      </Sources>
    </ThreadItem>
  );
}

function CardMessage({
  title,
  description,
  imageUrl
}: {
  title: string;
  description: string;
  imageUrl: string;
}) {
  return (
    <ThreadItem textValue={title} className={style({...focusRing(), borderRadius: 'default'})}>
      <AssetCard>
        <CardPreview>
          <Image src={imageUrl} />
        </CardPreview>
        <Content>
          <Text slot="title">{title}</Text>
          <ActionMenu>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Share</MenuItem>
            <MenuItem>Delete</MenuItem>
          </ActionMenu>
          <Text slot="description">{description}</Text>
        </Content>
      </AssetCard>
    </ThreadItem>
  );
}

export function StreamingThread() {
  let [messages, setMessages] = useState<StreamingMessage[]>(
    initialResponses as StreamingMessage[]
  );
  let nextId = useRef(initialResponses.length);
  let lastMessage = messages.at(-1);
  let isDisabled =
    lastMessage?.type === 'status' ||
    lastMessage?.type === 'tool-call' ||
    (lastMessage?.type === 'system' && lastMessage.isStreaming);

  function handleSend(text: string) {
    if (!text.trim()) {
      return;
    }

    // user message added first so its announcement plays before
    setMessages(prev => [...prev, {id: nextId.current++, type: 'user', content: text}]);

    function addTool(label: string, replaceStatus = false) {
      setMessages(prev =>
        replaceStatus
          ? [
              ...prev.slice(0, -1),
              {id: nextId.current++, type: 'tool-call', label, isStreaming: true}
            ]
          : [...prev, {id: nextId.current++, type: 'tool-call', label, isStreaming: true}]
      );
    }

    function completeTool() {
      setMessages(prev =>
        prev.map(m => (m.type === 'tool-call' && m.isStreaming ? {...m, isStreaming: false} : m))
      );
    }

    function streamText(content: string) {
      setMessages(prev => [
        ...prev,
        {id: nextId.current++, type: 'system', content: '', isStreaming: true}
      ]);
      let tokens = content.split(' ');
      let accumulated = '';
      tokens.forEach((token, i) => {
        setTimeout(() => {
          accumulated += (i === 0 ? '' : ' ') + token;
          setMessages(prev =>
            prev.map(m =>
              m.type === 'system' && m.isStreaming
                ? {...m, content: accumulated, isStreaming: i < tokens.length - 1}
                : m
            )
          );
        }, i * 80);
      });
    }

    // TODO: these durations are quite generous in order to accomodate for announcements, but realistically it might be
    // faster and thus the announcements will get cut off even with polite...
    // first batch, does took calls with text response
    let timestamp = 0;
    let toolCallDuration = 4000;
    // Status added after short delay so user message announcement plays first
    setTimeout(
      () => {
        setMessages(prev => [...prev, {id: nextId.current++, type: 'status', status: 'pending'}]);
      },
      (timestamp += 1000)
    );
    setTimeout(() => addTool('Thinking', true), (timestamp += 1000));
    setTimeout(() => completeTool(), (timestamp += toolCallDuration));
    setTimeout(() => addTool('Loading tool'), (timestamp += 1000));
    setTimeout(() => completeTool(), (timestamp += toolCallDuration));
    setTimeout(() => addTool('Searching'), (timestamp += 1000));
    setTimeout(() => completeTool(), (timestamp += toolCallDuration));
    setTimeout(
      () =>
        streamText(
          'I found some relevant assets that match your request. Let me pull up the details.'
        ),
      (timestamp += 1000)
    );

    // then does searching, streaming more text, returning a card and sources
    setTimeout(() => addTool('Searching'), (timestamp += 4000));
    setTimeout(() => completeTool(), (timestamp += toolCallDuration));
    setTimeout(() => addTool('Querying database'), (timestamp += 1000));
    setTimeout(() => completeTool(), (timestamp += toolCallDuration));
    setTimeout(
      () =>
        setMessages(prev => [...prev, {id: nextId.current++, type: 'status', status: 'pending'}]),
      (timestamp += 500)
    );
    setTimeout(
      () =>
        setMessages(prev => [
          ...prev.slice(0, -1),
          {
            id: nextId.current++,
            type: 'status',
            status: 'complete',
            thinking:
              'The user shared Hilton brand assets and is asking for a presentation outline. I analyzed the visual themes and brand guidelines to suggest a narrative structure that aligns with the hospitality brand identity.'
          }
        ]),
      (timestamp += 2000)
    );
    setTimeout(
      () =>
        streamText(
          'Based on the assets you shared, I recommend focusing on the narrative arc first, then ' +
            'layering in supporting visuals and data to reinforce the core message. The main themes ' +
            'revolve around brand consistency, audience engagement, and clear calls to action.'
        ),
      (timestamp += 1000)
    );

    let streamEndTimestamp = timestamp + 8000;
    setTimeout(() => {
      setMessages(prev => [...prev, {id: nextId.current++, type: 'card', ...MOCK_CARD}]);
    }, streamEndTimestamp);
    setTimeout(() => {
      setMessages(prev => [...prev, {id: nextId.current++, type: 'sources', items: MOCK_SOURCES}]);
    }, streamEndTimestamp + 1000);
  }

  return (
    // TODO: these extra div wrappers would need to be implemented by the RAC user, maybe we can internalize some more?
    // of particular note is the scroll button. Same for the other styles
    <div
      className={style({
        margin: 0,
        marginX: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        height: '100%'
      })}>
      <Thread
        className={style({
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexGrow: 1,
          gap: 16,
          paddingX: 16
        })}>
        <div
          className={style({
            position: 'relative',
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          })}>
          <div
            className={style({
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1
            })}>
            <ThreadScrollButton>
              <ActionButton slot="scroll" aria-label="Scroll to bottom">
                <ChevronDown />
              </ActionButton>
            </ThreadScrollButton>
          </div>
          <ThreadList
            items={[...messages].reverse()}
            focusOnEntry="first"
            aria-label="Chat thread"
            className={style({
              flexGrow: 1,
              overflow: 'auto',
              padding: 8,
              scrollPadding: 8,
              rowGap: 16,
              alignItems: 'start'
            })}>
            {(msg: StreamingMessage) => {
              if (msg.type === 'user') {
                return <UserMessage textValue={msg.content}>{msg.content}</UserMessage>;
              }
              if (msg.type === 'status') {
                return <ResponseStatus status={msg.status} thinking={msg.thinking} />;
              }
              if (msg.type === 'tool-call') {
                return <ToolCallStatus label={msg.label} isStreaming={msg.isStreaming} />;
              }
              if (msg.type === 'sources') {
                return <SourcesMessage items={msg.items} />;
              }
              if (msg.type === 'card') {
                return (
                  <CardMessage
                    title={msg.title}
                    description={msg.description}
                    imageUrl={msg.imageUrl}
                  />
                );
              }
              return (
                <SystemMessage textValue={msg.content} isStreaming={msg.isStreaming}>
                  <div role="document">
                    <p className={style({font: 'body'})}>{msg.content || ''}</p>
                  </div>
                  {!msg.isStreaming && <MessageFeedback />}
                </SystemMessage>
              );
            }}
          </ThreadList>
        </div>
        <PromptField onSend={handleSend} isDisabled={!!isDisabled} />
      </Thread>
    </div>
  );
}

// TODO: all of the below was copied from rsp-prototypes, just filler for now
// some modifications for streaming and what not
function PromptField({
  onSend,
  isDisabled
}: {
  onSend?: (text: string) => void;
  isDisabled?: boolean;
}) {
  let [text, setText] = useState('');
  let [attachments, setAttachments] = useState([
    {
      image: 'https://react-spectrum.adobe.com/preview.c3b340d3.png',
      title: 'Hilton assets',
      description: '2026'
    }
  ]);

  // Not using RAC DropZone because it adds its own focusable button,
  // and we want to avoid an extra tab stop by attaching to the input.
  // TODO: support clipboard too (without messing up pasting text)
  let inputRef = useRef<HTMLTextAreaElement>(null);
  let {dropProps, dropButtonProps, isDropTarget} = useDrop({
    ref: inputRef,
    hasDropButton: true,
    async onDrop(e) {
      let files = await Promise.all(
        e.items.filter(isFileDropItem).map(async item => ({
          image: item.type.startsWith('image/') ? URL.createObjectURL(await item.getFile()) : '',
          title: item.name,
          description: item.type
        }))
      );
      setAttachments(attachments => [...attachments, ...files]);
    }
  });

  return (
    <div>
      <Group
        {...dropProps}
        role="group"
        className={renderProps =>
          style({
            ...focusRing(),
            padding: 16,
            boxShadow: 'emphasized',
            backgroundColor: {
              default: 'elevated',
              isDropTarget: 'blue-200'
            },
            borderRadius: 'lg',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: {
              default: 'transparent',
              isFocusWithin: 'gray-900',
              isDropTarget: 'blue-800'
            }
          })({...renderProps, isDropTarget})
        }>
        <AttachmentList>
          {attachments.map((attachment, i) => (
            <Attachment
              {...attachment}
              key={i}
              id={i}
              onRemove={() => {
                setAttachments(attachments.slice(0, i).concat(attachments.slice(i + 1)));
              }}
            />
          ))}
        </AttachmentList>
        <TextField value={text} onChange={value => setText(value)} slot="prompt">
          <Label
            className={style({
              display: 'block',
              font: 'ui',
              color: 'neutral-subdued',
              marginBottom: 4
            })}>
            Prompt
          </Label>
          <TextArea
            {...dropButtonProps}
            ref={inputRef}
            placeholder="Ready to get started? Ask a question, share an idea, or add a task."
            style={{resize: 'none'}}
            className={style({
              font: 'ui',
              color: {
                default: baseColor('neutral'),
                '::placeholder': {
                  default: 'gray-600',
                  forcedColors: 'GrayText'
                }
              },
              padding: 0,
              backgroundColor: 'transparent',
              width: 'full',
              outlineStyle: 'none',
              borderStyle: 'none'
            })}
          />
        </TextField>
        <div
          className={style({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16
          })}>
          <ActionButton isQuiet aria-label="Add">
            <Plus />
          </ActionButton>
          <Button
            variant="accent"
            aria-label="Send"
            isDisabled={isDisabled}
            onPress={() => {
              onSend?.(text);
              setText('');
              inputRef.current?.focus();
            }}>
            <Send />
          </Button>
        </div>
      </Group>
      <p className={style({font: 'ui-sm', textAlign: 'center'})}>
        Responses are generated using AI, and may be inaccurate. Check before using.{' '}
        <Link
          variant="secondary"
          href="https://www.adobe.com/legal/licenses-terms/adobe-gen-ai-user-guidelines.html"
          target="_blank">
          AI User Guidelines
        </Link>
      </p>
    </div>
  );
}

function AttachmentList({children}: {children: ReactNode}) {
  return (
    <TagGroup aria-label="Attachments">
      <TagList
        className={style({
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 16
        })}>
        {children}
      </TagList>
    </TagGroup>
  );
}

function Attachment({
  id,
  image,
  title,
  description,
  onRemove
}: {
  id: number;
  image: string;
  title: string;
  description: string;
  onRemove: () => void;
}) {
  return (
    <Tag id={id} textValue={title} className={style({...focusRing(), borderRadius: 'default'})}>
      {/* TODO: support rendering cards as tags/gridlist items directly */}
      <Card variant="secondary">
        {/* TODO: horizontal cards */}
        <div
          className={style({display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'center'})}>
          {image && (
            <Image
              src={image}
              styles={style({borderRadius: 'default', objectFit: 'cover', height: 50, width: 50})}
            />
          )}
          <Content styles={style({padding: 0})}>
            <Text slot="title">{title}</Text>
            <Text slot="description">{description}</Text>
          </Content>
          {/* TODO: allow overriding slot in CloseButton */}
          <ButtonContext value={null}>
            <CloseButton
              size="S"
              aria-label="Remove attachment"
              onPress={onRemove}
              styles={style({alignSelf: 'start', marginTop: -12, marginEnd: -12})}
            />
          </ButtonContext>
        </div>
      </Card>
    </Tag>
  );
}

function UserMessage({
  children,
  textValue = ' '
}: {
  children: ReactNode;
  textValue?: string;
  isStreaming?: boolean;
}) {
  return (
    <ThreadItem
      textValue={textValue}
      className={style({
        ...focusRing(),
        backgroundColor: 'gray-50',
        paddingX: 16,
        paddingY: 8,
        font: 'body',
        borderRadius: 'lg',
        alignSelf: 'end'
      })}>
      {children}
    </ThreadItem>
  );
}

function SystemMessage({
  children,
  textValue = ' ',
  isStreaming
}: {
  children: ReactNode;
  textValue?: string;
  isStreaming?: boolean;
}) {
  return (
    <ThreadItem
      textValue={textValue}
      isStreaming={isStreaming}
      className={style({...focusRing(), borderRadius: 'default'})}>
      {children}
    </ThreadItem>
  );
}

function MessageFeedback() {
  return (
    <ToggleButtonGroup selectionMode="single" isQuiet styles={style({marginTop: 8})}>
      <ToggleButton id="up" aria-label="Thumbs up">
        <ThumbUp />
      </ToggleButton>
      <ToggleButton id="down" aria-label="Thumbs down">
        <ThumbDown />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

function ResponseStatus({status, thinking}: {status: 'pending' | 'complete'; thinking?: string}) {
  switch (status) {
    case 'pending':
      return (
        <ThreadItem
          textValue="Generating response"
          className={style({
            ...focusRing(),
            borderRadius: 'sm',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          })}>
          <ProgressCircle isIndeterminate size="S" aria-label="Generating response" />
          <span className={style({font: 'ui', color: 'neutral-subdued'})}>
            Generating response...
          </span>
        </ThreadItem>
      );
    case 'complete':
      return (
        <ThreadItem
          textValue="Response generated"
          className={style({
            ...focusRing(),
            borderRadius: 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          })}>
          {thinking ? (
            <Disclosure size="S" isQuiet>
              <DisclosureHeader UNSAFE_style={{width: 'fit-content'}}>
                <DisclosureTitle>
                  <span className={style({display: 'flex', alignItems: 'center', gap: 8})}>
                    Response generated <CheckmarkCircle />
                  </span>
                </DisclosureTitle>
              </DisclosureHeader>
              <DisclosurePanel>
                <p className={style({font: 'body-sm'})}>{thinking}</p>
              </DisclosurePanel>
            </Disclosure>
          ) : (
            <>
              <span className={style({font: 'ui', color: 'neutral-subdued'})}>
                Generating response...
              </span>
              <CheckmarkCircle />
            </>
          )}
        </ThreadItem>
      );
  }
}

function Sources({children}: {children: ReactNode}) {
  return (
    <Disclosure size="S" isQuiet styles={style({marginTop: 8})}>
      <DisclosureHeader UNSAFE_style={{width: 'fit-content'}}>
        <DisclosureTitle>Sources</DisclosureTitle>
      </DisclosureHeader>
      <DisclosurePanel>{children}</DisclosurePanel>
    </Disclosure>
  );
}

function SourceList({children}: {children: ReactNode}) {
  return (
    <ol
      style={{counterReset: 'step'}}
      className={style({
        display: 'flex',
        flexDirection: 'column',
        rowGap: 4,
        paddingStart: 0,
        margin: 0
      })}>
      {children}
    </ol>
  );
}

function SourceListItem(props: LinkProps) {
  return (
    <li
      style={{counterIncrement: 'step'}}
      className={style({
        listStyleType: 'none'
      })}>
      <span
        className={
          css('&::before { content: counter(step) }') +
          style({
            fontWeight: 'normal',
            borderRadius: 'sm',
            backgroundColor: 'gray-100',
            display: 'inline-block',
            paddingX: 8,
            height: '[1lh]',
            textAlign: 'center',
            font: 'body-sm',
            marginEnd: 8
          })
        }
      />
      <Link {...props} variant="secondary" isStandalone />
    </li>
  );
}
