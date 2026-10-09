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
  Alert,
  AttachFileMenuItem,
  Attachment,
  AttachmentGrid,
  AttachmentGridItem,
  AttachmentPreview,
  Chat,
  ExecutionTrace,
  ExecutionTraceItem,
  InsertMenuButton,
  InsertTokenMenuItem,
  MessageFeedback,
  MessageSource,
  MessageSuggestion,
  MessageSuggestionList,
  PromptField,
  PromptFieldAttachment,
  PromptFieldAttachmentList,
  PromptFieldSubmitButton,
  PromptFieldToolbar,
  PromptFieldValue,
  PromptToken,
  PromptTokenField,
  ResponseStatus,
  ResponseStatusPanel,
  ResponseStatusTitle,
  SourceList,
  SourceListItem,
  Thread,
  ThreadItem,
  ThreadLoadMoreItem,
  UserMessage
} from '@react-spectrum/ai';
import {Button} from '@react-spectrum/s2/Button';
import {Collection} from 'react-aria-components';
import {Content} from '@react-spectrum/s2/Content';
import {
  createScenarioState,
  Scenario,
  ScenarioAsset,
  scenarioDetails,
  ScenarioFile,
  ScenarioMessage,
  scenarioReducer
} from './chatScenarioData';
import {Dialog, DialogTrigger} from '@react-spectrum/s2/Dialog';
import type {FocusableRefValue} from '@react-types/shared';
import {Heading} from '@react-spectrum/s2/Heading';
import type {Meta, StoryObj} from '@storybook/react';
import {ProgressCircle} from '@react-spectrum/s2/ProgressCircle';
import {prose} from '../src/style/prose' with {type: 'macro'};
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';
import {useEffect, useReducer, useRef, useState} from 'react';

interface ConversationProps {
  scenario: Scenario;
  streamDelay: number;
}

const meta: Meta<ConversationProps> = {
  title: 'AI/Chat/Conversations',
  excludeStories: ['Conversation'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Six interactive, scripted conversations. Send the suggested requests or type related follow-ups. Sending during generation redirects the response; Option/Alt+Enter queues a follow-up. Reset restores the fixture. Files remain local and responses use mock data, not a live AI service.'
      }
    }
  },
  argTypes: {
    scenario: {table: {disable: true}},
    streamDelay: {
      control: {type: 'range', min: 20, max: 300, step: 20},
      description:
        'Milliseconds between five-word streaming chunks. Tool steps take four times this delay.'
    }
  },
  args: {streamDelay: 120},
  render: args => <Conversation key={args.scenario} {...args} />,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<ConversationProps>;

export const ResearchWithSources: Story = {args: {scenario: 'research'}};
export const BringYourOwnContext: Story = {args: {scenario: 'context'}};
export const FindAssets: Story = {args: {scenario: 'assets'}};
export const InterruptAndRedirect: Story = {args: {scenario: 'interrupt', streamDelay: 200}};
export const FailureRecovery: Story = {args: {scenario: 'recovery'}};
export const LongConversation: Story = {args: {scenario: 'history'}};

function assetPreview(asset: ScenarioAsset): string {
  let colors = asset.id === 'dunes' ? ['#eacda3', '#ae8b62'] : ['#c3e7f0', '#467968'];
  let people = asset.people
    ? '<circle cx="145" cy="105" r="10" fill="#263648"/><path d="M145 120v40m-20-20 20-20 20 20m-20 20-15 25m15-25 15 25" stroke="#263648" stroke-width="8" fill="none"/>'
    : '';
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="${colors[0]}"/><circle cx="245" cy="45" r="25" fill="#ffdb8b"/><path d="M0 140Q70 70 160 135T320 100V200H0Z" fill="${colors[1]}"/>${people}</svg>`)}`;
}

function fileSnapshot(attachment: PromptFieldAttachment): ScenarioFile {
  return {
    id: attachment.id,
    name: attachment.file.name,
    mimeType: attachment.file.type,
    image: attachment.image
  };
}

function FileGrid({files, onAction}: {files: ScenarioFile[]; onAction?: (name: string) => void}) {
  return (
    <AttachmentGrid aria-label="Conversation attachments" align="end">
      {files.map(file => (
        <AttachmentGridItem
          key={file.id}
          id={file.id}
          textValue={file.name}
          aria-label={file.name}
          onAction={onAction ? () => onAction(file.name) : undefined}>
          <AttachmentPreview slot="thumbnail" mimeType={file.mimeType} src={file.image} />
          <Content>
            <Text slot="title">{file.name}</Text>
            <Text slot="description">{file.mimeType}</Text>
          </Content>
        </AttachmentGridItem>
      ))}
    </AttachmentGrid>
  );
}

export function Conversation({scenario, streamDelay}: ConversationProps) {
  let [state, dispatch] = useReducer(scenarioReducer, scenario, createScenarioState);
  let details = scenarioDetails[scenario];
  let [prompt, setPrompt] = useState(
    () => new PromptFieldValue([{type: 'text', text: details.prompt}])
  );
  let [attachments, setAttachments] = useState<PromptFieldAttachment[]>([]);
  let [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  let [composerError, setComposerError] = useState('');
  let [isLoadingMore, setLoadingMore] = useState(false);
  let fieldRef = useRef<FocusableRefValue<HTMLDivElement>>(null);
  let objectURLs = useRef(new Set<string>());
  let attachmentId = useRef(0);
  let isGenerating = state.active !== null;

  useEffect(() => {
    if (!state.active) {
      return;
    }
    let timeout = setTimeout(
      () => dispatch({type: 'tick', run: state.run}),
      streamDelay * (state.active.answerId === undefined ? 4 : 1)
    );
    return () => clearTimeout(timeout);
  }, [state.active, state.run, streamDelay]);

  useEffect(() => {
    if (!isLoadingMore) {
      return;
    }
    let timeout = setTimeout(() => {
      dispatch({type: 'history'});
      setLoadingMore(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, [isLoadingMore]);

  let isUploading = Object.values(uploadProgress).some(progress => progress < 100);
  useEffect(() => {
    if (!isUploading) {
      return;
    }
    let timeout = setTimeout(
      () =>
        setUploadProgress(progress =>
          Object.fromEntries(
            Object.entries(progress).map(([id, value]) => [id, Math.min(100, value + 20)])
          )
        ),
      200
    );
    return () => clearTimeout(timeout);
  }, [isUploading, uploadProgress]);

  useEffect(() => {
    let urls = objectURLs.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function changeAttachments(files: PromptFieldAttachment[]) {
    files.forEach(file => {
      if (file.image.startsWith('blob:')) {
        objectURLs.current.add(file.image);
      }
    });
    setAttachments(files);
    setUploadProgress(progress =>
      Object.fromEntries(files.map(file => [file.id, progress[file.id] ?? 0]))
    );
    setComposerError('');
  }

  function addSampleContext(invalid = false) {
    let id = `sample-${attachmentId.current++}`;
    let files: PromptFieldAttachment[] = invalid
      ? [{id, file: new File([], 'Unreadable brief.pdf', {type: 'application/pdf'}), image: ''}]
      : [
          {
            id,
            file: new File(['Demo brief: welcome first-time trail runners.'], 'Summer brief.pdf', {
              type: 'application/pdf'
            }),
            image: ''
          },
          {
            id: `${id}-image`,
            file: new File(['Demo image fixture'], 'Coastal reference.svg', {
              type: 'image/svg+xml'
            }),
            image: assetPreview({
              id: 'coast',
              name: 'Coastal reference',
              orientation: 'landscape',
              people: false,
              description: ''
            })
          }
        ];
    changeAttachments([...attachments, ...files]);
  }

  function send(text: string, files = attachments, queue = false) {
    if (!text.trim()) {
      setComposerError('Enter a request before sending.');
      fieldRef.current?.focus();
      return;
    }
    if (files.some(file => file.file.size === 0)) {
      setComposerError(
        'Unreadable attachment. Remove the empty file or replace it before sending.'
      );
      return;
    }
    if (files.some(file => (uploadProgress[file.id] ?? 100) < 100)) {
      setComposerError('Wait for the simulated upload to finish before sending.');
      return;
    }
    dispatch({
      type: 'send',
      text,
      files: files.map(fileSnapshot),
      references:
        text === prompt.toString()
          ? prompt.segments.filter(segment => segment.type === 'token').map(segment => segment.text)
          : [],
      queue
    });
    setPrompt(new PromptFieldValue([]));
    setAttachments([]);
    setUploadProgress({});
    setComposerError('');
    fieldRef.current?.focus();
  }

  function reset() {
    dispatch({type: 'reset'});
    setPrompt(new PromptFieldValue([{type: 'text', text: details.prompt}]));
    setAttachments([]);
    setUploadProgress({});
    setComposerError('');
    setLoadingMore(false);
    objectURLs.current.forEach(url => URL.revokeObjectURL(url));
    objectURLs.current.clear();
  }

  function renderMessage(message: ScenarioMessage) {
    switch (message.type) {
      case 'user':
        return (
          <ThreadItem
            textValue={message.text}
            styles={style({display: 'flex', justifyContent: 'end'})}>
            <UserMessage>
              <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
                {!!message.files?.length && <FileGrid files={message.files} />}
                <div>{message.text}</div>
                {message.queued && <small>Queued follow-up</small>}
              </div>
            </UserMessage>
          </ThreadItem>
        );
      case 'assistant':
        return (
          <ThreadItem
            textValue={message.text || 'Generating response'}
            isStreaming={message.isStreaming}>
            <div role="document" className={prose()}>
              {message.text.split('\n\n').map((paragraph, i) =>
                paragraph.startsWith('- ') ? (
                  <ul key={i}>
                    {paragraph.split('\n').map(item => (
                      <li key={item}>{item.slice(2)}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{paragraph}</p>
                )
              )}
              {message.stopped && (
                <p>
                  <em>Response stopped before completion.</em>
                </p>
              )}
            </div>
            {!!message.sources?.length && (
              <MessageSource label="Sources">
                <SourceList>
                  {message.sources.map(item => (
                    <DialogTrigger key={item.title}>
                      <SourceListItem>{item.title}</SourceListItem>
                      <Dialog size="S" isDismissible>
                        <Heading slot="title">{item.title}</Heading>
                        <Content>
                          <p>{item.content}</p>
                        </Content>
                      </Dialog>
                    </DialogTrigger>
                  ))}
                </SourceList>
              </MessageSource>
            )}
            {!message.isStreaming && !message.stopped && (
              <MessageFeedback aria-label="Rate this response" />
            )}
          </ThreadItem>
        );
      case 'status':
        return (
          <ThreadItem
            textValue={message.text}
            isStreaming={message.status === 'pending'}
            shouldAnnounceOnMount>
            <ResponseStatus status={message.status}>
              <ResponseStatusTitle>{message.text}</ResponseStatusTitle>
              <ResponseStatusPanel>
                <ExecutionTrace>
                  {message.steps.map((step, i) => (
                    <ExecutionTraceItem key={i} status={step.status} detail={<p>{step.detail}</p>}>
                      {step.label}
                    </ExecutionTraceItem>
                  ))}
                </ExecutionTrace>
              </ResponseStatusPanel>
            </ResponseStatus>
          </ThreadItem>
        );
      case 'alert':
        return (
          <ThreadItem textValue={message.text} shouldAnnounceOnMount>
            <Alert variant="notice">
              <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
                <span>{message.text}</span>
                {message.retry && (
                  <Button
                    variant="secondary"
                    isDisabled={isGenerating || !state.failedRequest}
                    onPress={() => dispatch({type: 'retry'})}>
                    Retry paid-search report
                  </Button>
                )}
              </div>
            </Alert>
          </ThreadItem>
        );
      case 'assets':
        return (
          <ThreadItem
            textValue={`${message.text}: ${message.assets.map(asset => asset.name).join(', ')}`}>
            <AttachmentGrid aria-label={message.text}>
              {message.assets.map(asset => (
                <AttachmentGridItem
                  key={asset.id}
                  id={asset.id}
                  textValue={asset.name}
                  aria-label={asset.name}
                  onAction={() => send(`Tell me about the asset ${asset.name}`, [])}>
                  <AttachmentPreview
                    slot="thumbnail"
                    mimeType="image/svg+xml"
                    src={assetPreview(asset)}
                  />
                  <Content>
                    <Text slot="title">{asset.name}</Text>
                    <Text slot="description">{`${asset.orientation} / ${asset.people ? 'people' : 'no people'}`}</Text>
                  </Content>
                </AttachmentGridItem>
              ))}
            </AttachmentGrid>
          </ThreadItem>
        );
      case 'suggestions':
        return (
          <ThreadItem textValue={message.text}>
            <MessageSuggestionList title={message.text}>
              {message.suggestions.map(suggestion => (
                <MessageSuggestion key={suggestion} onPress={() => send(suggestion)}>
                  {suggestion}
                </MessageSuggestion>
              ))}
            </MessageSuggestionList>
          </ThreadItem>
        );
    }
  }

  return (
    <div
      className={style({display: 'flex', flexDirection: 'column', gap: 16})}
      style={{width: 'min(900px, 90vw)', height: 'min(850px, 90vh)'}}>
      <div
        className={style({
          display: 'flex',
          gap: 16,
          alignItems: 'start',
          justifyContent: 'space-between'
        })}>
        <div>
          <h2 className={style({font: 'heading-sm', margin: 0})}>{details.title}</h2>
          <p className={style({font: 'body-sm', marginY: 8})}>{details.description}</p>
          <p className={style({font: 'body-sm', color: 'neutral-subdued', margin: 0})}>
            Scripted demo. Files stay local; sources, results, and image previews are fixtures.
          </p>
        </div>
        <Button variant="secondary" onPress={reset}>
          Reset
        </Button>
      </div>
      <Chat styles={style({flexGrow: 1, minHeight: 0})}>
        <Thread aria-label={details.title}>
          {scenario === 'history' && (
            <ThreadLoadMoreItem
              isLoading={isLoadingMore}
              onLoadMore={state.historyCursor > 0 ? () => setLoadingMore(true) : undefined}>
              {isLoadingMore ? (
                <ProgressCircle aria-label="Loading earlier messages" isIndeterminate />
              ) : (
                <Button
                  variant="secondary"
                  isDisabled={state.historyCursor === 0}
                  onPress={() => setLoadingMore(true)}>
                  {state.historyCursor > 0 ? 'Load earlier messages' : 'Beginning of conversation'}
                </Button>
              )}
            </ThreadLoadMoreItem>
          )}
          <Collection
            items={state.messages}
            dependencies={[state.active, state.failedRequest, uploadProgress]}>
            {renderMessage}
          </Collection>
        </Thread>
        {composerError && <Alert variant="notice">{composerError}</Alert>}
        <PromptField
          ref={fieldRef}
          value={prompt}
          onChange={setPrompt}
          attachments={attachments}
          onAttachmentsChange={changeAttachments}
          acceptedAttachmentTypes={['application/pdf', 'image/*', 'text/plain']}
          onSubmit={value => send(value.toString())}
          isGenerating={isGenerating}
          onStop={() => dispatch({type: 'stop'})}>
          <PromptFieldAttachmentList dependencies={[uploadProgress]}>
            {attachment => (
              <Attachment
                textValue={attachment.file.name}
                isInvalid={attachment.file.size === 0}
                uploadProgress={uploadProgress[attachment.id]}>
                <AttachmentPreview mimeType={attachment.file.type} src={attachment.image} />
                <Content>
                  <Text slot="title">{attachment.file.name}</Text>
                </Content>
              </Attachment>
            )}
          </PromptFieldAttachmentList>
          <PromptTokenField
            aria-label="Message"
            placeholder={
              isGenerating
                ? 'Send to redirect; Option/Alt+Enter to queue'
                : 'Ask about the demo campaign'
            }
            onKeyDown={event => {
              if (event.key === 'Enter' && event.altKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                send(prompt.toString(), attachments, true);
              } else if (event.key === 'Escape' && isGenerating) {
                event.preventDefault();
                dispatch({type: 'stop'});
              }
            }}>
            {token => <PromptToken token={token}>{token.text}</PromptToken>}
          </PromptTokenField>
          <PromptFieldToolbar>
            <div className={style({display: 'flex', flexWrap: 'wrap', gap: 8})}>
              <InsertMenuButton>
                <AttachFileMenuItem />
                <InsertTokenMenuItem
                  token={{
                    type: 'token',
                    text: 'Summer collection',
                    value: {
                      type: 'custom',
                      anchor: '@',
                      valueType: 'campaign',
                      data: {title: 'Summer collection'}
                    }
                  }}>
                  <Text>Summer collection</Text>
                </InsertTokenMenuItem>
              </InsertMenuButton>
              {scenario === 'context' && (
                <>
                  <Button variant="secondary" onPress={() => addSampleContext()}>
                    Add sample context
                  </Button>
                  <Button variant="secondary" onPress={() => addSampleContext(true)}>
                    Add unreadable file
                  </Button>
                </>
              )}
              {isGenerating && (
                <>
                  <Button
                    variant="secondary"
                    isDisabled={!prompt.toString().trim()}
                    onPress={() => send(prompt.toString(), attachments, true)}>
                    Queue follow-up
                  </Button>
                  <Button variant="secondary" onPress={() => dispatch({type: 'stop'})}>
                    Stop response
                  </Button>
                </>
              )}
            </div>
            <PromptFieldSubmitButton />
          </PromptFieldToolbar>
        </PromptField>
      </Chat>
    </div>
  );
}
