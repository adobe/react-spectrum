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
import {Chat} from '../src/Chat';
import ChevronDown from '@react-spectrum/s2/icons/ChevronDown';
import {Content} from '@react-spectrum/s2/Content';
import {GridList} from 'react-aria-components';
import {Image} from '@react-spectrum/s2/Image';
import {ListLayout} from 'react-stately/useVirtualizerState';
import {MenuItem} from '@react-spectrum/s2/Menu';
import {
  MessageFeedback,
  MessageSource,
  MessageSuggestion,
  MessageSuggestionList,
  PromptField,
  PromptFieldSubmitButton,
  PromptTokenField,
  ResponseStatus,
  ResponseStatusPanel,
  ResponseStatusTitle,
  SourceList,
  SourceListItem,
  Thread,
  ThreadItem,
  ThreadScrollButton,
  TokenSegmentList,
  UserMessage
} from '@react-spectrum/ai';
import type {Meta} from '@storybook/react';
import {ReactNode, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';
import {Virtualizer} from 'react-aria-components/Virtualizer';

const meta: Meta<typeof Chat> = {
  component: Chat,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'AI/Chat',
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
  {
    id: 0,
    type: 'user',
    content:
      "I'm launching a new product next month—a sustainable, affordable athletic wear line targeting Gen Z. We have a limited budget and need to figure out our go-to-market strategy. Where do we even start?"
  },
  {
    id: 1,
    type: 'system',
    content:
      "Exciting launch! A few things to clarify so I give you relevant guidance: (1) What's your total marketing budget for the launch month? (2) Do you already have an email list, social following, or any existing audience? (3) Who's your main competitor, and what are they doing? (4) Is this DTC (direct-to-consumer) or are you selling through retailers? These will shape whether we focus on paid ads, influencers, organic content, or a mix."
  },
  {
    id: 2,
    type: 'user',
    content:
      "We have about $15,000 for the first month. We're DTC only, launching on our own website. We have a small email list of about 2,000 people from a waitlist, and basically no social following yet. Our main competitor is Reformation, but they're way more established. We want to emphasize our sustainability angle and lower price point."
  },
  {
    id: 3,
    type: 'system',
    content:
      "Okay, $15K is modest but workable for DTC. Here's my initial take: Since you're starting from zero on social and have a small email list, I'd suggest a three-part approach: (1) Allocate ~$8K to highly targeted paid ads (TikTok and Instagram) reaching eco-conscious Gen Z with strong creative, (2) Use $3K for micro-influencer partnerships (people with 10K-100K followers in the sustainability space—cheaper but authentic), (3) Keep $4K for email and organic content. Before we dive deeper—what's your product's main hook? Is it the materials, the price, the designs, or the transparency of your supply chain?"
  },
  {
    id: 4,
    type: 'user',
    content:
      "The main hook is that we use recycled ocean plastic and sell at 40% lower prices than Reformation. Our supply chain is also fully transparent. We've got 15 styles launching across tops, shorts, and leggings."
  },
  {
    id: 5,
    type: 'system',
    content:
      "Perfect—that's a strong, differentiated message. Here's what I'd focus on: The ocean plastic angle is visually compelling and emotionally resonant with Gen Z; the price-to-quality ratio is your competitive advantage against Reformation. For your first month, I'd recommend this campaign narrative: 'High performance, zero guilt, actual prices.' Now, a strategic question: Do you want to go all-in on one or two channels, or spread across TikTok, Instagram, and YouTube? Gen Z is on TikTok and Instagram, but each requires different content styles. What does your creative team feel most confident producing?"
  },
  {
    id: 6,
    type: 'user',
    content:
      "We can handle both TikTok and Instagram, but honestly TikTok feels more authentic for our brand. We have some behind-the-scenes footage of our production process and some early customer testimonials. Instagram we'd probably do more polished product shots."
  },
  {
    id: 7,
    type: 'system',
    content:
      "Smart instinct—TikTok is perfect for you because behind-the-scenes and authenticity is the content style there, and sustainability messaging performs really well. That said, here's my suggestion: (1) Use TikTok primarily for awareness and virality—behind-the-scenes, sustainability stories, affordability messaging. Spend $5K there. (2) Use Instagram for conversion—polished product shots, customer testimonials, sustainability proof. Spend $3K there. (3) With your micro-influencers ($3K), focus on TikTok creators first since that's where your audience is. One question though: Do you have a clear conversion path ready? Like, when someone clicks your ad, what's the landing page experience? Are you doing a discount code to incentivize first purchase?"
  },
  {
    id: 8,
    type: 'user',
    content:
      "We have the website ready, but we haven't thought about a launch discount. Should we do one? Won't that hurt our perceived value?"
  },
  {
    id: 9,
    type: 'system',
    content:
      "Great question—common concern. For a DTC launch with limited awareness, I'd actually recommend a strategic discount, not a deep one. Something like 15-20% off for the first 48 hours, with messaging like 'Early founder pricing' or 'Launch week exclusive.' Why? It creates urgency, lowers the barrier for first-time buyers trying an unknown brand, and you get email addresses and reviews to leverage later. You're not training people to wait for sales—you're using urgency to convert. Pair it with clear value messaging (ocean plastic, transparent supply chain, high quality) so it doesn't feel cheap. Also, include a referral incentive—Gen Z shares—maybe $10 off for them and the referee. This turns customers into advocates. Does that strategy feel right for your brand?"
  },
  {
    id: 10,
    type: 'user',
    content:
      'That makes sense. Before we move forward, can you summarize the full plan and tell me what could go wrong?'
  },
  {
    id: 11,
    type: 'system',
    content:
      "Absolutely. Your Launch Plan: $8K paid ads (TikTok $5K, Instagram $3K) with behind-the-scenes and product content; $3K micro-influencer partnerships on TikTok; $4K allocated to email nurture and organic/referral growth. 15-20% launch discount for 48 hours. What could go wrong: (1) Creative underperforms—test multiple ad versions early and kill losers fast, (2) Website crashes or checkout breaks—stress test before launch, (3) Influencers don't deliver—vet their audiences carefully and look for engagement rates, not just follower count, (4) You don't have enough inventory—make sure supply matches demand projections, (5) Customer acquisition cost exceeds your margins—monitor CAC closely in week one and adjust spending. My advice: Launch on a Tuesday or Wednesday so you have time to optimize before the weekend. Track everything obsessively in the first 72 hours—CAC, conversion rate, email signup rate. Be ready to shift budget if one channel is outperforming. Want me to help you build a monitoring dashboard or refine your email launch sequence next?"
  }
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
    <ThreadItem textValue={title}>
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

export function StreamingChat() {
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
    let toolCallDuration = 1000;
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
      (timestamp += 500)
    );
    addTimeout(() => addTool('Thinking', true), (timestamp += 500));
    addTimeout(
      () =>
        completeTool(
          'Reviewed conversation context and identified the user is searching for Hilton brand assets.'
        ),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => addTool('Loading tool'), (timestamp += 500));
    addTimeout(
      () => completeTool('Asset search tool loaded with access to the Hilton brand library.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => addTool('Searching'), (timestamp += 500));
    addTimeout(
      () => completeTool('Found 15 assets matching the brand criteria across 3 campaigns.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(
      () =>
        streamText(
          'I found some relevant assets that match your request. Let me pull up the details.'
        ),
      (timestamp += 500)
    );

    // then does searching, streaming more text, returning a card and sources
    addTimeout(() => addTool('Searching'), (timestamp += 1000));
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
      (timestamp += 1000)
    );
    addTimeout(
      () =>
        streamText(
          'Based on the assets you shared, I recommend focusing on the narrative arc first, then ' +
            'layering in supporting visuals and data to reinforce the core message. The main themes ' +
            'revolve around brand consistency, audience engagement, and clear calls to action.',
          MOCK_SOURCES
        ),
      (timestamp += 500)
    );

    let streamEndTimestamp = timestamp + 500;
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
      <Chat
        styles={style({
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexGrow: 1,
          gap: 16,
          paddingX: 16,
          boxSizing: 'border-box',
          minWidth: 0
        })}>
        <div
          className={style({
            position: 'relative',
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
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
          <Thread
            items={[...messages].reverse()}
            UNSTABLE_focusOnEntry="first"
            aria-label="Chat thread"
            styles={style({
              flexGrow: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              padding: 8,
              scrollPadding: 8,
              rowGap: 16
            })}>
            {(msg: StreamingMessage) => {
              if (msg.type === 'user') {
                // TODO: probably want ThreadItem to be a part of UserMessage?
                return (
                  <ThreadItem
                    textValue={msg.content}
                    styles={style({display: 'flex', justifyContent: 'end'})}>
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
                    shouldAnnounceOnMount>
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
                  <ThreadItem textValue={msg.title}>
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
          </Thread>
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
      </Chat>
    </div>
  );
}

// Ignore this story, just here for local testing
export function VirtualizedChat() {
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
        flexGrow: 1,
        boxSizing: 'border-box',
        minWidth: 0
      })}>
      <Virtualizer layout={ListLayout} layoutOptions={{estimatedRowHeight: 100}}>
        <GridList
          aria-label="Chat thread"
          keyboardNavigationBehavior="tab"
          UNSTABLE_focusOnEntry="last"
          items={messages}
          className={style({
            height: 400,
            paddingX: 4,
            overflowX: 'hidden',
            overflowY: 'auto',
            marginBottom: 8,
            boxSizing: 'border-box',
            minWidth: 0,
            width: 'full'
          })}>
          {msg => {
            if (msg.type === 'user') {
              return (
                <ThreadItem
                  textValue={msg.content}
                  styles={style({borderRadius: 'lg', display: 'flex', justifyContent: 'end'})}>
                  <UserMessage>{msg.content}</UserMessage>
                </ThreadItem>
              );
            }
            if (msg.type === 'status') {
              let isPending = msg.status === 'pending';
              let message = isPending ? 'Generating response' : 'Response generated';

              return (
                <ThreadItem textValue={message}>
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
    <ThreadItem textValue={textValue} isStreaming={isStreaming}>
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
