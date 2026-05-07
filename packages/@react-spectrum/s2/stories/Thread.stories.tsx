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

import {ActionButton} from '../src/ActionButton';
import {ActionMenu} from '../src/ActionMenu';
import {AssetCard} from '../src/Card';
import {baseColor, css, focusRing, style} from '../style' with {type: 'macro'};
import {Button} from '../src/Button';
import {ButtonContext, GridListItem, Group, isFileDropItem, Label, Tag, TagGroup, TagList, TextArea, TextField, useDrop} from 'react-aria-components';
import {Card, CardPreview} from '../src/Card';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import ChevronRight from '@react-spectrum/s2/icons/ArrowCurved';
import {CloseButton} from '../src/CloseButton';
import {Content, Text} from '../src/Content';
import {Disclosure, DisclosureHeader, DisclosurePanel, DisclosureTitle} from '../src/Disclosure';
import {Image} from '../src/Image';
import {Link, LinkProps} from '../src/Link';
import {MenuItem} from '../src/Menu';
import type {Meta} from '@storybook/react';
import Plus from '@react-spectrum/s2/icons/Add';
import {ProgressCircle} from '../src/ProgressCircle';
import {ReactNode, useRef, useState} from 'react';
import Send from '@react-spectrum/s2/icons/ArrowUpSend';
import {Thread} from '../src/Thread';
import ThumbDown from '@react-spectrum/s2/icons/ThumbDown';
import ThumbUp from '@react-spectrum/s2/icons/ThumbUp';
import {ToggleButton} from '../src/ToggleButton';
import {ToggleButtonGroup} from '../src/ToggleButtonGroup';

const meta: Meta<typeof Thread> = {
  component: Thread,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'Thread',
  decorators: [
    (Story) => (
      <div style={{width: '600px', height: '700px'}}>
        <Story />
      </div>
    )
  ]
};

export default meta;
// type Story = StoryObj<typeof Thread>;

export function StaticThread() {
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
      <Thread>
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
        </UserMessage >
        <UserMessage>Can you help me create a 45-minute presentation, with animations, for an executive update?</UserMessage>
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
        <UserMessage>Can you help me create a 45-minute presentation, with animations, for an executive update?</UserMessage>
        <ResponseStatus status="complete" thinking="The user said make a presentation deck but didn’t specify duration of deck. Assumption is a brief presentation. I should check previous Hilton executive presentation decks and extract the structure." />
        <SystemMessage>
          <div role="document">
            <h3 className={style({font: 'heading-sm'})}>Big idea/core narrative: The warmth of welcome</h3>
            <p className={style({font: 'body'})}>Hospitality begins the moment our customers set foot off their plane. We are more than accommodation, and we service a diverse base. We hope to be the anchor and bounce board for all who stay with us. </p>
            <h4 className={style({font: 'heading-xs'})}>Belonging happens at Hilton</h4>
            <p className={style({font: 'body'})}>We strive to be familiar but exceed expectations. These assets highlight how belonging is personified.</p>
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
        <UserMessage>Can you help me create a 45-minute presentation, with animations, for an executive update?</UserMessage>
        <ResponseStatus status="pending" />
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
      </Thread>
      <PromptField />
    </div>
  );
}

let dummyResponses = [
  "Sure! Here's a summary of the key points based on the assets you shared. The main themes revolve around brand consistency, audience engagement, and clear calls to action across all touchpoints.",
  'Great question. Based on the context provided, I recommend focusing on the narrative arc first, then layering in supporting visuals and data to reinforce the core message.',
  "I've analyzed the content and identified three main opportunities: improving visual hierarchy, strengthening the headline, and adding a clearer value proposition in the opening section."
];

type Message =
  | {id: number, type: 'user' | 'system', content: string}
  | {id: number, type: 'status', status: 'pending' | 'complete'};

export function DynamicThread() {
  let [messages, setMessages] = useState<Message[]>([]);
  let nextId = useRef(0);
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
        margin: 0,
        marginX: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        height: '100%'
      })}>
      <Thread items={messages}>
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
      </Thread>
      <PromptField onSend={handleSend} isDisabled={isPending} />
    </div>
  );
}

// TODO: all of the below was copied from rsp-prototypes, just filler for now
function PromptField({onSend, isDisabled}: {onSend?: (text: string) => void, isDisabled?: boolean}) {
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
  let inputRef = useRef(null);
  let {dropProps, dropButtonProps, isDropTarget} = useDrop({
    ref: inputRef,
    hasDropButton: true,
    async onDrop(e) {
      let files = await Promise.all(e.items.filter(isFileDropItem).map(async item => ({
        image: item.type.startsWith('image/') ? URL.createObjectURL(await item.getFile()) : '',
        title: item.name,
        description: item.type
      })));
      setAttachments(attachments => [...attachments, ...files]);
    }
  });

  return (
    <div>
      <Group
        {...dropProps}
        role="group"
        className={renderProps => style({
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
        })({...renderProps, isDropTarget})}>
        <AttachmentList>
          {attachments.map((attachment, i) => (
            <Attachment
              {...attachment}
              key={i}
              id={i}
              onRemove={() => {
                setAttachments(attachments.slice(0, i).concat(attachments.slice(i + 1)));
              }} />
          ))}
        </AttachmentList>
        <TextField value={text} onChange={(value) => setText(value)}>
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
            })} />
        </TextField>
        <div className={style({display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16})}>
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
            }}>
            <Send />
          </Button>
        </div>
      </Group>
      <p className={style({font: 'ui-sm', textAlign: 'center'})}>Responses are generated using AI, and may be inaccurate. Check before using. <Link variant="secondary" href="https://www.adobe.com/legal/licenses-terms/adobe-gen-ai-user-guidelines.html" target="_blank">AI User Guidelines</Link></p>
    </div>
  );
}

function AttachmentList({children}: { children: ReactNode }) {
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

function Attachment({id, image, title, description, onRemove}: {id: number, image: string, title: string, description: string, onRemove: () => void}) {
  return (
    <Tag id={id} textValue={title} className={style({...focusRing(), borderRadius: 'default'})}>
      {/* TODO: support rendering cards as tags/gridlist items directly */}
      <Card variant="secondary">
        {/* TODO: horizontal cards */}
        <div className={style({display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'center'})}>
          {image && <Image
            src={image}
            styles={style({borderRadius: 'default', objectFit: 'cover', height: 50, width: 50})} />}
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
              styles={style({alignSelf: 'start', marginTop: -12, marginEnd: -12})} />
          </ButtonContext>
        </div>
      </Card>
    </Tag>
  );
}


function UserMessage({children, textValue = ' '}: {children: ReactNode, textValue?: string}) {
  return (
    <GridListItem
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
    </GridListItem>
  );
}

function SystemMessage({children, textValue = ' '}: {children: ReactNode, textValue?: string}) {
  return (
    <GridListItem textValue={textValue} className={style({...focusRing(), borderRadius: 'default'})}>
      {children}
    </GridListItem>
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

function ResponseStatus({status, thinking}: { status: 'pending' | 'complete', thinking?: string }) {
  switch (status) {
    case 'pending':
      return (
        // TODO: check announcement w/ and w/o the textValue
        <GridListItem textValue="Generating response" className={style({...focusRing(), borderRadius: 'sm', display: 'flex', alignItems: 'center', gap: 8})}>
          <ProgressCircle isIndeterminate size="S" aria-label="Generating response" />
          <span className={style({font: 'ui', color: 'neutral-subdued'})}>Generating response...</span>
        </GridListItem>
      );
    case 'complete':
      return (
        // TODO: maybe we need focusMode="child"?
        // TODO: check announcement w/ and w/o the textValue, if it autofocused the child that would change behavior
        <GridListItem textValue="Response generated" className={style({...focusRing(), borderRadius: 'default', display: 'flex', alignItems: 'center', gap: 8})}>
          {thinking
            ? (
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
            )
            : (
              <>
                <span className={style({font: 'ui', color: 'neutral-subdued'})}>Generating response...</span>
                <CheckmarkCircle />
              </>
            )
          }
        </GridListItem>
      );
  }
}

function Sources({children}: {children: ReactNode}) {
  return (
    <Disclosure size="S" isQuiet styles={style({marginTop: 8})}>
      <DisclosureHeader UNSAFE_style={{width: 'fit-content'}}>
        <DisclosureTitle>Sources</DisclosureTitle>
      </DisclosureHeader>
      <DisclosurePanel>
        {children}
      </DisclosurePanel>
    </Disclosure>
  );
}

function SourceList({children}: {children: ReactNode}) {
  return (
    <ol style={{counterReset: 'step'}} className={style({display: 'flex', flexDirection: 'column', rowGap: 4, paddingStart: 0, margin: 0})}>
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
        className={css('&::before { content: counter(step) }') + style({
          fontWeight: 'normal',
          borderRadius: 'sm',
          backgroundColor: 'gray-100',
          display: 'inline-block',
          paddingX: 8,
          height: '[1lh]',
          textAlign: 'center',
          font: 'body-sm',
          marginEnd: 8
        })} />
      <Link {...props} variant="secondary" isStandalone />
    </li>
  );
}
