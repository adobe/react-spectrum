import {ActionButton} from '@react-spectrum/s2/ActionButton';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import ChevronDown from '@react-spectrum/s2/icons/ChevronDown';
import {getIcon} from './promptfield';
import {
  Chat,
  ExecutionTrace,
  ExecutionTraceItem,
  MessageFeedback,
  MessageSuggestion,
  MessageSuggestionList,
  ResponseStatus,
  ResponseStatusPanel,
  ResponseStatusTitle,
  Thread,
  ThreadItem,
  ThreadScrollButton,
  TokenFieldValue,
  UserMessage
} from '@react-spectrum/ai';
import * as loaders from '@react-spectrum/ai/loader';
import {prose} from '@react-spectrum/ai/style' with {type: 'macro'};
import {ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

let initialResponses = [
  {
    id: 0,
    type: 'user',
    content: 'Can you help me plan a short trip to the mountains this weekend?'
  },
  {
    id: 1,
    type: 'system',
    content: 'Sure! How many days do you have, and do you prefer hiking, skiing, or just relaxing?'
  },
  {
    id: 2,
    type: 'user',
    content: 'Two days, and I want a mix of hiking and relaxing.'
  },
  {
    id: 3,
    type: 'system',
    content:
      'Day one: a moderate morning hike with a scenic overlook, then lunch in town. Day two: a slow start, a short walk, and time to unwind before heading back.'
  }
];

interface ExecutionStep {
  id: number;
  label: string;
  status: 'pending' | 'success';
  detail?: string;
}

type StreamingMessage =
  | {id: number | string; type: 'user'; content: string}
  | {id: number | string; type: 'system'; content: string; isStreaming?: boolean}
  | {
      id: number | string;
      type: 'status';
      status: 'pending' | 'success';
      steps: ExecutionStep[];
    }
  | {id: number | string; type: 'suggestions'; suggestions: TokenFieldValue[]};

export interface VirtualizedStreamingChatProps {
  children: (onSend: (prompt: TokenFieldValue) => void, isGenerating: boolean) => ReactNode;
  /** Suggestions shown at the end of the thread. Hidden while a response is streaming in. */
  suggestions?: TokenFieldValue[];
  onSelectSuggestion?: (suggestion: TokenFieldValue) => void;
}

export function VirtualizedStreamingChat(props: VirtualizedStreamingChatProps) {
  let {children, suggestions, onSelectSuggestion} = props;
  let [messages, setMessages] = useState<StreamingMessage[]>(
    initialResponses as StreamingMessage[]
  );
  let nextId = useRef(initialResponses.length);
  let [isGenerating, setGenerating] = useState(false);
  let timeouts = useRef<NodeJS.Timeout[]>([]);

  function handleSend(prompt: TokenFieldValue) {
    setGenerating(true);
    // user message added first so its announcement plays before the status updates
    setMessages(prev => [
      ...prev,
      {id: nextId.current++, type: 'user', content: prompt.toString()}
    ]);

    // Starts a new grouped status message containing a single pending execution trace step.
    function startToolGroup(label: string) {
      setMessages(prev => [
        ...prev,
        {
          id: nextId.current++,
          type: 'status',
          status: 'pending',
          steps: [{id: nextId.current++, label, status: 'pending'}]
        }
      ]);
    }

    // Adds a new step to the trailing status group if one is still open, otherwise starts a new group.
    function addStep(label: string) {
      setMessages(prev => {
        let last = prev[prev.length - 1];
        let newStep: ExecutionStep = {id: nextId.current++, label, status: 'pending'};
        if (last?.type === 'status' && last.status === 'pending') {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              steps: [
                ...last.steps.slice(0, -1),
                {...last.steps[last.steps.length - 1], status: 'success'},
                newStep
              ]
            }
          ];
        }
        return [
          ...prev,
          {id: nextId.current++, type: 'status', status: 'pending', steps: [newStep]}
        ];
      });
    }

    // Completes the last step of the trailing status group.
    function completeStep(detail: string) {
      setMessages(prev => {
        let last = prev[prev.length - 1];
        if (last?.type !== 'status') {
          return prev;
        }
        let steps = last.steps.slice();
        let step = steps[steps.length - 1];
        steps[steps.length - 1] = {...step, status: 'success', detail};
        return [...prev.slice(0, -1), {...last, steps}];
      });
    }

    // Marks the trailing status group as complete once all of its steps have finished.
    function completeGroup() {
      setMessages(prev => {
        let last = prev[prev.length - 1];
        if (last?.type !== 'status') {
          return prev;
        }
        return [...prev.slice(0, -1), {...last, status: 'success'}];
      });
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
          let isLastToken = i === tokens.length - 1;
          setMessages(prev =>
            prev.map(m =>
              m.type === 'system' && m.isStreaming
                ? {...m, content: accumulated, isStreaming: !isLastToken}
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

    let timestamp = 0;
    let toolCallDuration = 1000;
    // Status added after a short delay so the user message announcement plays first.
    addTimeout(() => startToolGroup('Searching Yelp'), (timestamp += 500));
    addTimeout(
      () => completeStep('Found 12 restaurants near the trailhead.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => addStep('Searching Google Maps'), (timestamp += 500));
    addTimeout(
      () => completeStep('Compared ratings and walking distances.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => addStep('Searching TripAdvisor'), (timestamp += 500));
    addTimeout(
      () => completeStep('Checked recent reviews for the top matches.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => addStep('Filtering by distance'), (timestamp += 500));
    addTimeout(
      () => completeStep('Narrowed the list down to places within range.'),
      (timestamp += toolCallDuration)
    );
    addTimeout(() => completeGroup(), (timestamp += 200));

    let replyContent =
      'A few good options within range: Trailhead Café for a quick bite, Base Camp Diner for ' +
      'something heartier, and Riverside Grill if you want a sit-down meal.';
    addTimeout(() => streamText(replyContent), (timestamp += 500));

    let streamEndTimestamp = timestamp + (replyContent.split(' ').length - 1) * 80 + 500;
    addTimeout(() => setGenerating(false), streamEndTimestamp);
  }

  useEffect(
    () => () => {
      timeouts.current.forEach(clearTimeout);
    },
    []
  );

  let items = useMemo<StreamingMessage[]>(() => {
    if (isGenerating || !suggestions) {
      return messages;
    }
    return [...messages, {id: 'suggestions', type: 'suggestions', suggestions}];
  }, [messages, isGenerating, suggestions]);

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
            items={items}
            aria-label="Chat thread"
            styles={style({
              flexGrow: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              scrollPadding: 8
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
                return <StatusThreadItem msg={msg} />;
              }
              if (msg.type === 'suggestions') {
                return (
                  <ThreadItem textValue="Suggestions">
                    <MessageSuggestionList title="Suggestions" styles={style({marginTop: 40})}>
                      {msg.suggestions.map((s, i) => (
                        <MessageSuggestion key={i} onPress={() => onSelectSuggestion?.(s)}>
                          <SuggestionLabel value={s} />
                        </MessageSuggestion>
                      ))}
                    </MessageSuggestionList>
                  </ThreadItem>
                );
              }
              return (
                <ThreadItem textValue={msg.content} isStreaming={msg.isStreaming}>
                  <div role="document">
                    <p className={prose()}>{msg.content || ''}</p>
                  </div>
                  {!msg.isStreaming && <MessageFeedback />}
                </ThreadItem>
              );
            }}
          </Thread>
        </div>
        {children(handleSend, isGenerating)}
      </Chat>
    </div>
  );
}

function StatusThreadItem({msg}: {msg: Extract<StreamingMessage, {type: 'status'}>}) {
  let isStreaming = msg.status === 'pending';
  let lastStep = msg.steps[msg.steps.length - 1];
  let title = isStreaming
    ? `${lastStep.label}…`
    : msg.steps.length > 1
      ? `Completed ${msg.steps.length} steps`
      : lastStep.label;
  let announcement = isStreaming ? `${lastStep.label}…` : `${title} complete`;
  return (
    <ThreadItem textValue={announcement} isStreaming={isStreaming} shouldAnnounceOnMount>
      <ResponseStatus status={isStreaming ? 'pending' : 'success'}>
        <ResponseStatusTitle pixelLoader={loaders.mega}>{title}</ResponseStatusTitle>
        <ResponseStatusPanel>
          <ExecutionTrace>
            {msg.steps.map(step => (
              <ExecutionTraceItem
                key={step.id}
                status={step.status}
                detail={
                  step.detail && (
                    <p className={style({font: 'body-sm', margin: 0})}>{step.detail}</p>
                  )
                }>
                {step.label}
              </ExecutionTraceItem>
            ))}
          </ExecutionTrace>
        </ResponseStatusPanel>
      </ResponseStatus>
    </ThreadItem>
  );
}

let suggestionToken = style({
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
});

function SuggestionLabel({value}: {value: TokenFieldValue}) {
  return (
    <>
      {value.segments.map((seg, i) =>
        seg.type === 'token' ? (
          <span
            key={i}
            className={suggestionToken({isPlaceholder: seg.value?.type === 'placeholder'})}>
            {getIcon(seg) && <CenterBaseline>{getIcon(seg)}</CenterBaseline>}
            {seg.text}
          </span>
        ) : (
          seg.text
        )
      )}
    </>
  );
}
