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
import {AssetCard, CardPreview} from '@react-spectrum/s2/Card';
import ChevronDown from '@react-spectrum/s2/icons/ChevronDown';
import {Content} from '@react-spectrum/s2/Content';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {GridList} from 'react-aria-components';
import {Image} from '@react-spectrum/s2/Image';
import {ListLayout} from 'react-stately/useVirtualizerState';
import {MenuItem} from '@react-spectrum/s2/Menu';
import {MessageFeedback} from '../src/MessageFeedback';
import {MessageSource, SourceList, SourceListItem} from '../src/MessageSource';
import {MessageSuggestion, MessageSuggestionList} from '../src/MessageSuggestion';
import type {Meta} from '@storybook/react';
import {PromptField, PromptFieldSubmitButton, PromptTokenField} from '../src/PromptField';
import {ReactNode, useRef, useState} from 'react';
import {ResponseStatus, ResponseStatusPanel, ResponseStatusTitle} from '../src/ResponseStatus';
import {Text} from '@react-spectrum/s2/Text';
import {Thread, ThreadItem, ThreadList, ThreadScrollButton} from '../src/Thread';
import type {TokenSegmentList} from '../src/TokenSegmentList';
import {UserMessage} from '../src/UserMessage';
import {Virtualizer} from 'react-aria-components/Virtualizer';

const meta: Meta<typeof Thread> = {
  component: Thread,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'AI/Thread',
  decorators: [
    Story => (
      <div style={{width: '800px', height: '700px'}}>
        <Story />
      </div>
    )
  ]
};

export default meta;

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

type StreamingMessage =
  | {id: number; type: 'user'; content: string}
  | {id: number; type: 'system'; content: string; isStreaming?: boolean; sources?: string[]}
  | {
      id: number;
      type: 'status';
      label: string;
      isStreaming: boolean;
      details: string;
    }
  | {id: number; type: 'card'; title: string; description: string; imageUrl: string}
  | {id: number; type: 'suggestions'; title: string; suggestions: string[]};

let MOCK_SOURCES = [
  'Hilton brand email — Q1 campaign 2026',
  'Market research — hospitality trends 2025',
  'User research — loyalty programme survey'
];

let MOCK_SUGGESTIONS = [
  'Suggest a presentation structure',
  'What other assets might be relevant?',
  'Summarize the key themes'
];

let MOCK_CARD = {
  title: 'Desert Sunset',
  description: 'PNG • 2/3/2024',
  imageUrl:
    'https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

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
  let [isGenerating, setGenerating] = useState(false);
  let timeouts = useRef<NodeJS.Timeout[]>([]);

  function handleSend(prompt: TokenSegmentList) {
    setGenerating(true);
    // user message added first so its announcement plays before
    setMessages(prev => [
      ...prev,
      {id: nextId.current++, type: 'user', content: prompt.toString()}
    ]);

    function addTool(label: string, replaceStatus = false) {
      setMessages(prev =>
        replaceStatus
          ? [
              ...prev.slice(0, -1),
              {
                id: nextId.current++,
                type: 'status',
                label,
                isStreaming: true,
                details: ''
              }
            ]
          : [
              ...prev,
              {
                id: nextId.current++,
                type: 'status',
                label,
                isStreaming: true,
                details: ''
              }
            ]
      );
    }

    function completeTool(details: string) {
      setMessages(prev =>
        prev.map(m =>
          m.type === 'status' && m.isStreaming ? {...m, isStreaming: false, details} : m
        )
      );
    }

    function streamText(content: string, sources?: string[]) {
      setMessages(prev => [
        ...prev,
        {id: nextId.current++, type: 'system', content: '', isStreaming: true}
      ]);
      let tokens = content.split(' ');
      let accumulated = '';
      tokens.forEach((token, i) => {
        setTimeout(() => {
          accumulated += (i === 0 ? '' : ' ') + token;
          let isLastToken = i === tokens.length - 1;
          setMessages(prev =>
            prev.map(m =>
              m.type === 'system' && m.isStreaming
                ? {
                    ...m,
                    content: accumulated,
                    isStreaming: !isLastToken,
                    ...(isLastToken && sources ? {sources} : {})
                  }
                : m
            )
          );
        }, i * 80);
      });
    }

    let addTimeout = (callback: () => void, delay: number) => {
      let timeout = setTimeout(callback, delay);
      timeouts.current.push(timeout);
      return timeout;
    };

    // TODO: these durations are quite generous in order to accomodate for announcements, but realistically it might be
    // faster and thus the announcements will get cut off even with polite...
    // first batch, does tool calls with text response
    let timestamp = 0;
    let toolCallDuration = 4000;
    // Status added after short delay so user message announcement plays first
    addTimeout(
      () => {
        setMessages(prev => [
          ...prev,
          {
            id: nextId.current++,
            type: 'status',
            label: 'Generating response',
            isStreaming: true,
            details: ''
          }
        ]);
      },
      (timestamp += 1000)
    );
    addTimeout(() => addTool('Thinking', true), (timestamp += 1000));
    addTimeout(
      () =>
        completeTool(
          'Reviewed conversation context and identified the user is searching for Hilton brand assets.'
        ),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => addTool('Loading tool'), (timestamp += 1000));
    addTimeout(
      () => completeTool('Asset search tool loaded with access to the Hilton brand library.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => addTool('Searching'), (timestamp += 1000));
    addTimeout(
      () => completeTool('Found 15 assets matching the brand criteria across 3 campaigns.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(
      () =>
        streamText(
          'I found some relevant assets that match your request. Let me pull up the details.'
        ),
      (timestamp += 1000)
    );

    // then does searching, streaming more text, returning a card and sources
    addTimeout(() => addTool('Searching'), (timestamp += 4000));
    addTimeout(
      () =>
        completeTool('Identified additional brand materials related to the presentation context.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => addTool('Querying database'), (timestamp += 1000));
    addTimeout(
      () =>
        completeTool(
          'Retrieved asset records including metadata, previews, and usage rights for 12 items.'
        ),
      (timestamp += toolCallDuration)
    );
    addTimeout(
      () =>
        setMessages(prev => [
          ...prev,
          {
            id: nextId.current++,
            type: 'status',
            label: 'Generating response',
            isStreaming: true,
            details: ''
          }
        ]),
      (timestamp += 500)
    );
    addTimeout(
      () =>
        setMessages(prev => [
          ...prev.slice(0, -1),
          {
            id: nextId.current++,
            type: 'status',
            label: 'Response generated',
            isStreaming: false,
            details:
              'The user shared Hilton brand assets and is asking for a presentation outline. I analyzed the visual themes and brand guidelines to suggest a narrative structure that aligns with the hospitality brand identity.'
          }
        ]),
      (timestamp += 2000)
    );
    addTimeout(
      () =>
        streamText(
          'Based on the assets you shared, I recommend focusing on the narrative arc first, then ' +
            'layering in supporting visuals and data to reinforce the core message. The main themes ' +
            'revolve around brand consistency, audience engagement, and clear calls to action.',
          MOCK_SOURCES
        ),
      (timestamp += 1000)
    );

    let streamEndTimestamp = timestamp + 8000;
    addTimeout(() => {
      setMessages(prev => [...prev, {id: nextId.current++, type: 'card', ...MOCK_CARD}]);
    }, streamEndTimestamp);
    addTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: nextId.current++,
          type: 'suggestions',
          title: 'Suggested follow-ups',
          suggestions: MOCK_SUGGESTIONS
        }
      ]);
      setGenerating(false);
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
                // TODO: probably want ThreadItem to be a part of UserMessage?
                return (
                  <ThreadItem
                    textValue={msg.content}
                    className={style({...focusRing(), borderRadius: 'default', alignSelf: 'end'})}>
                    <UserMessage>{msg.content}</UserMessage>
                  </ThreadItem>
                );
              }
              if (msg.type === 'status') {
                let announcement = msg.isStreaming ? `${msg.label}…` : `${msg.label} complete`;
                let title = msg.isStreaming ? `${msg.label}…` : msg.label;
                // TODO: might want to have ThreadItem be a part of the ResponseStatus by default?
                // Ideally it would auto focus the ResponseStatus itself via focusMode=child, but we
                // probably want to make that on a case by case basis
                // (aka it would make sense to auto focus children here but not for a system message that has text and other focusable children)
                return (
                  <ThreadItem
                    textValue={announcement}
                    isStreaming={msg.isStreaming}
                    shouldAnnounceOnMount
                    className={style({...focusRing(), borderRadius: 'default'})}>
                    <ResponseStatus isLoading={msg.isStreaming}>
                      <ResponseStatusTitle>{title}</ResponseStatusTitle>
                      <ResponseStatusPanel>
                        {msg.details && (
                          <p className={style({font: 'body-sm', margin: 0})}>{msg.details}</p>
                        )}
                      </ResponseStatusPanel>
                    </ResponseStatus>
                  </ThreadItem>
                );
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
              if (msg.type === 'suggestions') {
                // TODO: probably should have ThreadItem auto wrap MessageSuggestionList as well
                // but this one I could see perhaps being a standalone component to be used outside of thread
                return (
                  <ThreadItem
                    textValue={msg.title}
                    className={style({...focusRing(), borderRadius: 'default'})}>
                    <MessageSuggestionList title={msg.title}>
                      {msg.suggestions.map((s, i) => (
                        <MessageSuggestion key={i}>{s}</MessageSuggestion>
                      ))}
                    </MessageSuggestionList>
                  </ThreadItem>
                );
              }
              return (
                <SystemMessage
                  textValue={msg.content}
                  isStreaming={msg.isStreaming}
                  sources={msg.sources}>
                  <div role="document">
                    <p className={style({font: 'body'})}>{msg.content || ''}</p>
                  </div>
                  {!msg.isStreaming && <MessageFeedback />}
                </SystemMessage>
              );
            }}
          </ThreadList>
        </div>
        <PromptField
          onSubmit={handleSend}
          isGenerating={isGenerating}
          onStop={() => {
            setGenerating(false);
            timeouts.current.forEach(clearTimeout);
            timeouts.current = [];
          }}>
          <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
            <PromptTokenField />
            <PromptFieldSubmitButton />
          </div>
        </PromptField>
      </Thread>
    </div>
  );
}

// Ignore this story, just here for local testing
export function VirtualizedThread() {
  let [messages, setMessages] = useState<Message[]>(initialResponses);
  let nextId = useRef(initialResponses.length);
  let lastMessage = messages.at(-1);
  let isPending = lastMessage?.type === 'status' && lastMessage.status === 'pending';
  function handleSend(prompt: TokenSegmentList) {
    setMessages(prev => [
      ...prev,
      {id: nextId.current++, type: 'user', content: prompt.toString()},
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
      <Virtualizer layout={ListLayout} layoutOptions={{estimatedRowHeight: 100}}>
        <GridList
          aria-label="Chat thread"
          keyboardNavigationBehavior="tab"
          focusOnEntry="last"
          items={messages}
          className={style({
            height: 400,
            paddingX: 4,
            overflow: 'auto',
            marginBottom: 8
          })}>
          {msg => {
            if (msg.type === 'user') {
              return (
                <ThreadItem
                  textValue={msg.content}
                  className={style({...focusRing(), borderRadius: 'lg', alignSelf: 'end'})}>
                  <UserMessage>{msg.content}</UserMessage>
                </ThreadItem>
              );
            }
            if (msg.type === 'status') {
              let isPending = msg.status === 'pending';
              let message = isPending ? 'Generating response' : 'Response generated';

              return (
                <ThreadItem
                  textValue={message}
                  className={style({...focusRing(), borderRadius: 'default'})}>
                  <ResponseStatus isLoading={isPending}>
                    <ResponseStatusTitle>{message}</ResponseStatusTitle>
                  </ResponseStatus>
                </ThreadItem>
              );
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
      <PromptField onSubmit={handleSend} isGenerating={isPending}>
        <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
          <PromptTokenField />
          <PromptFieldSubmitButton />
        </div>
      </PromptField>
    </div>
  );
}

function SystemMessage({
  children,
  textValue = ' ',
  isStreaming,
  sources
}: {
  children: ReactNode;
  textValue?: string;
  isStreaming?: boolean;
  sources?: string[];
}) {
  return (
    <ThreadItem
      textValue={textValue}
      isStreaming={isStreaming}
      className={style({...focusRing(), borderRadius: 'default'})}>
      {children}
      {sources && sources.length > 0 && (
        <MessageSource label="Sources">
          <SourceList>
            {sources.map((s, i) => (
              <SourceListItem key={i} href="#">
                {s}
              </SourceListItem>
            ))}
          </SourceList>
        </MessageSource>
      )}
    </ThreadItem>
  );
}
