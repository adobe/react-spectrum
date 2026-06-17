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
import Attach from '@react-spectrum/s2/icons/Attach';
import {Attachment, AttachmentList, AttachmentListProps} from './AttachmentList';
import {Autocomplete} from 'react-aria-components/Autocomplete';
import {baseColor, css, style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button} from '@react-spectrum/s2/Button';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import {
  createContext,
  createRef,
  use,
  useContext,
  useDeferredValue,
  useMemo,
  useRef,
  useState
} from 'react';
// eslint-disable-next-line
import {
  Direction,
  Position,
  TokenFieldSegment,
  TokenSegment,
  TokenSegmentList
} from './TokenSegmentList';
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {Group} from 'react-aria-components/Group';
import {IconContext, mergeStyles} from '@react-spectrum/s2';
import {Image, Text} from '@react-spectrum/s2/Card';
import {isFileDropItem, useDrop} from 'react-aria-components/useDrop';
import {isFocusable} from 'react-aria/private/utils/isFocusable';
import {Link} from '@react-spectrum/s2/Link';
import {Menu, MenuItem, MenuItemProps, MenuTrigger} from '@react-spectrum/s2/Menu';
// eslint-disable-next-line
import Plus from '@react-spectrum/s2/icons/Add';
import {Popover, PopoverProps} from '@react-spectrum/s2/Popover';
import {positionToDOMRange, Token, TokenField, TokenProps} from './TokenField';
import {PromptFocusContext} from './Chat';
import Send from '@react-spectrum/s2/icons/ArrowUpSend';
import Stop from '@react-spectrum/s2/icons/StopProcessing';
import {useFocusWithin} from 'react-aria/useFocusWithin';

export interface PromptFieldAttachment {
  id: string;
  file: File;
  image: string;
}

export interface PromptFieldProps {
  children: React.ReactNode;
  acceptedAttachmentTypes?: string[];
  onSubmit?: (prompt: TokenSegmentList, attachments: PromptFieldAttachment[]) => void;
  isGenerating?: boolean;
  onStop?: () => void;
  onAddAttachments?: (attachments: PromptFieldAttachment[]) => void;
  onRemoveAttachments?: (attachments: PromptFieldAttachment[]) => void;
  styles?: StyleString;
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
}

// TODO: make this customizable
const tokenRegex = /(?<=\s|^)(https?:\/\/)?(www\.)?([^/\s]+\.[a-z]{2,}(\/\S+)?)(?=\s)/g;
class AutoLinkingSegmentList extends TokenSegmentList {
  tokenize(text: string): TokenFieldSegment[] {
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
}

const PromptFieldContext = createContext<PromptFieldState>({
  attachments: [],
  setAttachments: () => {},
  prompt: new AutoLinkingSegmentList([]),
  setPrompt: () => {},
  inputRef: createRef(),
  isGenerating: false
});

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
    onRemoveAttachments
  } = props;
  let [prompt, setPrompt] = useState<TokenSegmentList>(new AutoLinkingSegmentList([]));
  let [attachments, setAttachments] = useState<PromptFieldAttachment[]>([]);

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

  let {onFocusChange} = useContext(PromptFocusContext);
  let {focusWithinProps} = useFocusWithin({onFocusWithinChange: onFocusChange});

  let onSubmit = () => {
    if (prompt.segments.length === 0) {
      return;
    }

    props.onSubmit?.(prompt, attachments);
    setPrompt(new AutoLinkingSegmentList([]));
    setAttachments([]);
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
        onStop,
        onAddAttachments,
        onRemoveAttachments
      }}>
      <div {...focusWithinProps}>
        <Group
          {...dropProps}
          role="group"
          className={renderProps =>
            mergeStyles(
              style({
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
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
                  isDropTarget: 'blue-800'
                },
                cursor: 'text'
              })({...renderProps, isDropTarget}),
              styles
            )
          }
          onPointerDown={e => {
            // If not clicking on something focusable within the prompt field, focus the input.
            let target = getEventTarget(e) as Element | null;
            while (target && target !== e.currentTarget && !isFocusable(target)) {
              target = target.parentElement;
            }

            if (target === e.currentTarget) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}>
          {children}
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
}

export function PromptTokenField(props: PromptTokenFieldProps) {
  let {completionTrigger, renderCompletions, children} = props;
  let {
    prompt,
    setPrompt,
    acceptedAttachmentTypes,
    setAttachments,
    onAddAttachments,
    inputRef,
    onSubmit
  } = useContext(PromptFieldContext);
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
    <Autocomplete>
      <TokenField
        value={prompt}
        onChange={setPrompt}
        multiline
        aria-label="Prompt"
        data-placeholder="Ready to get started? Ask a question, share an idea, or add a task."
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
        className={renderProps =>
          css('&:empty::before { content: attr(data-placeholder); }') +
          style({
            font: 'body',
            color: {
              default: baseColor('neutral'),
              ':empty': {
                default: 'gray-600',
                forcedColors: 'GrayText'
              }
            },
            width: 'full',
            outlineStyle: 'none',
            cursor: 'text'
          })(renderProps)
        }>
        {children || (segment => <PromptToken>{segment.text}</PromptToken>)}
      </TokenField>
      <PromptTokenFieldPopover
        filterAnchor={filterAnchor}
        items={useDeferredValue(items)}
        isFocused={isFocused}
      />
    </Autocomplete>
  );
}

export interface PromptTokenFieldPopoverProps extends PopoverProps {
  filterAnchor?: Position | null;
  items?: React.ReactNode[] | null | Promise<React.ReactNode[] | null>;
  isFocused?: boolean;
}

function PromptTokenFieldPopover(props: PromptTokenFieldPopoverProps) {
  let {filterAnchor, items, isFocused} = props;
  let {inputRef, setPrompt} = useContext(PromptFieldContext);

  let resolvedItems = items instanceof Promise ? use(items) : items;
  let isOpen =
    isFocused && filterAnchor != null && resolvedItems != null && resolvedItems.length > 0;

  // Cache items so that popover content doesn't flicker to empty while animating out
  let [menuItems, setMenuItems] = useState(resolvedItems);
  if (resolvedItems !== menuItems && resolvedItems != null && resolvedItems.length > 0) {
    setMenuItems(resolvedItems);
  }

  let onAction = (item: any) => {
    setPrompt(value =>
      value.replaceRangeWithSegments(
        filterAnchor!,
        value.caretPosition,
        [
          {
            type: 'token',
            text: 'command' in item ? item.command : item.title,
            value: item
          },
          {type: 'text', text: ' '}
        ],
        false // Don't coalesce in undo/redo history.
      )
    );
  };

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
      <Menu onAction={(key, value) => onAction(value)}>{menuItems}</Menu>
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
        backgroundColor: {
          default: 'blue-300',
          isSelected: 'blue-800',
          '::selection': 'transparent'
        },
        color: {
          default: 'blue-1000',
          isSelected: 'white'
        },
        borderRadius: 'sm',
        paddingX: 4,
        paddingY: 2,
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
      <IconContext.Provider value={{render: icon => <CenterBaseline>{icon}</CenterBaseline>}}>
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
      // TODO: should it be possible to submit a prompt with only attachments?
      isDisabled={prompt.segments.length === 0 && !isGenerating}
      aria-label={isGenerating ? 'Stop' : 'Send'}
      onPress={isGenerating ? onStop : onSubmit}>
      {isGenerating ? <Stop /> : <Send />}
    </Button>
  );
}

export interface InsertMenuItemProps {
  children: React.ReactNode;
}

export function InsertMenuButton(props: InsertMenuItemProps) {
  let {children} = props;
  return (
    <MenuTrigger>
      <ActionButton isQuiet aria-label="Add">
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

export function InsertTokenMenuItem(props: MenuItemProps) {
  let {setPrompt, inputRef} = useContext(PromptFieldContext);
  let onAction = (item: any) => {
    setPrompt(value =>
      value.replaceRangeWithSegments(
        value.caretPosition,
        value.caretPosition,
        [
          {
            type: 'token',
            text: 'command' in item ? item.command : item.title,
            value: item
          },
          {type: 'text', text: ' '}
        ],
        false // Don't coalesce in undo/redo history.
      )
    );

    // Wait for popover animation
    setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
  };

  return <MenuItem {...props} onAction={() => onAction(props.value)} />;
}
