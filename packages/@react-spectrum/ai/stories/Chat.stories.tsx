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
import {ActionButton} from '@react-spectrum/s2/ActionButton';
import {ActionMenu} from '@react-spectrum/s2/ActionMenu';
import {AssetCard, CardPreview} from '@react-spectrum/s2/Card';
import {
  AutoLinkingTokenFieldValue,
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
  ThreadLoadMoreItem,
  ThreadScrollButton,
  TokenFieldValue,
  UserMessage
} from '@react-spectrum/ai';
import {Chat} from '../src/Chat';
import ChatIcon from '@react-spectrum/s2/icons/Chat';
import ChevronDown from '@react-spectrum/s2/icons/ChevronDown';
import {Collection} from 'react-aria-components';
import {Content} from '@react-spectrum/s2/Content';
import {DialogTrigger, Popover} from '@react-spectrum/s2/Popover';
import {Image} from '@react-spectrum/s2/Image';
import {MenuItem} from '@react-spectrum/s2/Menu';
import type {Meta, StoryObj} from '@storybook/react';
import {prose} from '../src/style/prose' with {type: 'macro'};
import {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';
import {ProgressCircle} from '@react-spectrum/s2/ProgressCircle';

const meta: Meta<typeof Chat> = {
  component: Chat,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'AI/Chat',
  decorators: [
    Story => (
      <div style={{width: '800px', height: '600px'}}>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof Chat>;

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

export function VirtualizedStreamingChat() {
  let [messages, setMessages] = useState<StreamingMessage[]>(
    initialResponses as StreamingMessage[]
  );
  let nextId = useRef(initialResponses.length);
  let [isGenerating, setGenerating] = useState(false);
  let timeouts = useRef<NodeJS.Timeout[]>([]);
  let [promptValue, setPromptValue] = useState<TokenFieldValue>(new AutoLinkingTokenFieldValue([]));
  let followUpMessage = useRef<TokenFieldValue | null>(null);

  function handleSend(prompt: TokenFieldValue) {
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
    let secondStreamContent =
      'Based on the assets you shared, I recommend focusing on the narrative arc first, then ' +
      'layering in supporting visuals and data to reinforce the core message. The main themes ' +
      'revolve around brand consistency, audience engagement, and clear calls to action.';
    addTimeout(() => streamText(secondStreamContent, MOCK_SOURCES), (timestamp += 500));

    let streamEndTimestamp = timestamp + (secondStreamContent.split(' ').length - 1) * 80 + 500;
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

  useEffect(() => {
    if (!isGenerating && followUpMessage.current) {
      let followup = followUpMessage.current;
      followUpMessage.current = null;
      handleSend(followup);
    }
  }, [isGenerating]);

  // TODO: maybe also have it finalize any in progress tool calls and what not, but do it later
  function handleStop() {
    followUpMessage.current = null;
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setMessages(prev =>
      prev.map(m =>
        (m.type === 'system' || m.type === 'status') && m.isStreaming
          ? {...m, isStreaming: false}
          : m
      )
    );
    setGenerating(false);
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
            items={messages}
            aria-label="Chat thread"
            styles={style({
              flexGrow: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
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
                    <ResponseStatus status={msg.isStreaming ? 'loading' : 'success'}>
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
          value={promptValue}
          onChange={setPromptValue}
          onSubmit={prompt => {
            setPromptValue(new AutoLinkingTokenFieldValue([]));
            handleSend(prompt);
          }}
          isGenerating={isGenerating}
          onStop={handleStop}>
          <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
            <PromptTokenField
              placeholder={
                isGenerating
                  ? 'Type to steer (Enter) or queue a follow-up (Option+Enter) · Esc to stop'
                  : undefined
              }
              onKeyDown={e => {
                if (!isGenerating) {
                  return;
                }

                // TODO: we could make this even more realistic but for now just fire storybook event
                // and add follow up message to queue
                if (e.key === 'Enter' && !e.altKey) {
                  e.preventDefault();
                  if (promptValue.segments.length > 0) {
                    action('onSteer')(promptValue.toString());
                    setPromptValue(new AutoLinkingTokenFieldValue([]));
                  }
                } else if (e.key === 'Enter' && e.altKey) {
                  e.preventDefault();
                  if (promptValue.segments.length > 0) {
                    action('onFollowUp')(promptValue.toString());
                    followUpMessage.current = promptValue;
                    setPromptValue(new AutoLinkingTokenFieldValue([]));
                  }
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  handleStop();
                }
              }}
            />
            <PromptFieldSubmitButton />
          </div>
        </PromptField>
      </Chat>
    </div>
  );
}

let DUMMY_RESPONSES = [
  "That's a great question! I'm here to help. Could you give me a bit more context so I can provide a more tailored response?",
  'Sure! Here is a quick summary: the key points are clarity, brevity, and relevance. Let me know if you want me to expand on any of these.',
  "Interesting topic. Here's what I know: this area has been evolving rapidly, and there are a few different perspectives worth considering. Want me to dive deeper?",
  "I've processed your message. Based on what you've shared, I'd suggest starting with a clear goal, then breaking it into smaller actionable steps. Does that help?",
  'Great point! I think the best approach here depends on your specific situation. Can you tell me more about your constraints or priorities?'
];

export function EmptyChat() {
  let [messages, setMessages] = useState<StreamingMessage[]>([]);
  let nextId = useRef(0);
  let [isGenerating, setGenerating] = useState(false);
  let timeouts = useRef<NodeJS.Timeout[]>([]);

  function handleSend(prompt: TokenFieldValue) {
    setGenerating(true);
    setMessages(prev => [
      ...prev,
      {id: nextId.current++, type: 'user', content: prompt.toString()}
    ]);

    let addTimeout = (callback: () => void, delay: number) => {
      let timeout = setTimeout(callback, delay);
      timeouts.current.push(timeout);
      return timeout;
    };

    let response = DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)];

    addTimeout(() => {
      setMessages(prev => [
        ...prev,
        {id: nextId.current++, type: 'system', content: '', isStreaming: true}
      ]);
      let tokens = response.split(' ');
      let accumulated = '';
      tokens.forEach((token, i) => {
        addTimeout(() => {
          accumulated += (i === 0 ? '' : ' ') + token;
          let isLastToken = i === tokens.length - 1;
          setMessages(prev =>
            prev.map(m =>
              m.type === 'system' && m.isStreaming
                ? {...m, content: accumulated, isStreaming: !isLastToken}
                : m
            )
          );
          if (isLastToken) {
            setGenerating(false);
          }
        }, i * 60);
      });
    }, 600);
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
            items={messages}
            aria-label="Chat thread"
            styles={style({
              flexGrow: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              scrollPadding: 8,
              rowGap: 16
            })}>
            {(msg: StreamingMessage) => {
              if (msg.type === 'user') {
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
                <SystemMessage textValue={msg.content} isStreaming={msg.isStreaming}>
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

// A system response rendered as prose, e.g. markdown returned from the server.
// Uses the `prose` macro from S2 to style the semantic HTML elements.
function ProseResponse() {
  return (
    <div role="document" className={prose()}>
      <h3>Setting up a design token pipeline</h3>
      <p>
        A token pipeline turns brand decisions into typed, versioned values every component can
        consume. At a high level there are three layers:
      </p>
      <ul>
        <li>
          <strong>Global palette</strong> — raw values like <code>gray-100</code> through{' '}
          <code>gray-900</code>.
        </li>
        <li>
          <strong>Semantic aliases</strong> — roles such as <code>text-primary</code> that point at
          palette steps.
        </li>
        <li>
          <strong>Component tokens</strong> — per-component overrides layered on top.
        </li>
      </ul>
      <p>A minimal build step reads your tokens and emits platform files:</p>
      <pre>
        <code>{`import StyleDictionary from 'style-dictionary';

StyleDictionary.extend({
  source: ['tokens/**/*.json'],
  platforms: {
    css: {transformGroup: 'css', buildPath: 'dist/css/'}
  }
}).buildAllPlatforms();`}</code>
      </pre>
      <p>
        Run it after every change and components import semantic values instead of literals. See the{' '}
        <a href="https://spectrum.adobe.com/page/design-tokens/">Spectrum design tokens docs</a> for
        the full naming conventions.
      </p>
    </div>
  );
}

type PopoverMessage = {id: number; type: 'user'; content: string} | {id: number; type: 'prose'};

// A Chat rendered inside an S2 Popover, where the system response is prose
// (markdown) styled with the `prose` macro.
export function ChatPopover() {
  let messages: PopoverMessage[] = [
    {
      id: 0,
      type: 'user',
      content: 'Can you explain how a design token pipeline works?'
    },
    {id: 1, type: 'prose'}
  ];

  return (
    <DialogTrigger>
      <ActionButton aria-label="Open assistant" styles={style({marginX: 'auto'})}>
        <ChatIcon />
      </ActionButton>
      <Popover styles={style({width: 400, height: 520})}>
        <Chat
          styles={style({
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: 'full',
            gap: 16,
            boxSizing: 'border-box',
            minWidth: 0
          })}>
          <Thread
            items={messages}
            aria-label="Chat thread"
            styles={style({
              flexGrow: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              padding: 8,
              scrollPadding: 8,
              rowGap: 16
            })}>
            {(msg: PopoverMessage) => {
              if (msg.type === 'user') {
                return (
                  <ThreadItem
                    textValue={msg.content}
                    styles={style({display: 'flex', justifyContent: 'end'})}>
                    <UserMessage>{msg.content}</UserMessage>
                  </ThreadItem>
                );
              }
              return (
                <SystemMessage textValue="Design token pipeline overview">
                  <ProseResponse />
                  <MessageFeedback />
                </SystemMessage>
              );
            }}
          </Thread>
          <PromptField onSubmit={() => {}}>
            <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
              <PromptTokenField />
              <PromptFieldSubmitButton />
            </div>
          </PromptField>
        </Chat>
      </Popover>
    </DialogTrigger>
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

interface AsyncMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

const ALL_HISTORY: AsyncMessage[] = [
  {
    id: 1,
    role: 'user',
    content: 'Hi, my laptop battery has been draining really quickly over the past few days.'
  },
  {
    id: 2,
    role: 'assistant',
    content:
      "I'm sorry to hear that. I can help troubleshoot. Could you tell me what model of laptop you have and approximately how old it is?"
  },
  {
    id: 3,
    role: 'user',
    content: "It's a Dell XPS 13, about two years old."
  },
  {
    id: 4,
    role: 'assistant',
    content:
      "Thanks. Have you noticed whether the battery drains even when you're doing light tasks like browsing the web, or only during heavier workloads?"
  },
  {
    id: 5,
    role: 'user',
    content: 'Mostly browsing, Slack, and Spotify. It used to last almost a full workday.'
  },
  {
    id: 6,
    role: 'assistant',
    content:
      'Understood. A sudden drop like that is worth investigating. Have you recently installed any new software or updated Windows?'
  },
  {
    id: 7,
    role: 'user',
    content: 'Windows installed an update last week, and I also downloaded DaVinci Resolve.'
  },
  {
    id: 8,
    role: 'assistant',
    content:
      "Thanks. Sometimes Windows updates perform background tasks for a day or two, and creative software can install services that run in the background. Could you open Task Manager and tell me what's using the most CPU?"
  },
  {
    id: 9,
    role: 'user',
    content:
      "Chrome is around 7%, Windows Modules Installer is around 14%, and Resolve isn't running."
  },
  {
    id: 10,
    role: 'assistant',
    content:
      "That Windows process suggests update-related work is still happening. It should settle down once everything finishes. Let's also check your battery health."
  },
  {
    id: 11,
    role: 'user',
    content: 'How do I do that?'
  },
  {
    id: 12,
    role: 'assistant',
    content:
      "Open Command Prompt and run `powercfg /batteryreport`. It will generate an HTML report showing your battery's design capacity and current full charge capacity."
  },
  {
    id: 13,
    role: 'user',
    content:
      'The report says the design capacity is 52,000 mWh and the full charge capacity is 39,100 mWh.'
  },
  {
    id: 14,
    role: 'assistant',
    content:
      "Thanks. That means your battery is retaining about 75% of its original capacity. That's fairly typical after two years, although it will reduce runtime."
  },
  {
    id: 15,
    role: 'user',
    content: "Is that enough to explain why I'm only getting around 3 hours?"
  },
  {
    id: 16,
    role: 'assistant',
    content:
      "Probably not by itself. A 25% reduction in capacity shouldn't usually cut runtime by more than half, so it's likely that background activity is contributing as well."
  },
  {
    id: 17,
    role: 'user',
    content: "What's the next thing I should check?"
  },
  {
    id: 18,
    role: 'assistant',
    content:
      "I'd recommend checking the Battery Usage page in Windows Settings. It can show which apps have been consuming the most power over the last 24 hours."
  },
  {
    id: 19,
    role: 'user',
    content: 'Chrome is at 38%, Slack is 18%, and Screen is 22%.'
  },
  {
    id: 20,
    role: 'assistant',
    content: 'Those numbers look fairly normal. How bright do you typically keep your display?'
  },
  {
    id: 21,
    role: 'user',
    content: 'Usually around 90%. I work near a window.'
  },
  {
    id: 22,
    role: 'assistant',
    content:
      'Running at high brightness can have a noticeable impact on battery life. If possible, try lowering it to around 60–70% and see whether that improves things.'
  },
  {
    id: 23,
    role: 'user',
    content: "I'll try that tomorrow."
  },
  {
    id: 24,
    role: 'assistant',
    content:
      "Great. I'd also suggest enabling Battery Saver when you're unplugged. It reduces background activity and can extend runtime."
  },
  {
    id: 25,
    role: 'user',
    content: "I don't think I've ever used Battery Saver."
  },
  {
    id: 26,
    role: 'assistant',
    content:
      'You can enable it from Quick Settings or configure it to turn on automatically below a certain battery percentage in Settings > System > Power & Battery.'
  },
  {
    id: 27,
    role: 'user',
    content: 'Would updating the BIOS help?'
  },
  {
    id: 28,
    role: 'assistant',
    content:
      "It can. Manufacturers sometimes release BIOS and firmware updates that improve power management or battery performance. Since you have a Dell XPS, it's worth checking Dell SupportAssist or Dell's support website."
  },
  {
    id: 29,
    role: 'user',
    content: "I haven't updated the BIOS since I bought it."
  },
  {
    id: 30,
    role: 'assistant',
    content:
      "In that case, I'd recommend checking for updates. Just make sure the laptop is plugged into power during the update process."
  },
  {
    id: 31,
    role: 'user',
    content: 'If none of this helps, should I replace the battery?'
  },
  {
    id: 32,
    role: 'assistant',
    content:
      "If you've ruled out software causes and battery health continues to decline, replacing the battery is a reasonable next step. It should restore battery life much closer to its original level."
  },
  {
    id: 33,
    role: 'user',
    content: 'Does Dell usually sell replacement batteries?'
  },
  {
    id: 34,
    role: 'assistant',
    content:
      "Yes. Dell offers genuine replacement batteries for many models. I'd recommend purchasing directly from Dell or an authorized reseller to ensure compatibility and quality."
  },
  {
    id: 35,
    role: 'user',
    content: 'Is replacing it something I can do myself?'
  },
  {
    id: 36,
    role: 'assistant',
    content:
      "For many XPS models, it's a relatively straightforward repair if you're comfortable removing the bottom cover. Dell also provides service manuals with step-by-step instructions."
  },
  {
    id: 37,
    role: 'user',
    content: "Good to know. I'll try the software fixes first."
  },
  {
    id: 38,
    role: 'assistant',
    content:
      'That sounds like a good approach. Monitor battery life for a few days after the Windows background processes finish and after adjusting your settings.'
  },
  {
    id: 39,
    role: 'user',
    content: 'Thanks for walking me through everything!'
  },
  {
    id: 40,
    role: 'assistant',
    content:
      "You're very welcome! If the battery life is still much lower than expected after trying these steps, feel free to come back with an updated battery report and I'd be happy to help you investigate further."
  }
];

const PAGE_SIZE = 10;

function renderAsyncMessage(msg: AsyncMessage) {
  if (msg.role === 'user') {
    return (
      <ThreadItem textValue={msg.content} styles={style({display: 'flex', justifyContent: 'end'})}>
        <UserMessage>{msg.content}</UserMessage>
      </ThreadItem>
    );
  }
  return (
    <ThreadItem textValue={msg.content} styles={style({font: 'body'})}>
      {msg.content}
    </ThreadItem>
  );
}

function useAsyncMessages() {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [messages, setMessages] = useState<AsyncMessage[]>(ALL_HISTORY.slice(-PAGE_SIZE));
  const [hasMore, setHasMore] = useState(ALL_HISTORY.length - PAGE_SIZE > 0);
  const isLoadingRef = useRef(false);
  const cursorRef = useRef(ALL_HISTORY.length - PAGE_SIZE);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || cursorRef.current <= 0) {
      return;
    }
    isLoadingRef.current = true;
    setIsLoadingMore(true);

    await new Promise<void>(r => setTimeout(r, 2000));

    const nextCursor = Math.max(0, cursorRef.current - PAGE_SIZE);
    const older = ALL_HISTORY.slice(nextCursor, cursorRef.current);
    cursorRef.current = nextCursor;
    setHasMore(nextCursor > 0);

    setMessages(prev => [...older, ...prev]);
    setIsLoadingMore(false);
    isLoadingRef.current = false;
  }, []);

  return {messages, isLoadingMore, handleLoadMore, hasMore};
}

export function AsyncLoadingChat() {
  const {messages, isLoadingMore, handleLoadMore, hasMore} = useAsyncMessages();

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
            aria-label="Chat"
            styles={style({
              flexGrow: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              padding: 8,
              scrollPadding: 8,
              rowGap: 16
            })}>
            <ThreadLoadMoreItem
              isLoading={isLoadingMore}
              onLoadMore={hasMore ? handleLoadMore : undefined}>
              <div className={style({display: 'flex', justifyContent: 'center', padding: 8})}>
                <ProgressCircle aria-label="Loading older messages" isIndeterminate />
              </div>
            </ThreadLoadMoreItem>
            <Collection items={messages}>{renderAsyncMessage}</Collection>
          </Thread>
        </div>
        <PromptField>
          <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
            <PromptTokenField />
            <PromptFieldSubmitButton />
          </div>
        </PromptField>
      </Chat>
    </div>
  );
}
