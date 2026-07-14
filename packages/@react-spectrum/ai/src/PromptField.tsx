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
import {ToggleButton} from '@react-spectrum/s2/ToggleButton';
import {Tooltip, TooltipTrigger} from '@react-spectrum/s2/Tooltip';
import Attach from '@react-spectrum/s2/icons/Attach';
import Microphone from '@react-spectrum/s2/icons/Microphone';
import {Attachment, AttachmentList, AttachmentListProps} from './AttachmentList';
import {Autocomplete} from 'react-aria-components/Autocomplete';
import {Button} from '@react-spectrum/s2/Button';
import {Cell} from './loader/data';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import {
  color,
  css,
  iconStyle,
  style,
  StyleString
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {
  createContext,
  createRef,
  use,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Direction,
  Position,
  TokenFieldSegment,
  TokenSegment,
  TokenSegmentList,
  TokenSegmentListOptions
} from './TokenSegmentList';
import {IconContext} from '@react-spectrum/s2';
import {Image, Text} from '@react-spectrum/s2/Card';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isFileDropItem, useDrop} from 'react-aria-components/useDrop';
import {Link} from '@react-spectrum/s2/Link';
import {Menu, MenuItem, MenuItemProps, MenuTrigger} from '@react-spectrum/s2/Menu';
import {PixelLoader} from './loader/react';
import Plus from '@react-spectrum/s2/icons/Add';
import {Popover, PopoverProps} from '@react-spectrum/s2/Popover';
import {positionToDOMRange, setCursor, Token, TokenField, TokenProps} from './TokenField';
import {PromptFieldContainer} from './PromptFieldContainer';
import {PromptFocusContext} from './Chat';
import Send from '@react-spectrum/s2/icons/ArrowUpSend';
import Stop from '@react-spectrum/s2/icons/StopProcessing';
import {useControlledState} from 'react-stately/useControlledState';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useEffectEvent} from 'react-aria/private/utils/useEffectEvent';
import {useFocusWithin} from 'react-aria/useFocusWithin';
import {useVoiceInput, VoiceInputErrorCode} from './useVoiceInput';

export interface PromptFieldAttachment {
  id: string;
  file: File;
  image: string;
}

export interface PromptFieldProps {
  children: React.ReactNode;
  acceptedAttachmentTypes?: string[];
  // TODO: mirrors tokenfield, maybe should also be a generic too
  value?: TokenSegmentList;
  defaultValue?: TokenSegmentList;
  onChange?: (value: TokenSegmentList) => void;
  // TODO: discuss, I can imagine a case where we also want to prefill these
  attachments?: PromptFieldAttachment[];
  defaultAttachments?: PromptFieldAttachment[];
  onAttachmentsChange?: (attachments: PromptFieldAttachment[]) => void;
  onSubmit?: (prompt: TokenSegmentList, attachments: PromptFieldAttachment[]) => void;
  isGenerating?: boolean;
  onStop?: () => void;
  onAddAttachments?: (attachments: PromptFieldAttachment[]) => void;
  onRemoveAttachments?: (attachments: PromptFieldAttachment[]) => void;
  styles?: StyleString;
  variant?: 'balanced' | 'prominent' | 'subtle';
}

interface PromptFieldState {
  attachments: PromptFieldAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<PromptFieldAttachment[]>>;
  acceptedAttachmentTypes?: string[];
  prompt: TokenSegmentList;
  setPrompt: React.Dispatch<React.SetStateAction<TokenSegmentList>>;
  inputRef: React.RefObject<HTMLDivElement | null>;
  onSubmit?: () => void;
  onStop?: () => void;
  isGenerating: boolean;
  onAddAttachments?: (attachments: PromptFieldAttachment[]) => void;
  onRemoveAttachments?: (attachments: PromptFieldAttachment[]) => void;
  isListening: boolean;
  setListening: React.Dispatch<React.SetStateAction<boolean>>;
}

// TODO: make this customizable
const tokenRegex = /(?<=\s|^)(https?:\/\/)?(www\.)?([^/\s]+\.[a-z]{2,}(\/\S+)?)(?=\s)/g;
function tokenizeURLs(text: string): TokenFieldSegment[] {
  if (text.length === 0) {
    return [{type: 'text', text}];
  }

  tokenRegex.lastIndex = 0;

  let match: RegExpExecArray | null = null;
  let start = 0;
  let segments: TokenFieldSegment[] = [];
  while ((match = tokenRegex.exec(text))) {
    if (match.index > start) {
      segments.push({type: 'text', text: text.slice(start, match.index)});
    }
    segments.push({type: 'token', text: match[3], value: {type: 'url', url: match[0]}});
    start = match.index + match[0].length;
  }

  if (start < text.length) {
    segments.push({type: 'text', text: text.slice(start)});
  }

  return segments;
}

export class AutoLinkingSegmentList extends TokenSegmentList {
  // attempt to convert any text to url tokens if any
  constructor(tokens: readonly TokenFieldSegment[], options?: TokenSegmentListOptions) {
    let processedTokens: TokenFieldSegment[] = [];
    for (let seg of tokens) {
      if (seg.type === 'text') {
        processedTokens.push(...tokenizeURLs(seg.text));
      } else {
        processedTokens.push(seg);
      }
    }
    super(processedTokens, options);
  }

  tokenize(text: string): TokenFieldSegment[] {
    return tokenizeURLs(text);
  }
}

const PromptFieldContext = createContext<PromptFieldState>({
  attachments: [],
  setAttachments: () => {},
  prompt: new AutoLinkingSegmentList([]),
  setPrompt: () => {},
  inputRef: createRef(),
  isGenerating: false,
  isListening: false,
  setListening: () => {}
});

// to communicate the anchor position to the menu items in the completion popover
// need this so we can replace the inline filter text rather than inserting it at the current caret
// aka the difference between a slash command and using the + menu which won't have filter text
const PromptCompletionAnchorContext = createContext<Position | null>(null);

function matchMimeType(mimeType: string, acceptedMimeTypes: string[]): boolean {
  return acceptedMimeTypes.some(type => {
    if (type === '*/*') {
      return true;
    }
    if (type.endsWith('/*')) {
      return mimeType.startsWith(type.slice(0, -2));
    }
    return mimeType === type;
  });
}

export function PromptField(props: PromptFieldProps) {
  let {
    children,
    acceptedAttachmentTypes,
    isGenerating,
    onStop,
    styles,
    onAddAttachments,
    onRemoveAttachments,
    variant = 'balanced'
  } = props;
  let [prompt, setPrompt] = useControlledState(
    props.value,
    props.defaultValue ?? new AutoLinkingSegmentList([]),
    props.onChange
  );
  let [attachments, setAttachments] = useControlledState(
    props.attachments,
    props.defaultAttachments ?? [],
    props.onAttachmentsChange
  );

  // Not using RAC DropZone because it adds its own focusable button,
  // and we want to avoid an extra tab. We support pasting files directly into the input.
  let inputRef = useRef<HTMLDivElement>(null);
  let {dropProps, isDropTarget} = useDrop({
    ref: inputRef,
    hasDropButton: true,
    isDisabled: !acceptedAttachmentTypes,
    getDropOperation(types) {
      return acceptedAttachmentTypes && types.has(acceptedAttachmentTypes) ? 'copy' : 'cancel';
    },
    async onDrop(e) {
      let files = await Promise.all(
        e.items
          .filter(isFileDropItem)
          .filter(item => matchMimeType(item.type, acceptedAttachmentTypes!))
          .map(async item => ({
            id: crypto.randomUUID(),
            file: await item.getFile(),
            image: item.type.startsWith('image/') ? URL.createObjectURL(await item.getFile()) : ''
          }))
      );
      onAddAttachments?.(files);
      setAttachments(attachments => [...attachments, ...files]);
    }
  });

  let [isListening, setListening] = useState(false);
  let {onFocusChange} = useContext(PromptFocusContext);
  let {focusWithinProps} = useFocusWithin({onFocusWithinChange: onFocusChange});

  let isPromptControlled = props.value !== undefined;
  let isAttachmentsControlled = props.attachments !== undefined;
  let onSubmit = () => {
    if (prompt.segments.length === 0) {
      return;
    }

    props.onSubmit?.(prompt, attachments);
    if (!isPromptControlled) {
      setPrompt(new AutoLinkingSegmentList([]));
    }
    if (!isAttachmentsControlled) {
      setAttachments([]);
    }
    inputRef.current?.focus();
  };

  return (
    <PromptFieldContext.Provider
      value={{
        attachments,
        setAttachments,
        acceptedAttachmentTypes,
        prompt,
        setPrompt,
        inputRef,
        onSubmit,
        isGenerating: isGenerating ?? false,
        isListening,
        setListening,
        onStop,
        onAddAttachments,
        onRemoveAttachments
      }}>
      <div {...focusWithinProps}>
        <PromptFieldContainer
          {...dropProps}
          role="group"
          variant={variant}
          isGenerating={isGenerating ?? false}
          isDropTarget={isDropTarget}
          styles={styles}
          inputRef={inputRef}>
          {children}
        </PromptFieldContainer>
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
    </PromptFieldContext.Provider>
  );
}

export interface PromptFieldAttachmentListProps extends AttachmentListProps<PromptFieldAttachment> {
  children?: (attachment: PromptFieldAttachment) => React.ReactNode;
}

export function PromptFieldAttachmentList(props: PromptFieldAttachmentListProps) {
  let {children} = props;
  let {attachments, setAttachments, onRemoveAttachments, inputRef} = useContext(PromptFieldContext);
  if (attachments.length === 0) {
    return null;
  }

  return (
    <AttachmentList
      {...props}
      aria-label="Attachments"
      onRemove={keys => {
        let removedAttachments = attachments.filter(attachment => keys.has(attachment.id));
        onRemoveAttachments?.(removedAttachments);
        setAttachments(attachments => attachments.filter(attachment => !keys.has(attachment.id)));
        if (removedAttachments.length === attachments.length) {
          inputRef.current?.focus();
        }
      }}
      items={attachments}>
      {children ||
        (attachment => (
          <Attachment>
            {attachment.image && <Image src={attachment.image} slot="thumbnail" />}
          </Attachment>
        ))}
    </AttachmentList>
  );
}

export interface PromptTokenFieldProps {
  completionTrigger?: RegExp;
  renderCompletions?: (
    filterValue: string
  ) => React.ReactNode[] | null | Promise<React.ReactNode[] | null>;
  children?: (segment: TokenSegment) => React.ReactElement;
  pixelLoader?: Cell[] | Cell[][];
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function PromptTokenField(props: PromptTokenFieldProps) {
  let {completionTrigger, renderCompletions, children, pixelLoader, placeholder, onKeyDown} = props;
  let {
    prompt,
    setPrompt,
    acceptedAttachmentTypes,
    setAttachments,
    onAddAttachments,
    inputRef,
    onSubmit,
    isGenerating,
    isListening
  } = useContext(PromptFieldContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let [isFocused, setFocused] = useState(false);

  let [filterAnchor, filterValue] = useMemo(() => {
    if (completionTrigger) {
      let filterAnchor = prompt.findText(
        prompt.caretPosition,
        Direction.Backward,
        completionTrigger
      );
      if (filterAnchor != null) {
        let filterValue = prompt.slice(filterAnchor, prompt.caretPosition).toString();
        return [filterAnchor, filterValue];
      }
    }
    return [null, null];
  }, [completionTrigger, prompt]);

  let items = useMemo(() => {
    return filterValue != null ? renderCompletions?.(filterValue) : null;
  }, [filterValue, renderCompletions]);

  return (
    <div
      className={style({
        display: 'flex',
        gap: 12,
        alignItems: 'baseline',
        color: {
          default: 'transparent-overlay-600',
          isFocused: 'body'
        },
        transition: 'default',
        transitionDuration: 350,
        paddingStart: 4,
        width: 'full'
      })({isFocused: isFocused || prompt.segments.length > 0})}>
      <CenterBaseline>
        <PixelLoader playing={isGenerating} icon={pixelLoader} />
      </CenterBaseline>
      <Autocomplete>
        <TokenField
          value={prompt}
          onChange={setPrompt}
          multiline
          aria-label="Prompt"
          data-placeholder={placeholder || stringFormatter.format('promptfield.placeholder')}
          isReadOnly={isListening}
          onKeyDown={onKeyDown}
          ref={inputRef}
          onFocus={e => {
            if (e.isTrusted) {
              setFocused(true);
            }
          }}
          onBlur={e => {
            if (e.isTrusted) {
              setFocused(false);
            }
          }}
          onPaste={
            acceptedAttachmentTypes
              ? e => {
                  let clipboardData = e.clipboardData as DataTransfer;
                  let attachments: PromptFieldAttachment[] = [];
                  for (let item of clipboardData.items) {
                    if (matchMimeType(item.type, acceptedAttachmentTypes)) {
                      let file = item.getAsFile()!;
                      attachments.push({
                        id: crypto.randomUUID(),
                        file,
                        image: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
                      });
                    }
                  }
                  if (attachments.length > 0) {
                    onAddAttachments?.(attachments);
                    setAttachments(prev => [...prev, ...attachments]);
                  }
                }
              : undefined
          }
          onSubmit={onSubmit}
          className={
            css('&:empty::before { content: attr(data-placeholder); }') +
            style({
              flexGrow: 1,
              font: 'body',
              color: {
                default: 'gray-800',
                ':empty': {
                  default: 'transparent-overlay-600',
                  forcedColors: 'GrayText'
                }
              },
              width: 'full',
              outlineStyle: 'none',
              cursor: 'text'
            })
          }>
          {children || (segment => <PromptToken>{segment.text}</PromptToken>)}
        </TokenField>
        <PromptTokenFieldPopover
          filterAnchor={filterAnchor}
          items={useDeferredValue(items)}
          isFocused={isFocused}
        />
      </Autocomplete>
    </div>
  );
}

export interface PromptTokenFieldPopoverProps extends PopoverProps {
  filterAnchor?: Position | null;
  items?: React.ReactNode[] | null | Promise<React.ReactNode[] | null>;
  isFocused?: boolean;
}

function PromptTokenFieldPopover(props: PromptTokenFieldPopoverProps) {
  let {filterAnchor, items, isFocused} = props;
  let {inputRef} = useContext(PromptFieldContext);

  let resolvedItems = items instanceof Promise ? use(items) : items;
  let isOpen =
    isFocused && filterAnchor != null && resolvedItems != null && resolvedItems.length > 0;

  // Cache items so that popover content doesn't flicker to empty while animating out
  let [menuItems, setMenuItems] = useState(resolvedItems);
  if (resolvedItems !== menuItems && resolvedItems != null && resolvedItems.length > 0) {
    setMenuItems(resolvedItems);
  }

  return (
    <Popover
      triggerRef={inputRef}
      isOpen={isOpen}
      isNonModal
      hideArrow
      placement="bottom start"
      getTargetRect={target => {
        return positionToDOMRange(target, filterAnchor!).getBoundingClientRect();
      }}>
      <PromptCompletionAnchorContext.Provider value={filterAnchor ?? null}>
        <Menu>{menuItems}</Menu>
      </PromptCompletionAnchorContext.Provider>
    </Popover>
  );
}

export interface PromptTokenProps extends Omit<TokenProps, 'children' | 'render'> {
  children: React.ReactNode;
}

export function PromptToken(props: PromptTokenProps) {
  return (
    <Token
      {...props}
      className={style({
        font: 'ui',
        backgroundColor: {
          default: 'transparent-overlay-1000/10',
          isSelected: 'blue-800',
          '::selection': 'transparent'
        },
        color: {
          default: 'body',
          isSelected: 'white'
        },
        outlineStyle: 'solid',
        outlineWidth: 1,
        outlineColor: 'transparent-overlay-1000/10',
        outlineOffset: -1,
        borderRadius: 'pill',
        boxShadow: `[inset 0 24px 32px 0 ${color('transparent-white-50')}, 0 8px 32px 0 ${color('transparent-black-50')}]`,
        paddingX: 8,
        paddingY: 4,
        lineHeight: '[1em]',
        cursor: 'default',
        '--iconPrimary': {
          type: 'fill',
          value: 'currentColor'
        },
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 4,
        verticalAlign: 'baseline'
      })}>
      <IconContext.Provider
        value={{
          styles: iconStyle({size: 'XS'}),
          render: icon => <CenterBaseline>{icon}</CenterBaseline>
        }}>
        {props.children}
      </IconContext.Provider>
    </Token>
  );
}

export interface PromptFieldToolbarProps {
  children: React.ReactNode;
}

export function PromptFieldToolbar(props: PromptFieldToolbarProps) {
  let {children} = props;
  return (
    <div
      className={style({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16
      })}>
      {children}
    </div>
  );
}

export interface PromptFieldSubmitButtonProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PromptFieldSubmitButton(props: PromptFieldSubmitButtonProps) {
  let {prompt, isGenerating, onSubmit, onStop} = useContext(PromptFieldContext);
  return (
    <Button
      variant="primary"
      staticColor="auto"
      // TODO: should it be possible to submit a prompt with only attachments?
      isDisabled={prompt.segments.length === 0 && !isGenerating}
      aria-label={isGenerating ? 'Stop' : 'Send'}
      onPress={isGenerating ? onStop : onSubmit}>
      {isGenerating ? <Stop /> : <Send />}
    </Button>
  );
}

export interface PromptFieldVoiceButtonProps {
  lang?: string;
  isDisabled?: boolean;
  // TODO: coworker renders a toast too, but this gives more flexibility
  onError?: (code: VoiceInputErrorCode) => void;
}

export function PromptFieldVoiceButton(props: PromptFieldVoiceButtonProps) {
  let {lang, isDisabled: isDisabledProp, onError} = props;
  let {prompt, setPrompt, inputRef, setListening} = useContext(PromptFieldContext);
  let isDisabled = isDisabledProp;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');

  let basePromptRef = useRef<TokenSegmentList>(prompt);
  let updateBasePrompt = useEffectEvent(() => {
    basePromptRef.current = prompt;
  });

  let {
    isSupported,
    isListening: isVoiceListening,
    errorCode,
    transcript,
    toggle,
    stop
  } = useVoiceInput({lang});

  let restoreFocus = useEffectEvent(() => {
    if (!inputRef.current) {
      return;
    }
    // similar to useInsertPromptSegment, calling programatic focus on the input causes the caret positioning
    // to be inaccurate
    let finalPrompt = buildVoicePrompt(basePromptRef.current, transcript);
    inputRef.current.focus();
    setCursor(inputRef.current, finalPrompt.caretPosition);
    setPrompt(finalPrompt);
  });

  let wasListeningRef = useRef(false);
  useEffect(() => {
    if (isVoiceListening) {
      updateBasePrompt();
      wasListeningRef.current = true;
    } else if (wasListeningRef.current) {
      wasListeningRef.current = false;
      restoreFocus();
    }
    setListening(isVoiceListening);
  }, [isVoiceListening, setListening]);

  useEffect(() => {
    if (!transcript || !isVoiceListening) {
      return;
    }
    setPrompt(buildVoicePrompt(basePromptRef.current, transcript));
  }, [transcript, isVoiceListening, setPrompt]);

  // TODO this is from coworker, is to stop mutating the input text since the button becomes disabled when the chat
  // is streaming, keep it?
  useEffect(() => {
    if (isDisabled && isVoiceListening) {
      stop();
    }
  }, [isDisabled, isVoiceListening, stop]);

  useEffect(() => {
    if (errorCode) {
      onError?.(errorCode);
    }
  }, [errorCode, onError]);

  if (!isSupported) {
    return null;
  }

  let label = isVoiceListening
    ? stringFormatter.format('voicebutton.stopListening')
    : stringFormatter.format('voicebutton.startListening');

  return (
    <TooltipTrigger>
      <ToggleButton
        isQuiet
        isSelected={isVoiceListening}
        isDisabled={isDisabled}
        aria-label={label}
        onPress={toggle}>
        <Microphone />
      </ToggleButton>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}

function buildVoicePrompt(base: TokenSegmentList, voiceText: string): AutoLinkingSegmentList {
  if (!voiceText) {
    return base as AutoLinkingSegmentList;
  }
  let segments: TokenFieldSegment[] = [...base.segments, {type: 'text', text: voiceText}];
  return new AutoLinkingSegmentList(segments, {
    caretPosition: {index: segments.length - 1, offset: voiceText.length}
  });
}

export interface InsertMenuItemProps {
  children: React.ReactNode;
}

export function InsertMenuButton(props: InsertMenuItemProps) {
  let {children} = props;
  return (
    <MenuTrigger>
      <ActionButton isQuiet staticColor="auto" aria-label="Add">
        <Plus />
      </ActionButton>
      <Menu>{children}</Menu>
    </MenuTrigger>
  );
}

export function AttachFileMenuItem() {
  let {acceptedAttachmentTypes, setAttachments, onAddAttachments} = useContext(PromptFieldContext);
  return (
    <MenuItem
      onAction={() => {
        let input = document.createElement('input');
        input.type = 'file';
        if (acceptedAttachmentTypes) {
          input.accept = acceptedAttachmentTypes.join(',');
        }
        input.multiple = true;
        input.onchange = e => {
          let files = (e.currentTarget as HTMLInputElement).files;
          if (files && acceptedAttachmentTypes) {
            let attachments = Array.from(files)
              .filter(file => matchMimeType(file.type, acceptedAttachmentTypes))
              .map(file => ({
                id: crypto.randomUUID(),
                file,
                image: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
              }));
            if (attachments.length > 0) {
              onAddAttachments?.(attachments);
              setAttachments(prev => [...prev, ...attachments]);
            }
          }
        };
        input.click();
      }}>
      <Attach />
      <Text>Attach a file</Text>
    </MenuItem>
  );
}

// either replace the filter text (aka token replace) or insert value at current caret position (aka plain text inject)
function useInsertPromptSegment(buildSegments: (item: any) => TokenFieldSegment[]) {
  let {setPrompt, inputRef} = useContext(PromptFieldContext);
  let anchor = useContext(PromptCompletionAnchorContext);
  let pendingCaret = useRef<Position | null>(null);
  return (item: any) => {
    setPrompt(value => {
      let newValue = value.replaceRangeWithSegments(
        anchor ?? value.caretPosition,
        value.caretPosition,
        buildSegments(item),
        false // Don't coalesce in undo/redo history.
      );
      pendingCaret.current = newValue.caretPosition;
      return newValue;
    });

    if (anchor == null) {
      // Wait for popover animation, then restore cursor to after the inserted content.
      setTimeout(() => {
        if (inputRef.current && pendingCaret.current) {
          let position = pendingCaret.current;
          pendingCaret.current = null;
          inputRef.current.focus();
          setCursor(inputRef.current, position);
          // TODO: double check this, claude debugged this one, but essentially reproduced with plain text insertion commands
          // triggered one after another
          // focus() fires a synchronous selectionchange before setCursor can set
          // isProgrammaticSelectionChange, which resets caretPosition to {0,0} in
          // TokenField's useSelectionChange handler. Re-assert the correct position.
          setPrompt(value => value.withCaretPosition(position));
        }
      }, 400);
    }
  };
}

export function InsertTokenMenuItem(props: MenuItemProps) {
  let insert = useInsertPromptSegment(item => [
    {type: 'token', text: 'command' in item ? item.command : item.title, value: item},
    {type: 'text', text: ' '}
  ]);

  return <MenuItem {...props} onAction={() => insert(props.value)} />;
}

export function InsertTextMenuItem(props: MenuItemProps) {
  let insert = useInsertPromptSegment(item => [
    {type: 'text', text: `${'command' in item ? item.command : item.title} `}
  ]);

  return <MenuItem {...props} onAction={() => insert(props.value)} />;
}

// specifically for menu items that only trigger a callback in the autocomplete menu
// since they dont end up inserting a token or text, we need to clear the partial text that the user used
// to filter the menu
export function InsertCallbackMenuItem(props: MenuItemProps) {
  let insert = useInsertPromptSegment(() => []);
  return (
    <MenuItem
      {...props}
      onAction={() => {
        insert(undefined);
        props.onAction?.();
      }}
    />
  );
}
